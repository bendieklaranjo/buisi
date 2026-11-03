import { useEffect, useRef, useState } from "react";
import { DimensionSketch } from "../components/DimensionSketch";
import { FieldInput } from "../components/FieldInput";
import { Icon } from "../components/Icon";
import { Progress } from "../components/Progress";
import { StepFooter } from "../components/StepFooter";
import { TopBar } from "../components/TopBar";
import { floorLabel } from "../domain/fields";
import { RULE_BY_ID, RULE_TYPES, searchTypes, type RuleType, EBKP_CODES, ebkpName } from "../domain/crb";
import { EBKP_MAIN, ELEMENT_FIELD, PHOTO_SLOTS, STUFE2_SECTIONS, missingElementMuss } from "../domain/swissinv";
import { label, t, useLang, type UIKey } from "../i18n";
import { applySuggestions, suggestionsAfterChange } from "../lib/elements";
import { cropAround, loadImage, preparePhoto } from "../lib/images";
import { home, navigate } from "../lib/nav";
import { deleteElement, photoUrl, putPhoto, saveElement, useData, usePhotoUrl } from "../lib/store";
import { endClock, liveMs, startClock } from "../lib/timing";
import { toast } from "../lib/toast";
import { roomTitle } from "./Floors";

const STEPS: UIKey[] = ["el.s.photos", "el.s.ident", "el.s.dims", "el.s.potential", "el.s.desc", "el.s.stufe2"];
const MUSS_COUNT = missingElementMuss({}, 0).length;

