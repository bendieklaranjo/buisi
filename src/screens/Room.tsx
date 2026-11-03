import { useEffect, useRef, useState } from "react";
import { Icon, Tick } from "../components/Icon";
import { ModeChip } from "../components/ModeChip";
import { Progress } from "../components/Progress";
import { TopBar } from "../components/TopBar";
import { floorLabel } from "../domain/fields";
import type { Box, Element } from "../domain/types";
import { t, useLang } from "../i18n";
import { createElement } from "../lib/elements";
import { canvasToBlob, cropAround, loadImage, preparePhoto } from "../lib/images";
import { home, navigate } from "../lib/nav";
import { DEFAULT_TOLERANCE, createEngine, maskArea, maskBox, type Point, type SegEngine } from "../lib/segmentation";
import { elementsOf, photoUrl, putPhoto, saveElement, saveProject, useData } from "../lib/store";
import { onPause } from "../lib/timing";
import { toast } from "../lib/toast";
import { roomTitle, useName } from "./Floors";

/**
 * A box being placed. Assisted mode: tap = automatic box around the tapped element
 * (region growing, no model), drag = draw the box by hand.
 */
interface Pending { box: Box; auto?: { pt: Point; tol: number; leaked: boolean }; taps: number; segStart: number }

let lastTol = DEFAULT_TOLERANCE;
const BOX = "#809EC2";

