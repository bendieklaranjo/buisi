import { useEffect, useRef, useState, type FormEvent } from "react";
import { FieldInput } from "../components/FieldInput";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { FIELD_BY_KEY, ELEMENT_FIELDS, MUSS_KEYS, TYPE_DEFAULTS, floorLabel, missingMuss } from "../domain/fields";
import { AiError, aiStatus, fillFields } from "../lib/ai";
import { canvasToBlob, cropAround, loadImage, preparePhoto } from "../lib/images";
import { back } from "../lib/nav";
import { decodeMask, maskOverlay } from "../lib/segmentation";
import { deleteElement, getPhoto, photoUrl, putPhoto, saveElement, saveProject, useData, usePhotoUrl } from "../lib/store";
import { endClock, liveMs, startClock } from "../lib/timing";
import { toast } from "../lib/toast";

const NUMERIC = ["menge", "hoehe", "breite", "laenge"];

export function ElementScreen({ pid, elementId }: { pid: string; elementId: string }) {
  const { projects, elements } = useData();
  const p = projects[pid];
  const e = elements[elementId];
  const r = p?.rooms.find(x => x.id === e?.roomId);
  const [fields, setFields] = useState<Record<string, string>>(() => ({ ...(e?.fields ?? {}) }));
  const [clock, setClock] = useState("0:00");
  const [ai, setAi] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState(e?.aiNote ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cropRef = useRef<HTMLCanvasElement>(null);
  const roomImg = useRef<HTMLImageElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // time-study clock runs while this screen is open
  useEffect(() => {
    if (!e) return;
    startClock(e.id);
    const t = setInterval(() => { const s = Math.floor(liveMs(e.id) / 1000); setClock(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`); }, 1000);
    return () => { clearInterval(t); endClock(); abortRef.current?.abort(); };
  }, [e?.id]);

  useEffect(() => { void aiStatus().then(setAi); }, []);

  // crop of the room photo around the outline
  useEffect(() => {
    if (!e?.box || !r?.photoId) return;
    let live = true;
    void (async () => {
      const url = await photoUrl(r.photoId!); if (!url) return;
      const img = await loadImage(url); if (!live) return; roomImg.current = img;
      const crop = cropAround(img, e.box!); const cv = cropRef.current; if (!cv) return;
      cv.width = crop.canvas.width; cv.height = crop.canvas.height;
      const ctx = cv.getContext("2d")!; ctx.drawImage(crop.canvas, 0, 0);
      if (e.mask) {
        const ov = maskOverlay(decodeMask(e.mask), e.mask.w, e.mask.h, e.color, 0.28);
        const iw = img.naturalWidth, ih = img.naturalHeight;
        ctx.drawImage(ov, (crop.sx / iw) * e.mask.w, (crop.sy / ih) * e.mask.h, (crop.sw / iw) * e.mask.w, (crop.sh / ih) * e.mask.h, 0, 0, cv.width, cv.height);
      }
    })();
    return () => { live = false; };
  }, [e?.id, r?.photoId]);

  if (!p || !e) return null;
  const assisted = e.timing.mode === "assisted";
  const isAi = (k: string) => e.aiFields[k] !== undefined && e.aiFields[k] === (fields[k] ?? "") && (fields[k] ?? "") !== "";
  const missing = missingMuss(fields).length;

  const change = (k: string, v: string) => {
    const next = { ...fields, [k]: v };
    if (k === "elementType" && assisted) {
      for (const [dk, dv] of Object.entries(TYPE_DEFAULTS[v] ?? {})) if (!String(next[dk] ?? "").trim()) { next[dk] = dv; e.aiFields[dk] = dv; }
    }
    setFields(next);
    e.fields = next; saveElement(e);
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    toast(files.length > 1 ? `Saving ${files.length} photos…` : "Saving photo…");
    for (const f of Array.from(files)) { const ph = await preparePhoto(f, 1600); e.photoIds.push(await putPhoto(ph.blob)); }
    saveElement(e);
  };
  const removePhoto = (i: number) => { e.photoIds.splice(i, 1); saveElement(e); };

  const runAi = async () => {
    setAiBusy(true); setAiMsg("Looking at the element… usually 10–60 seconds.");
    const t0 = Date.now(); const ctl = new AbortController(); abortRef.current = ctl;
    try {
      const imgs: Blob[] = [];
      if (e.box && roomImg.current) imgs.push(await canvasToBlob(cropAround(roomImg.current, e.box).canvas));
      for (const id of e.photoIds.slice(0, 5 - imgs.length)) { const b = await getPhoto(id); if (b) imgs.push(b); }
      if (!imgs.length) { setAiMsg("Add at least one photo of the element first."); return; }
      const known = Object.fromEntries(Object.entries(fields).filter(([k, v]) => String(v).trim() && !isAi(k)));
      const res = await fillFields(imgs, !!(e.box && roomImg.current), known, p, r, ctl.signal);
      const next = { ...fields }; let n = 0;
      for (const def of ELEMENT_FIELDS) {
        const raw = res.fields?.[def.key];
        if (raw === undefined || raw === null || String(raw).trim() === "") continue;
        if (String(next[def.key] ?? "").trim() && !isAi(def.key)) continue; // never overwrite what the person typed
        let v = String(raw).trim();
        if (NUMERIC.includes(def.key)) { const num = parseFloat(v.replace(",", ".")); if (isNaN(num)) continue; v = String(def.key === "menge" ? num : Math.round(num)); }
        next[def.key] = v; e.aiFields[def.key] = v; n++;
      }
      setFields(next);
      e.fields = next; e.aiNote = res.note ? "AI note: " + String(res.note).slice(0, 240) : "";
      e.timing.aiUsed = true; e.timing.aiCount++; e.timing.aiFieldsFilled = n;
      setAiMsg(e.aiNote ?? ""); toast(`${n} fields filled. Check the blue ones.`);
    } catch (err) {
      setAiMsg(err instanceof AiError ? err.message : "The AI request failed.");
    } finally {
      e.timing.aiMs += Date.now() - t0; saveElement(e);
      setAiBusy(false); abortRef.current = null;
    }
  };

  const save = (ev: FormEvent) => {
    ev.preventDefault();
    e.fields = { ...fields };
    endClock(); // books the running time into e.timing.activeMs
    if (e.status !== "saved") {
      e.status = "saved"; e.savedAt = Date.now(); e.timing.firstSavedMs = e.timing.activeMs;
      const keys = Object.keys(e.aiFields);
      e.timing.aiFieldsKept = keys.filter(k => e.aiFields[k] === (e.fields[k] ?? "") && e.fields[k]).length;
      e.timing.corrections = keys.filter(k => e.aiFields[k] !== (e.fields[k] ?? "")).length;
      e.timing.mussFilled = MUSS_KEYS.length - missingMuss(e.fields).length;
    }
    saveElement(e); toast("Element saved"); back();
  };

  const remove = () => {
    endClock();
    const d = r?.detections.find(d => d.usedBy === e.id);
    if (d && p) { d.usedBy = null; saveProject(p); }
    deleteElement(e.id); back();
  };

  const f = (k: string) => <FieldInput key={k} def={FIELD_BY_KEY[k]} value={fields[k] ?? ""} aiFilled={isAi(k)} onChange={v => change(k, v)} />;

  return (
    <>
      <TopBar title={fields.elementType || "New element"} onBack={back}><span className="timer" aria-label="Active time on this element">{clock}</span></TopBar>
      <main className="wrap">
        <div className="row"><span className="swatch" style={{ background: e.color }} /><span className="tag">{r?.tag}</span><span className="small muted">{p.name}</span><span className="pill" style={{ marginLeft: "auto" }}>{e.timing.mode}</span></div>
        {e.box && <canvas ref={cropRef} className="crop" aria-label="Element outline" />}

        <div className="stack" style={{ gap: 8 }}>
          <div className="section-title"><h3>Images of the element from different angles</h3><span className="req">Sollte</span></div>
          <div className="thumbs">
            {e.photoIds.map((id, i) => <Thumb key={id} id={id} i={i} onRemove={() => removePhoto(i)} />)}
            <label className="addthumb"><span><Icon name="cam" size={22} /><br />Add photo</span>
              <input type="file" accept="image/*" capture="environment" multiple aria-label="Add element photo" onChange={ev => addPhotos(ev.target.files)} /></label>
          </div>
          <p className="small muted">Close-ups of labels, fittings, connections and damage help the vision model and the next user.</p>
        </div>

        {assisted && ai && (
          <div className="ai-box">
            <div><h3>Fill fields with AI</h3><p className="small muted">Reads the outline and your photos. Blue fields came from AI or defaults and stay blue until you check or change them.</p></div>
            <div className="row">
              <button className="btn sage grow" disabled={aiBusy} onClick={runAi}><Icon name="spark" /> {e.timing.aiCount ? "Fill again" : "Fill fields"}</button>
              {aiBusy && <button className="btn ghost" onClick={() => abortRef.current?.abort()}>Stop</button>}
            </div>
            <div className={"status" + (aiBusy ? " busy" : "")}>{aiMsg}</div>
          </div>
        )}

        <form className="stack" onSubmit={save}>
          <div className="card stack" style={{ gap: 6 }}><span className="eyebrow">Location · Verortung</span><div className="tag">{[p.name, floorLabel(r?.floor ?? 0), r?.tag].join(" / ")}</div></div>
          {f("elementType")}
          <div className="grid2">{f("ebkp")}{f("material")}</div>
          {f("funktion")}
          <div className="grid2">{f("menge")}{f("einheit")}</div>
          <div className="grid3">{f("hoehe")}{f("breite")}{f("laenge")}</div>
          {["hersteller", "verbindung", "zustand", "schadstoff", "reuse", "weitere"].map(f)}
          <p className="small" style={{ color: missing ? "var(--warn)" : "var(--muted)" }}>
            {missing ? `${missing} required (Muss) field${missing > 1 ? "s" : ""} still empty.` : "All required fields are filled."}
          </p>
          <div className="footer"><button className="btn primary" type="submit"><Icon name="save" /> Save element</button></div>
        </form>

        {confirmDelete ? (
          <div className="confirm-inline"><span>Delete this element and its timing data?</span>
            <button className="btn sm danger" onClick={remove}>Delete</button><button className="btn sm ghost" onClick={() => setConfirmDelete(false)}>Keep</button></div>
        ) : <button className="btn ghost danger block" onClick={() => setConfirmDelete(true)}>Delete element</button>}
      </main>
    </>
  );
}

function Thumb({ id, i, onRemove }: { id: string; i: number; onRemove: () => void }) {
  const url = usePhotoUrl(id);
  return <div className="thumb">{url && <img src={url} alt={`Element photo ${i + 1}`} />}<button onClick={onRemove} aria-label={`Remove photo ${i + 1}`}>×</button></div>;
}
