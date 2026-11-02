import { useEffect, useRef, useState } from "react";
import { Icon, Tick } from "../components/Icon";
import { ModeChip } from "../components/ModeChip";
import { TopBar } from "../components/TopBar";
import { floorLabel } from "../domain/fields";
import type { Element } from "../domain/types";
import { createElement } from "../lib/elements";
import { canvasToBlob, cropAround, loadImage, preparePhoto } from "../lib/images";
import { navigate } from "../lib/nav";
import { DEFAULT_TOLERANCE, createEngine, decodeMask, encodeMask, maskArea, maskBox, maskOverlay, type Point, type SegEngine, type SegResult } from "../lib/segmentation";
import { elementsOf, photoUrl, putPhoto, saveElement, saveProject, useData } from "../lib/store";
import { onPause } from "../lib/timing";
import { toast } from "../lib/toast";

interface Pending {
  pos: Point[]; neg: Point[]; tol: number;
  taps: number; segStart: number; tapMode: "pos" | "neg"; result?: SegResult;
}

let lastTol = DEFAULT_TOLERANCE;
const overlayCache = new Map<string, HTMLCanvasElement>();

export function RoomScreen({ pid, roomId }: { pid: string; roomId: string }) {
  const { projects } = useData();
  const p = projects[pid];
  const r = p?.rooms.find(x => x.id === roomId);
  const elements = p && r ? elementsOf(p.id, r.id) : [];
  const assisted = p?.mode === "assisted";

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [engine, setEngine] = useState<SegEngine | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // load the room photo and prepare the outline engine
  useEffect(() => {
    let live = true; setImg(null); setEngine(null);
    if (!r?.photoId) return;
    void (async () => {
      const url = await photoUrl(r.photoId!); if (!url || !live) return;
      try {
        const im = await loadImage(url); if (!live) return; setImg(im);
        if (assisted) { const eng = createEngine(); await eng.prepare(im); if (live) setEngine(eng); }
      } catch { setStatus("The room photo could not be loaded. Retake it."); }
    })();
    return () => { live = false; };
  }, [r?.photoId, assisted]);

  // keep outline time honest while the app is in the background
  useEffect(() => onPause((hidden, ms) => { if (!hidden && ms) setPending(pd => (pd ? { ...pd, segStart: pd.segStart + ms } : pd)); }), []);

  // draw photo, saved outlines and the pending outline
  useEffect(() => {
    const cv = canvasRef.current; if (!cv || !img || !r) return;
    const draw = () => {
      const cw = cv.parentElement!.clientWidth, ch = Math.round(cw * img.naturalHeight / img.naturalWidth);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = cw * dpr; cv.height = ch * dpr; cv.style.height = ch + "px";
      const ctx = cv.getContext("2d")!; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(img, 0, 0, cw, ch);
      for (const e of elements) drawElement(ctx, e, cw, ch);
      const res = pending?.result;
      if (pending && res) {
        ctx.drawImage(maskOverlay(res.mask, res.w, res.h, "#7A9BC8", 0.5), 0, 0, cw, ch);
        for (const pt of pending.pos) dot(ctx, pt.x * cw, pt.y * ch, "#4C7A37", "+");
        for (const pt of pending.neg) dot(ctx, pt.x * cw, pt.y * ch, "#B0442C", "−");
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  });

  if (!p || !r) return null;

  const run = (pd: Pending): Pending => (engine ? { ...pd, result: engine.segment({ positive: pd.pos, negative: pd.neg, tolerance: pd.tol }) } : pd);

  const onTap = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    if (!assisted || !engine) return;
    const rect = ev.currentTarget.getBoundingClientRect();
    const pt = { x: (ev.clientX - rect.left) / rect.width, y: (ev.clientY - rect.top) / rect.height };
    if (!pending) {
      setPending(run({ pos: [pt], neg: [], tol: lastTol, taps: 1, segStart: Date.now(), tapMode: "pos" }));
    } else {
      const next = { ...pending, taps: pending.taps + 1 };
      if (pending.tapMode === "neg") next.neg = [...pending.neg, pt]; else next.pos = [...pending.pos, pt];
      setPending(run(next));
    }
  };

  const confirm = async () => {
    const res = pending?.result;
    if (!pending || !res || !maskArea(res.mask)) { toast("The outline is empty. Tap on the element."); return; }
    const box = maskBox(res.mask, res.w, res.h);
    const e = createElement(p, r, { mask: encodeMask(res.mask, res.w, res.h), box, taps: pending.taps, segStart: pending.segStart });
    setPending(null);
    // the crop from the room photo becomes the first photo (Frontalansicht) – replaceable on the element screen
    if (box && img) {
      try { const blob = await canvasToBlob(cropAround(img, box, 0.08).canvas); e.photoIds = [await putPhoto(blob)]; saveElement(e); }
      catch { /* the element still works without the crop */ }
    }
    navigate({ name: "element", pid, elementId: e.id });
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    setBusy(true); setStatus("Saving photo…");
    try {
      const ph = await preparePhoto(file, 1600);
      r.photoId = await putPhoto(ph.blob); r.photoW = ph.w; r.photoH = ph.h;
      saveProject(p); setPending(null); setStatus("");
    } catch (e) {
      setStatus((e as Error).message || "The photo could not be saved.");
    } finally { setBusy(false); }
  };

  const res = pending?.result;
  const hint = pending
    ? res?.leaked ? "The outline spread into the surroundings. Lower the tolerance or tap − on the wrong area."
      : res?.autoTolerance ? `Tolerance lowered to ${res.autoTolerance} at that spot so the outline stays on the element. Check it, then confirm.`
      : "Check the outline. Add or remove areas, then confirm."
    : status || "Tap an element in the photo to outline it.";

  return (
    <>
      <TopBar title={r.name || r.useLabel} onBack={() => navigate({ name: "floors", pid })}>
        <ModeChip project={p} back={{ name: "room", pid, roomId }} />
      </TopBar>
      <main className="wrap">
        <div className="row"><span className="tag pill">{r.tag}</span><span className="small muted">{floorLabel(r.floor)} · {r.useLabel}</span></div>

        {!r.photoId ? (
          <>
            <label className="photo-slot" style={{ minHeight: 200 }}>
              <span><Icon name="cam" size={34} /><br /><b>Take an image of the entire room</b><br /><span className="small">Stand in a corner and capture as much of the room as possible. JPEG, PNG and iPhone HEIC work.</span></span>
              <input type="file" accept="image/*,.heic,.heif" capture="environment" aria-label="Room photo" onChange={e => onPhoto(e.target.files?.[0])} />
            </label>
            {(busy || status) && <div className={"status" + (busy ? " busy" : "")}>{status}</div>}
          </>
        ) : (
          <>
            <div className="canvas-wrap"><canvas ref={canvasRef} onClick={onTap} aria-label="Room photo" /></div>
            {assisted ? (
              <>
                <div className={"status" + (busy || (!engine && !!img) ? " busy" : "")}>{!engine && img ? "Preparing outlines…" : hint}</div>
                {pending ? (
                  <>
                    <div className="tools">
                      <div className="seg" role="group" aria-label="Tap action">
                        <button type="button" aria-pressed={pending.tapMode === "pos"} onClick={() => setPending({ ...pending, tapMode: "pos" })}>+ Add area</button>
                        <button type="button" aria-pressed={pending.tapMode === "neg"} onClick={() => setPending({ ...pending, tapMode: "neg" })}>− Remove area</button>
                      </div>
                    </div>
                    <label className="slider" htmlFor="tol">Tolerance
                      <input id="tol" type="range" min={4} max={40} value={pending.tol} onChange={e => { lastTol = +e.target.value; setPending(run({ ...pending, tol: lastTol })); }} />
                      <span className="timer">{pending.tol}</span>
                    </label>
                    <div className="row">
                      <button className="btn ghost grow" onClick={() => setPending(null)}>Discard</button>
                      <button className="btn primary grow" onClick={confirm}><Icon name="check" /> Create element</button>
                    </div>
                  </>
                ) : (
                  <div className="row">
                    <label className="btn ghost" style={{ position: "relative" }}><Icon name="cam" /> Retake
                      <input type="file" accept="image/*,.heic,.heif" capture="environment" style={{ position: "absolute", inset: 0, opacity: 0 }} aria-label="Retake room photo" onChange={e => onPhoto(e.target.files?.[0])} />
                    </label>
                  </div>
                )}
              </>
            ) : <p className="small muted">Manual mode: outlines are off. Add each element by hand below.</p>}
          </>
        )}

        <div className="section-title"><h3>Within this room these elements have market demand</h3></div>
        <div className="list">
          {elements.length === 0 ? <div className="empty">{assisted && r.photoId ? "No elements yet. Tap one in the photo." : "No elements yet."}</div>
            : elements.map(e => (
              <button key={e.id} className="li" onClick={() => navigate({ name: "element", pid, elementId: e.id })}>
                <span className="swatch" style={{ background: e.color }} />
                <div className="grow"><div className="t">{e.fields.bezeichnung || "Unnamed element"}</div>
                  <div className="s">{[e.fields.bauteilId, e.fields.ebkp, e.fields.menge ? `${e.fields.menge} ${e.fields.einheit ?? ""}` : ""].filter(Boolean).join(" · ") || (e.status === "saved" ? "" : "Not yet documented")}</div></div>
                {e.status === "saved" ? <Tick /> : <span className="pill">open</span>}
              </button>
            ))}
        </div>
        <button className="btn block" onClick={() => { const e = createElement(p, r); navigate({ name: "element", pid, elementId: e.id }); }}><Icon name="plus" /> Add element manually</button>
      </main>
    </>
  );
}

function drawElement(ctx: CanvasRenderingContext2D, e: Element, cw: number, ch: number) {
  if (!e.mask) return;
  const key = e.id + e.status + e.mask.rle.length;
  let ov = overlayCache.get(key);
  if (!ov) { ov = maskOverlay(decodeMask(e.mask), e.mask.w, e.mask.h, e.color, e.status === "saved" ? 0.3 : 0.45); overlayCache.set(key, ov); }
  ctx.drawImage(ov, 0, 0, cw, ch);
  if (e.status === "saved" && e.box) {
    const bx = (e.box[0] + e.box[2]) * cw - 12, by = e.box[1] * ch + 12;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(bx, by, 10, 0, 7); ctx.fill();
    ctx.strokeStyle = "#4C7A37"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(bx - 5, by); ctx.lineTo(bx - 1, by + 4); ctx.lineTo(bx + 5, by - 4); ctx.stroke();
  }
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, col: string, ch: string) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "700 14px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(ch, x, y + 1); ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
}