export function RoomScreen({ pid, roomId }: { pid: string; roomId: string }) {
  useLang();
  const { projects } = useData();
  const p = projects[pid];
  const r = p?.rooms.find(x => x.id === roomId);
  const elements = p && r ? elementsOf(p.id, r.id) : [];
  const assisted = p?.mode === "assisted";

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [engine, setEngine] = useState<SegEngine | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [drag, setDrag] = useState<{ a: Point; b: Point } | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const down = useRef<{ pt: Point; x: number; y: number } | null>(null);

  // load the room photo and prepare the automatic box
  useEffect(() => {
    let live = true; setImg(null); setEngine(null);
    if (!r?.photoId) return;
    void (async () => {
      const url = await photoUrl(r.photoId!); if (!url || !live) return;
      try {
        const im = await loadImage(url); if (!live) return; setImg(im);
        if (assisted) { const eng = createEngine(); await eng.prepare(im); if (live) setEngine(eng); }
      } catch { setStatus(t("rm.photoError")); }
    })();
    return () => { live = false; };
  }, [r?.photoId, assisted]);

  // keep timing honest while the app is in the background
  useEffect(() => onPause((hidden, ms) => { if (!hidden && ms) setPending(pd => (pd ? { ...pd, segStart: pd.segStart + ms } : pd)); }), []);

  // draw photo, saved boxes, the pending box and the box being dragged
  useEffect(() => {
    const cv = canvasRef.current; if (!cv || !img || !r) return;
    const draw = () => {
      const cw = cv.parentElement!.clientWidth, ch = Math.round(cw * img.naturalHeight / img.naturalWidth);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = cw * dpr; cv.height = ch * dpr; cv.style.height = ch + "px";
      const ctx = cv.getContext("2d")!; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(img, 0, 0, cw, ch);
      elements.forEach((e, i) => drawSaved(ctx, e, i + 1, cw, ch));
      const b = drag ? boxOf(drag.a, drag.b) : pending?.box;
      if (b) {
        ctx.fillStyle = BOX + "33"; ctx.fillRect(b[0] * cw, b[1] * ch, b[2] * cw, b[3] * ch);
        ctx.setLineDash(drag ? [6, 4] : []); ctx.lineWidth = 2.5; ctx.strokeStyle = BOX; ctx.strokeRect(b[0] * cw, b[1] * ch, b[2] * cw, b[3] * ch); ctx.setLineDash([]);
      }
      if (pending?.auto && !drag) dot(ctx, pending.auto.pt.x * cw, pending.auto.pt.y * ch);
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  });

  if (!p || !r) return null;
  const all = elementsOf(p.id), saved = all.filter(e => e.status === "saved").length;
  const sameFloor = p.rooms.filter(x => x.floor === r.floor);
  const nextRoom = sameFloor[sameFloor.findIndex(x => x.id === r.id) + 1];
  const goNextRoom = () => (nextRoom ? navigate({ name: "room", pid, roomId: nextRoom.id }) : navigate({ name: "addRoom", pid, floor: r.floor }));

  const autoBox = (pt: Point, tol: number): { box: Box; leaked: boolean } | null => {
    if (!engine) return null;
    const res = engine.segment({ positive: [pt], negative: [], tolerance: tol });
    if (!maskArea(res.mask)) return null;
    const mb = maskBox(res.mask, res.w, res.h); if (!mb) return null;
    const pad = 0.01; // a little margin around the element
    const x = Math.max(0, mb[0] - pad), y = Math.max(0, mb[1] - pad);
    return { box: [x, y, Math.min(1 - x, mb[2] + 2 * pad), Math.min(1 - y, mb[3] + 2 * pad)], leaked: res.leaked };
  };

  const rel = (ev: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = ev.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height)) };
  };
  const onDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!assisted || !img) return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    down.current = { pt: rel(ev), x: ev.clientX, y: ev.clientY };
  };
  const onMove = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const d = down.current; if (!d) return;
    if (Math.hypot(ev.clientX - d.x, ev.clientY - d.y) > 10) setDrag({ a: d.pt, b: rel(ev) });
  };
  const onUp = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const d = down.current; down.current = null; if (!d) return;
    const taps = (pending?.taps ?? 0) + 1, segStart = pending?.segStart ?? Date.now();
    if (drag) {
      const b = boxOf(drag.a, rel(ev)); setDrag(null);
      if (b[2] > 0.02 && b[3] > 0.02) setPending({ box: b, taps, segStart });
      return;
    }
    const a = autoBox(d.pt, lastTol);
    if (a) setPending({ box: a.box, auto: { pt: d.pt, tol: lastTol, leaked: a.leaked }, taps, segStart });
  };

  const confirm = async () => {
    if (!pending) { toast(t("rm.boxEmpty")); return; }
    const e = createElement(p, r, { box: pending.box, taps: pending.taps, segStart: pending.segStart });
    setPending(null);
    // the crop becomes the first photo (Frontalansicht) – replaceable on the element screen
    if (img) {
      try { const blob = await canvasToBlob(cropAround(img, pending.box, 0.04).canvas); e.photoIds = [await putPhoto(blob)]; saveElement(e); }
      catch { /* the element still works without the crop */ }
    }
    navigate({ name: "element", pid, elementId: e.id, step: 0 });
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    setBusy(true); setStatus(t("rm.saving"));
    try {
      const ph = await preparePhoto(file, 1600);
      r.photoId = await putPhoto(ph.blob); r.photoW = ph.w; r.photoH = ph.h;
      saveProject(p); setPending(null); setStatus("");
    } catch { setStatus(t("err.photoFormat")); }
    finally { setBusy(false); }
  };

  const hintText = pending ? (pending.auto?.leaked ? t("rm.leaked") : t("rm.check")) : status || t("rm.hint");

  return (
    <>
      <TopBar title={roomTitle(r)} onBack={() => navigate({ name: "floors", pid })} onHome={() => home(pid)}>
        <button className="btn sm ghost next-room" onClick={goNextRoom}>{t("rm.next")}</button>
      </TopBar>
      <Progress value={saved} max={Math.max(1, all.length)} label={t("inv.progress", { saved, total: all.length })} />
      <main className="wrap">
        <div className="row"><span className="tag pill">{r.tag}</span><span className="small muted">{floorLabel(r.floor)} · {useName(r)}</span><span style={{ marginLeft: "auto" }}><ModeChip project={p} back={{ name: "room", pid, roomId }} /></span></div>

        {!r.photoId ? (
          <>
            <label className="photo-slot" style={{ minHeight: 200 }}>
              <span><Icon name="cam" size={34} /><br /><b>{t("rm.photo")}</b><br /><span className="small">{t("rm.photoHint")}</span></span>
              <input type="file" accept="image/*,.heic,.heif" capture="environment" aria-label={t("rm.photo")} onChange={e => onPhoto(e.target.files?.[0])} />
            </label>
            {(busy || status) && <div className={"status" + (busy ? " busy" : "")}>{status}</div>}
          </>
        ) : (
          <>
            <div className="canvas-wrap"><canvas ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { down.current = null; setDrag(null); }} aria-label={t("rm.hint")} /></div>
            {assisted ? (
              <>
                <div className={"status" + (busy || (!engine && !!img) ? " busy" : "")}>{!engine && img ? t("rm.preparing") : hintText}</div>
                {pending ? (
                  <>
                    {pending.auto && (
                      <label className="slider" htmlFor="tol">{t("rm.tolerance")}
                        <input id="tol" type="range" min={4} max={40} value={pending.auto.tol} onChange={e => {
                          lastTol = +e.target.value; const a = autoBox(pending.auto!.pt, lastTol);
                          if (a) setPending({ ...pending, box: a.box, auto: { ...pending.auto!, tol: lastTol, leaked: a.leaked } });
                        }} />
                        <span className="timer">{pending.auto.tol}</span>
                      </label>
                    )}
                    <div className="row">
                      <button className="btn ghost grow" onClick={() => setPending(null)}>{t("rm.discard")}</button>
                      <button className="btn primary grow" onClick={confirm}><Icon name="check" /> {t("rm.create")}</button>
                    </div>
                  </>
                ) : (
                  <div className="row">
                    <label className="btn ghost" style={{ position: "relative" }}><Icon name="cam" /> {t("rm.retake")}
                      <input type="file" accept="image/*,.heic,.heif" capture="environment" style={{ position: "absolute", inset: 0, opacity: 0 }} aria-label={t("rm.retake")} onChange={e => onPhoto(e.target.files?.[0])} />
                    </label>
                  </div>
                )}
              </>
            ) : <p className="small muted">{t("rm.manualMode")}</p>}
          </>
        )}

        <div className="section-title"><h3>{t("rm.list")}</h3></div>
        <div className="list">
          {elements.length === 0 ? <div className="empty">{assisted && r.photoId ? t("rm.emptyTap") : t("rm.empty")}</div>
            : elements.map((e, i) => (
              <button key={e.id} className="li" onClick={() => navigate({ name: "element", pid, elementId: e.id, step: 0 })}>
                <span className="swatch num" style={{ background: e.color }}>{i + 1}</span>
                <div className="grow"><div className="t">{e.fields.bezeichnung || e.fields.bauteiltyp || t("rm.unnamed")}</div>
                  <div className="s">{[e.fields.bauteilId, e.fields.ebkp, e.fields.menge ? `${e.fields.menge} ${e.fields.einheit ?? ""}` : ""].filter(Boolean).join(" · ") || (e.status === "saved" ? "" : t("rm.notDone"))}</div></div>
                {e.status === "saved" ? <Tick /> : <span className="pill">{t("rm.open")}</span>}
              </button>
            ))}
        </div>
        <button className="btn block" onClick={() => { const e = createElement(p, r); navigate({ name: "element", pid, elementId: e.id, step: 0 }); }}><Icon name="plus" /> {t("rm.addManual")}</button>
      </main>
    </>
  );
}

const boxOf = (a: Point, b: Point): Box => [Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(a.x - b.x), Math.abs(a.y - b.y)];

function drawSaved(ctx: CanvasRenderingContext2D, e: Element, n: number, cw: number, ch: number) {
  if (!e.box) return;
  const [x, y, w, h] = e.box;
  ctx.lineWidth = 2.5; ctx.strokeStyle = e.color; ctx.strokeRect(x * cw, y * ch, w * cw, h * ch);
  ctx.fillStyle = e.color + (e.status === "saved" ? "22" : "40"); ctx.fillRect(x * cw, y * ch, w * cw, h * ch);
  // number badge, with a tick once saved
  const bx = x * cw + 13, by = y * ch + 13;
  ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(bx, by, 11, 0, 7); ctx.fill();
  ctx.fillStyle = "#1B1F10"; ctx.font = "700 12px Inter, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(n), bx, by + 1);
  if (e.status === "saved") {
    const tx = (x + w) * cw - 13;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(tx, by, 10, 0, 7); ctx.fill();
    ctx.strokeStyle = "#444D26"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(tx - 5, by); ctx.lineTo(tx - 1, by + 4); ctx.lineTo(tx + 5, by - 4); ctx.stroke();
  }
  ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#444D26"; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
}
