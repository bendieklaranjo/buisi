import { useEffect, useRef, useState, type FormEvent } from "react";
import { DimensionSketch } from "../components/DimensionSketch";
import { FieldInput } from "../components/FieldInput";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { floorLabel } from "../domain/fields";
import { CATALOG, EBKP, EBKP_MAIN, ELEMENT_FIELD, ELEMENT_STUFE2, PHOTO_SLOTS, missingElementMuss } from "../domain/swissinv";
import { applySuggestions, suggestionsAfterChange } from "../lib/elements";
import { cropAround, loadImage, preparePhoto } from "../lib/images";
import { back } from "../lib/nav";
import { decodeMask, maskOverlay } from "../lib/segmentation";
import { deleteElement, photoUrl, putPhoto, saveElement, useData, usePhotoUrl } from "../lib/store";
import { endClock, liveMs, startClock } from "../lib/timing";
import { toast } from "../lib/toast";

/** Swiss-Inv "Bauteil" Stufe 1 (+ optional Stufe 2) for one element. */
export function ElementScreen({ pid, elementId }: { pid: string; elementId: string }) {
  const { projects, elements } = useData();
  const p = projects[pid];
  const e = elements[elementId];
  const r = p?.rooms.find(x => x.id === e?.roomId);
  const [fields, setFields] = useState<Record<string, string>>(() => ({ ...(e?.fields ?? {}) }));
  const [group, setGroup] = useState(() => (e?.fields.ebkp ?? "").charAt(0));
  const [clock, setClock] = useState("0:00");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cropRef = useRef<HTMLCanvasElement>(null);

  // time-study clock runs while this screen is open
  useEffect(() => {
    if (!e) return;
    startClock(e.id);
    const t = setInterval(() => { const s = Math.floor(liveMs(e.id) / 1000); setClock(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`); }, 1000);
    return () => { clearInterval(t); endClock(); };
  }, [e?.id]);

  // crop of the room photo with the outline
  useEffect(() => {
    if (!e?.box || !r?.photoId) return;
    let live = true;
    void (async () => {
      const url = await photoUrl(r.photoId!); if (!url) return;
      const img = await loadImage(url); if (!live) return;
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
  const mode = e.timing.mode;
  const isSug = (k: string) => e.suggested[k] !== undefined && e.suggested[k] === (fields[k] ?? "") && (fields[k] ?? "") !== "";
  const missing = missingElementMuss(fields, e.photoIds.length);

  const change = (k: string, v: string) => {
    const next = { ...fields, [k]: v };
    const changed = applySuggestions(next, e.suggested, suggestionsAfterChange(k, v, mode));
    if (k === "ebkp" && v) setGroup(v.charAt(0));
    if (changed.includes("ebkp")) setGroup((next.ebkp ?? "").charAt(0));
    setFields(next);
    e.fields = next; saveElement(e);
  };

  const addPhotos = async (files: FileList | null, slot?: number) => {
    if (!files?.length) return;
    toast(files.length > 1 ? `Saving ${files.length} photos…` : "Saving photo…");
    try {
      for (const f of Array.from(files)) {
        const id = await putPhoto((await preparePhoto(f, 1600)).blob);
        if (slot !== undefined && slot < e.photoIds.length) e.photoIds[slot] = id; else e.photoIds.push(id);
        slot = undefined;
      }
    } catch (err) { toast((err as Error).message); }
    saveElement(e);
  };
  const removePhoto = (i: number) => { e.photoIds.splice(i, 1); saveElement(e); };

  const save = (ev: FormEvent) => {
    ev.preventDefault();
    e.fields = { ...fields };
    endClock(); // books the running time into e.timing.activeMs
    if (e.status !== "saved") {
      e.status = "saved"; e.savedAt = Date.now(); e.timing.firstSavedMs = e.timing.activeMs;
      const keys = Object.keys(e.suggested);
      e.timing.suggestionsKept = keys.filter(k => e.suggested[k] && e.suggested[k] === (e.fields[k] ?? "")).length;
      e.timing.corrections = keys.filter(k => e.suggested[k] !== (e.fields[k] ?? "")).length;
      const miss = missingElementMuss(e.fields, e.photoIds.length).length;
      e.timing.mussTotal = MUSS_COUNT; e.timing.mussFilled = MUSS_COUNT - miss;
    }
    saveElement(e); toast(missing.length ? `Saved – ${missing.length} required fields still open` : "Element saved"); back();
  };

  const remove = () => { endClock(); deleteElement(e.id); back(); };

  const F = (k: string, extra?: { hint?: React.ReactNode; readOnly?: boolean }) => (
    <FieldInput key={k} def={ELEMENT_FIELD[k]} value={fields[k] ?? ""} suggested={isSug(k)} onChange={v => change(k, v)} {...extra} />
  );
  const groupCodes = EBKP.filter(([c]) => !group || c.startsWith(group));
  const ebkpDef = { ...ELEMENT_FIELD.ebkp, options: groupCodes.map(([c]) => c) };

  return (
    <>
      <TopBar title={fields.bezeichnung || "New element"} onBack={back}><span className="timer" aria-label="Active time on this element">{clock}</span></TopBar>
      <main className="wrap">
        <div className="row"><span className="swatch" style={{ background: e.color }} /><span className="tag">{fields.bauteilId}</span><span className="small muted">{r?.name || r?.tag} · {floorLabel(r?.floor ?? 0)}</span><span className="pill" style={{ marginLeft: "auto" }}>{mode}</span></div>
        {e.box && <canvas ref={cropRef} className="crop" aria-label="Element outline" />}

        {/* ---------- photos (Liste der vorhandenen Fotos, Muss: min. 3) ---------- */}
        <section className="stack" style={{ gap: 8 }}>
          <div className="section-title"><h3>Fotos</h3><span className="req muss">Muss · mind. 3</span></div>
          <div className="thumbs">
            {PHOTO_SLOTS.map((label, i) => e.photoIds[i]
              ? <Thumb key={e.photoIds[i]} id={e.photoIds[i]} label={label} onRemove={() => removePhoto(i)} />
              : <AddPhoto key={label} label={label} onFiles={f => addPhotos(f)} disabled={i > e.photoIds.length} />)}
            {e.photoIds.slice(3).map((id, j) => <Thumb key={id} id={id} label={`Foto ${j + 4}`} onRemove={() => removePhoto(j + 3)} />)}
            {e.photoIds.length >= 3 && <AddPhoto label="Weiteres Foto" onFiles={f => addPhotos(f)} />}
          </div>
          <p className="small muted">{e.box && mode === "assisted" ? "The outline crop was added as Frontalansicht; replace it with a better photo if you like. " : ""}Photos are compressed to under 1.5 MB.</p>
        </section>

        <form className="stack" onSubmit={save}>
          {/* ---------- Identifikation ---------- */}
          <section className="stack form-section">
            <h3 className="section-h">Identifikation</h3>
            <div className="field">
              <FieldInput def={ELEMENT_FIELD.bezeichnung} list="catalog" value={fields.bezeichnung ?? ""} suggested={isSug("bezeichnung")} onChange={v => change("bezeichnung", v)}
                hint={mode === "assisted" ? "Pick a common element from the list to fill eBKP, IFC, unit and exposure automatically." : undefined} />
              <datalist id="catalog">{CATALOG.map(c => <option key={c.name} value={c.name} />)}</datalist>
            </div>
            <div className="field">
              <span className="flabel">Funktion im Gebäude <span className="de">Function – eBKP main group</span></span>
              <div className="chips" role="group" aria-label="Function in the building">
                {EBKP_MAIN.map(([l, name, sub]) => (
                  <button type="button" key={l} className="chip" aria-pressed={group === l} title={sub} onClick={() => setGroup(group === l ? "" : l)}>
                    <b>{l}</b> {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid-ebkp">
              <FieldInput def={ebkpDef} value={fields.ebkp ?? ""} suggested={isSug("ebkp")} onChange={v => change("ebkp", v)} />
              {F("ebkpText", { readOnly: true })}
            </div>
            {F("ifc")}
            <div className="grid2">{F("bauteilId")}{F("bestandteilVon")}</div>
          </section>

          {/* ---------- Verortung ---------- */}
          <section className="stack form-section">
            <h3 className="section-h">Verortung</h3>
            {F("verortung")}
            {F("koordinaten")}
          </section>

          {/* ---------- Menge ---------- */}
          <section className="stack form-section">
            <h3 className="section-h">Menge</h3>
            <div className="grid2">{F("menge")}{F("einheit")}</div>
          </section>

          {/* ---------- Abmessungen ---------- */}
          <section className="stack form-section">
            <h3 className="section-h">Abmessungen <span className="small muted">in cm</span></h3>
            <div className="dims">
              <DimensionSketch />
              <div className="stack" style={{ gap: 10, flex: 1, minWidth: 0 }}>{F("hoehe")}{F("breite")}{F("tiefe")}</div>
            </div>
            <p className="small muted">For linear or round elements (beams, pipes, railings) use length or diameter instead.</p>
            <div className="grid2">{F("laenge")}{F("durchmesser")}</div>
            {F("weitereDimension")}
          </section>

          {/* ---------- Beschreibung ---------- */}
          <section className="stack form-section">
            <h3 className="section-h">Beschreibung</h3>
            {F("herstellerin")}
            {F("materialien")}
          </section>

          {/* ---------- Potenzial ---------- */}
          <section className="stack form-section">
            <h3 className="section-h">Potenzial</h3>
            {F("schadstoffbelastet")}
            {F("schadstoffverdacht")}
            {F("zustand")}
            {F("zustandText")}
            {F("verbindung")}
            {F("potenzial", { hint: "A later version will suggest this automatically from comparable elements." })}
            {F("potenzialBegruendung")}
            <label className="check big">
              <input type="checkbox" checked={fields.zielprojektBekannt === "ja"} onChange={ev => change("zielprojektBekannt", ev.target.checked ? "ja" : "nein")} />
              <span>Zielprojekt bekannt <span className="de">Destination project known</span> <span className="req">Zusatz</span></span>
            </label>
            {fields.zielprojektBekannt === "ja" && F("zielprojekt")}
          </section>

          {/* ---------- Anhänge ---------- */}
          <section className="stack form-section">
            <h3 className="section-h">Anhänge</h3>
            {F("dokumente")}
            {F("dokumenteText")}
          </section>

          {/* ---------- Stufe 2 ---------- */}
          <details className="stufe2">
            <summary><h3 className="section-h">Bauteil Stufe 2</h3><span className="small muted">More detail – mostly optional (Kann). Verfügbarkeit is required.</span></summary>
            {ELEMENT_STUFE2.map(s => (
              <section key={s.id} className="stack form-section">
                <h4 className="section-h sub">{s.title}</h4>
                {s.fields.map(d => F(d.key))}
              </section>
            ))}
          </details>

          <p className="small" style={{ color: missing.length ? "var(--warn)" : "var(--muted)" }}>
            {missing.length ? `Still missing (Muss): ${missing.join(", ")}` : "All required fields are filled."}
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

const MUSS_COUNT = missingElementMuss({}, 0).length;

function Thumb({ id, label, onRemove }: { id: string; label: string; onRemove: () => void }) {
  const url = usePhotoUrl(id);
  return (
    <figure className="thumb-slot">
      <div className="thumb">{url && <img src={url} alt={label} />}<button type="button" onClick={onRemove} aria-label={`Remove ${label}`}>×</button></div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function AddPhoto({ label, onFiles, disabled }: { label: string; onFiles: (f: FileList | null) => void; disabled?: boolean }) {
  return (
    <figure className="thumb-slot">
      <label className={"addthumb" + (disabled ? " dim" : "")}><span><Icon name="cam" size={22} /></span>
        <input type="file" accept="image/*,.heic,.heif" capture="environment" multiple aria-label={`Add ${label}`} onChange={ev => { onFiles(ev.target.files); ev.target.value = ""; }} /></label>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