/** Swiss-Inv "Bauteil" as step pages. Verortung is filled from the room and not asked. */
export function ElementScreen({ pid, elementId, step }: { pid: string; elementId: string; step: number }) {
  const L = useLang();
  const { projects, elements } = useData();
  const p = projects[pid];
  const e = elements[elementId];
  const r = p?.rooms.find(x => x.id === e?.roomId);
  const [fields, setFields] = useState<Record<string, string>>(() => ({ ...(e?.fields ?? {}) }));
  const [group, setGroup] = useState(() => (e?.fields.ebkp ?? "").charAt(0));
  const [clock, setClock] = useState("0:00");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [otherType, setOtherType] = useState(() => !!e?.fields.ebkp && !e?.fields.bauteiltyp);
  const [typeQ, setTypeQ] = useState("");
  const cropRef = useRef<HTMLCanvasElement>(null);

  // time-study clock runs while the element pages are open (across all steps)
  useEffect(() => {
    if (!e) return;
    startClock(e.id);
    const tm = setInterval(() => { const s = Math.floor(liveMs(e.id) / 1000); setClock(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`); }, 1000);
    return () => { clearInterval(tm); endClock(); };
  }, [e?.id]);

  // crop of the room photo with the box, on the photo step
  useEffect(() => {
    if (step !== 0 || !e?.box || !r?.photoId) return;
    let live = true;
    void (async () => {
      const url = await photoUrl(r.photoId!); if (!url) return;
      const img = await loadImage(url); if (!live) return;
      const crop = cropAround(img, e.box!, 0.25); const cv = cropRef.current; if (!cv) return;
      cv.width = crop.canvas.width; cv.height = crop.canvas.height;
      const ctx = cv.getContext("2d")!; ctx.drawImage(crop.canvas, 0, 0);
      const s = cv.width / crop.sw, [bx, by, bw, bh] = e.box!;
      ctx.lineWidth = 3; ctx.strokeStyle = e.color;
      ctx.strokeRect((bx * img.naturalWidth - crop.sx) * s, (by * img.naturalHeight - crop.sy) * s, bw * img.naturalWidth * s, bh * img.naturalHeight * s);
    })();
    return () => { live = false; };
  }, [e?.id, r?.photoId, step]);

  if (!p || !e) return null;
  const mode = e.timing.mode;
  const isSug = (k: string) => e.suggested[k] !== undefined && e.suggested[k] === (fields[k] ?? "") && (fields[k] ?? "") !== "";
  const missing = missingElementMuss(fields, e.photoIds.length);
  const N = STEPS.length, last = step >= N - 1;

  const change = (k: string, v: string) => {
    const next = { ...fields, [k]: v };
    const changed = applySuggestions(next, e.suggested, suggestionsAfterChange(k, v, mode));
    if (k === "ebkp" && v) setGroup(v.charAt(0));
    if (changed.includes("ebkp")) setGroup((next.ebkp ?? "").charAt(0));
    setFields(next);
    e.fields = next; saveElement(e);
  };
  const go = (s: number) => { e.fields = { ...fields }; saveElement(e); navigate({ name: "element", pid, elementId, step: s }, true); };
  const toRoom = () => { e.fields = { ...fields }; saveElement(e); navigate({ name: "room", pid, roomId: e.roomId }); };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    toast(files.length > 1 ? t("el.savingPhotos", { n: files.length }) : t("el.savingPhoto"));
    try { for (const f of Array.from(files)) e.photoIds.push(await putPhoto((await preparePhoto(f, 1600)).blob)); }
    catch { toast(t("err.photoFormat")); }
    saveElement(e);
  };
  const removePhoto = (i: number) => { e.photoIds.splice(i, 1); saveElement(e); };

  const save = () => {
    e.fields = { ...fields };
    endClock(); // books the running time into e.timing.activeMs
    if (e.status !== "saved") {
      e.status = "saved"; e.savedAt = Date.now(); e.timing.firstSavedMs = e.timing.activeMs;
      const keys = Object.keys(e.suggested);
      e.timing.suggestionsKept = keys.filter(k => e.suggested[k] && e.suggested[k] === (e.fields[k] ?? "")).length;
      e.timing.corrections = keys.filter(k => e.suggested[k] !== (e.fields[k] ?? "")).length;
      e.timing.mussTotal = MUSS_COUNT; e.timing.mussFilled = MUSS_COUNT - missingElementMuss(e.fields, e.photoIds.length).length;
    }
    saveElement(e);
    toast(missing.length === 1 ? t("el.savedOpen1") : missing.length ? t("el.savedOpen", { n: missing.length }) : t("el.saved"));
    navigate({ name: "room", pid, roomId: e.roomId });
  };
  const remove = () => { endClock(); deleteElement(e.id); navigate({ name: "room", pid, roomId: e.roomId }); };

  const F = (k: string, extra?: { hint?: React.ReactNode; readOnly?: boolean; options?: string[]; list?: string }) => (
    <FieldInput key={k} def={ELEMENT_FIELD[k]} value={fields[k] ?? ""} suggested={isSug(k)} onChange={v => change(k, v)} {...extra} />
  );
  const missingLabel = (k: string) => (k === "_dims" ? t("el.dims") : k === "_photos" ? t("el.photos3") : label(ELEMENT_FIELD[k]));
  const chosen = RULE_BY_ID[fields.bauteiltyp ?? ""];
  const found = searchTypes(typeQ);
  const typeButton = (c: RuleType) => (
    <button type="button" role="option" key={c.id} aria-selected={fields.bauteiltyp === c.id} className={"type-btn" + (fields.bauteiltyp === c.id ? " on" : "")}
      onClick={() => { setOtherType(false); setGroup(c.code.charAt(0)); change("bauteiltyp", c.id); }}>
      <span>{L === "en" ? c.en : c.de}<small>{c.ifc}{c.ifcType ? `.${c.ifcType}` : ""}</small></span><span className="tag">{c.code}</span>
    </button>
  );

  return (
    <>
      <TopBar title={fields.bezeichnung || fields.bauteiltyp || t("el.new")} onBack={() => (step > 0 ? go(step - 1) : toRoom())} onHome={() => { e.fields = { ...fields }; saveElement(e); home(pid); }}>
        <span className="timer" aria-label={t("el.clock")}>{clock}</span>
      </TopBar>
      <Progress value={step + 1} max={N} label={`${t("c.step", { i: step + 1, n: N })} · ${t(STEPS[step])}`} />
      <main className="wrap">
        <div className="row"><span className="swatch" style={{ background: e.color }} /><span className="tag">{fields.bauteilId}</span><span className="small muted">{r && roomTitle(r)} · {floorLabel(r?.floor ?? 0)}</span><span className="pill" style={{ marginLeft: "auto" }}>{mode === "assisted" ? t("mode.assisted") : t("mode.manual")}</span></div>
        <h2>{t(STEPS[step])}</h2>

        {step === 0 && (
          <section className="stack" style={{ gap: 8 }}>
            {e.box && <canvas ref={cropRef} className="crop" aria-hidden="true" />}
            <div className="section-title"><span className="small muted">{t("c.muss")} · {t("el.photosMin")}</span></div>
            <div className="thumbs">
              {PHOTO_SLOTS.map((s, i) => e.photoIds[i]
                ? <Thumb key={e.photoIds[i]} id={e.photoIds[i]} label={s[L]} onRemove={() => removePhoto(i)} />
                : <AddPhoto key={s.de} label={s[L]} onFiles={addPhotos} disabled={i > e.photoIds.length} />)}
              {e.photoIds.slice(3).map((id, j) => <Thumb key={id} id={id} label={t("el.photoN", { n: j + 4 })} onRemove={() => removePhoto(j + 3)} />)}
              {e.photoIds.length >= 3 && <AddPhoto label={t("el.morePhoto")} onFiles={addPhotos} />}
            </div>
            <p className="small muted">{e.box && mode === "assisted" ? t("el.photoCrop") : ""}{t("el.photoSize")}</p>
          </section>
        )}

        {step === 1 && (
          <section className="stack form-section">
            <div className="field search">
              <label htmlFor="typeq">{t("el.typeSearch")}</label>
              <input id="typeq" type="search" autoComplete="off" value={typeQ} onChange={ev => setTypeQ(ev.target.value)} placeholder={t("el.typeSearchPh")} />
            </div>
            {typeQ.trim().length >= 2 ? (
              <div className="type-list" role="listbox" aria-label={t("el.typeList")}>
                {found.length === 0 ? <div className="empty small">{t("el.typeNone")}</div> : found.map(c => typeButton(c))}
              </div>
            ) : (
              <>
                <div className="field">
                  <span className="flabel">{t("el.function")}</span>
                  <div className="chips" role="group" aria-label={t("el.function")}>
                    {EBKP_MAIN.map(g => (
                      <button type="button" key={g.l} className="chip" aria-pressed={group === g.l} onClick={() => setGroup(group === g.l ? "" : g.l)}><b>{g.l}</b> {g[L]}</button>
                    ))}
                  </div>
                </div>
                {group && (
                  <div className="field">
                    <span className="flabel">{t("el.typeList")}</span>
                    <div className="type-list" role="listbox" aria-label={t("el.typeList")}>
                      {RULE_TYPES.filter(r => r.code.startsWith(group)).sort((a, b) => a.code.localeCompare(b.code)).map(r => typeButton(r))}
                    </div>
                  </div>
                )}
              </>
            )}
            <button type="button" className={"btn sm ghost" + (otherType ? " on" : "")} onClick={() => { setOtherType(true); change("bauteiltyp", ""); }}>{t("el.typeOther")}</button>
            {F("bezeichnung", { hint: t("el.nameHint") })}
            <div className="generated">
              {otherType
                ? <div className="grid-ebkp">{F("ebkp", { options: EBKP_CODES.filter(c => !group || c.startsWith(group)) })}{F("ebkpText", { readOnly: true })}</div>
                : <div className="small"><span className="eyebrow">{t("el.generated")}</span>
                    {chosen && <div className="gen-row">{L === "en" ? chosen.en : chosen.de}</div>}
                    <div className="gen-row"><b className="tag">{fields.ebkp || "–"}</b> {(L === "en" ? ebkpName(fields.ebkp ?? "", "en") : fields.ebkpText) || ""}{fields.ifc && <span className="tag muted"> · {fields.ifc}{fields.ifcTyp ? `.${fields.ifcTyp}` : ""}</span>}</div></div>}
            </div>
            {F("ifc")}
            <div className="grid2">{F("bauteilId")}{F("bestandteilVon")}</div>
            <p className="small muted">{t("el.crbSource")}</p>
          </section>
        )}

        {step === 2 && (
          <section className="stack form-section">
            <div className="grid2">{F("menge")}{F("einheit")}</div>
            <h3 className="section-h">{t("el.dims")} <span className="small muted">{t("el.inCm")}</span></h3>
            <div className="dims">
              <DimensionSketch />
              <div className="stack" style={{ gap: 10, flex: 1, minWidth: 0 }}>{F("hoehe")}{F("breite")}{F("tiefe")}</div>
            </div>
            <p className="small muted">{t("el.dimsHint")}</p>
            <div className="grid2">{F("laenge")}{F("durchmesser")}</div>
            {F("weitereDimension")}
          </section>
        )}

        {step === 3 && (
          <section className="stack form-section">
            {F("schadstoffbelastet")}{F("schadstoffverdacht")}{F("zustand")}{F("zustandText")}{F("verbindung")}{F("potenzial")}{F("potenzialBegruendung")}
            <label className="check big">
              <input type="checkbox" checked={fields.zielprojektBekannt === "ja"} onChange={ev => change("zielprojektBekannt", ev.target.checked ? "ja" : "nein")} />
              <span>{label(ELEMENT_FIELD.zielprojektBekannt)} <span className="req">{t("c.extra")}</span></span>
            </label>
            {fields.zielprojektBekannt === "ja" && F("zielprojekt")}
          </section>
        )}

        {step === 4 && (
          <section className="stack form-section">
            {F("herstellerin")}{F("materialien")}
            <h3 className="section-h">{L === "en" ? "Attachments" : "Anhänge"}</h3>
            {F("dokumente")}{F("dokumenteText")}
          </section>
        )}

        {step === 5 && (
          <>
            <p className="small muted">{t("el.stufe2Hint")}</p>
            {STUFE2_SECTIONS.map(s => (
              <section key={s.id} className="stack form-section">
                <h3 className="section-h">{L === "en" ? s.titleEn : s.title}</h3>
                {s.fields.map(d => F(d.key))}
              </section>
            ))}
            <div className="card stack" style={{ gap: 6 }}>
              <span className="eyebrow">{t("el.summary")}</span>
              <p className="small" style={{ color: missing.length ? "var(--warn)" : "var(--muted)", margin: 0 }}>
                {missing.length ? t("c.missingList", { list: missing.map(missingLabel).join(", ") }) : t("c.mussAll")}</p>
            </div>
          </>
        )}

        {step < 5 && missing.length > 0 && <p className="small muted">{missing.length === 1 ? t("c.mussMissing1") : t("c.mussMissing", { n: missing.length })}</p>}
        {Object.keys(e.suggested).length > 0 && step > 0 && <p className="small muted">{t("c.suggestedNote")}</p>}

        <StepFooter onBack={step > 0 ? () => go(step - 1) : toRoom} onSkip={last ? undefined : () => go(step + 1)}
          onNext={last ? save : () => go(step + 1)} nextLabel={last ? t("el.save") : t("c.next")} />

        {last && (confirmDelete ? (
          <div className="confirm-inline"><span>{t("el.deleteQ")}</span>
            <button className="btn sm danger" onClick={remove}>{t("c.delete")}</button><button className="btn sm ghost" onClick={() => setConfirmDelete(false)}>{t("c.keep")}</button></div>
        ) : <button className="btn ghost danger block" onClick={() => setConfirmDelete(true)}>{t("el.delete")}</button>)}
      </main>
    </>
  );
}

function Thumb({ id, label: l, onRemove }: { id: string; label: string; onRemove: () => void }) {
  const url = usePhotoUrl(id);
  return (
    <figure className="thumb-slot">
      <div className="thumb">{url && <img src={url} alt={l} />}<button type="button" onClick={onRemove} aria-label={t("el.removePhoto", { label: l })}>×</button></div>
      <figcaption>{l}</figcaption>
    </figure>
  );
}

function AddPhoto({ label: l, onFiles, disabled }: { label: string; onFiles: (f: FileList | null) => void; disabled?: boolean }) {
  return (
    <figure className="thumb-slot">
      <label className={"addthumb" + (disabled ? " dim" : "")}><span><Icon name="cam" size={22} /></span>
        <input type="file" accept="image/*,.heic,.heif" capture="environment" multiple aria-label={t("el.addPhoto", { label: l })} onChange={ev => { onFiles(ev.target.files); ev.target.value = ""; }} /></label>
      <figcaption>{l}</figcaption>
    </figure>
  );
}
