import { useEffect, useRef, useState } from "react";
import { FieldInput } from "../components/FieldInput";
import { Icon } from "../components/Icon";
import { Progress } from "../components/Progress";
import { StepFooter } from "../components/StepFooter";
import { TopBar } from "../components/TopBar";
import { BUILDING_SECTIONS, EXPERT_KEYS, missingBuildingMuss } from "../domain/swissinv";
import { getLang, label, t, useLang } from "../i18n";
import { GKAT_TEXT, fetchBuilding, geoAdminLink, gwrToBuilding, isZurich, searchAddress, ZUERICH_VIRTUELL, type AddressHit, type GwrMapped } from "../lib/gwr";
import { preparePhoto } from "../lib/images";
import { navigate } from "../lib/nav";
import { osmLink, osmToBuilding, searchOsm, type OsmHit } from "../lib/osm";
import { putPhoto, rememberExpert, saveProject, usePhotoUrl, useData } from "../lib/store";
import { toast } from "../lib/toast";

const N = BUILDING_SECTIONS.length;
const ch = (n?: number) => (n ? n.toLocaleString("de-CH") : "–");

/** Projektinformationen: one page per Swiss-Inv "Gebäude" section, with progress, back, skip, next. */
export function Info({ pid, step }: { pid: string; step: number }) {
  useLang();
  const p = useData().projects[pid];
  const [b, setB] = useState<Record<string, string>>(() => ({ ...(p?.building ?? {}) }));
  if (!p) return null;
  const sec = BUILDING_SECTIONS[step] ?? BUILDING_SECTIONS[0];
  const title = getLang() === "en" ? sec.titleEn : sec.title;

  const change = (k: string, v: string) => { const next = { ...b, [k]: v }; setB(next); p.building = next; saveProject(p); };
  const leave = (to: number | "hub") => {
    p.building = b;
    if (!p.name) p.name = [b.adresse, b.hausnummer].filter(Boolean).join(" ") || p.gwr?.name || "";
    if (sec.id === "kontakte") rememberExpert(Object.fromEntries(EXPERT_KEYS.map(k => [k, b[k] ?? ""])));
    saveProject(p);
    if (to === "hub") navigate({ name: "hub", pid }); else navigate({ name: "info", pid, step: to });
  };
  const last = step >= N - 1;
  const g = p.gwr;
  const sug = (k: string) => !!b[k] && p.buildingSuggested[k] === b[k];

  const hints: Record<string, React.ReactNode> = {
    geschossflaeche: g && (g.garea || g.gebf) ? t("info.hintGf", { a: `${ch(g.garea)} m²`, b: `${ch(g.gebf)} m²` }) : undefined,
    vollgeschosse: g?.gastw ? t("info.hintStoreys", { n: g.gastw }) : undefined,
    gebaeudevolumen: sug("gebaeudevolumen") ? t("info.hintVolume") : undefined,
    egrid: g?.source === "osm" ? t("info.hintEgridAbroad") : undefined,
    egid: g?.source === "osm" ? t("info.hintEgidAbroad") : undefined,
  };
  const missing = missingBuildingMuss(b).filter(k => sec.fields.some(f => f.key === k));

  return (
    <>
      <TopBar title={t("info.title")} onBack={() => (step > 0 ? leave(step - 1) : leave("hub"))} onHome={() => leave("hub")} />
      <Progress value={step + 1} max={N} label={t("c.step", { i: step + 1, n: N })} />
      <main className="wrap">
        <h2>{title}</h2>
        {sec.id === "verortung" && <FindBuilding pid={pid} b={b} setB={next => { setB(next); }} />}
        {sec.fields.map(def => (
          <FieldInput key={def.key} def={def} value={b[def.key] ?? ""} hint={hints[def.key]} suggested={sug(def.key)} onChange={v => change(def.key, v)} />
        ))}
        <p className="small" style={{ color: missing.length ? "var(--warn)" : "var(--muted)" }}>
          {missing.length ? t("c.missingList", { list: missing.map(k => label(sec.fields.find(f => f.key === k)!)).join(", ") }) : t("c.mussAll")}
        </p>
        <StepFooter onBack={step > 0 ? () => leave(step - 1) : undefined} onSkip={!last ? () => leave(step + 1) : undefined}
          onNext={() => leave(last ? "hub" : step + 1)} nextLabel={last ? t("c.done") : t("c.next")} />
      </main>
    </>
  );
}

/** Address search in the Swiss building register, with OpenStreetMap as fallback outside Switzerland; fills Verortung and building data as suggestions. */
function FindBuilding({ pid, b, setB }: { pid: string; b: Record<string, string>; setB: (b: Record<string, string>) => void }) {
  const p = useData().projects[pid];
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<AddressHit[]>([]);
  const [osmHits, setOsmHits] = useState<OsmHit[]>([]);
  const [searched, setSearched] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const img = usePhotoUrl(p?.imageId);
  const ctl = useRef<AbortController | null>(null);

  const picked = useRef(false);
  useEffect(() => {
    if (picked.current) { picked.current = false; return; } // the chosen address was written into the box – don't search again
    setOsmHits([]); setSearched(false);
    if (q.trim().length < 3) { setHits([]); return; }
    const tm = setTimeout(async () => {
      ctl.current?.abort(); const c = new AbortController(); ctl.current = c;
      try { setHits(await searchAddress(q, c.signal)); setStatus(""); setSearched(true); }
      catch (e) { if ((e as Error).name !== "AbortError") setStatus(t("info.offline")); }
    }, 300);
    return () => clearTimeout(tm);
  }, [q]);

  if (!p) return null;
  const apply = (m: GwrMapped) => {
      const next = { ...b };
      for (const [k, v] of Object.entries(m.fields)) {
        const cur = next[k] ?? "";
        if (cur === "" || p.buildingSuggested[k] === cur) { next[k] = v; p.buildingSuggested[k] = v; }
      }
      setB(next);
      p.building = next; p.gwr = m.info;
      if (m.floorsAbove && !p.info.floorsAbove) p.info.floorsAbove = m.floorsAbove;
      if (!p.name && m.info.name) p.name = m.info.name;
      saveProject(p);
  };
  const pick = async (h: AddressHit) => {
    picked.current = true; setHits([]); setSearched(false); setQ(h.label); setBusy(true); setStatus(t("info.loading"));
    try {
      const m = gwrToBuilding(await fetchBuilding(h.featureId), h.featureId, h.label);
      m.info.source = "gwr"; apply(m);
      setStatus(t("info.filled", { n: Object.keys(m.fields).length }));
    } catch { setStatus(t("info.regError")); }
    finally { setBusy(false); }
  };
  // OpenStreetMap: only on a button press (Nominatim allows no search-as-you-type)
  const findOsm = async () => {
    ctl.current?.abort(); const c = new AbortController(); ctl.current = c;
    setBusy(true); setStatus(t("info.loading")); setHits([]);
    try { const r = await searchOsm(q, c.signal); setOsmHits(r); setStatus(r.length ? "" : t("info.osmNone")); }
    catch (e) { if ((e as Error).name !== "AbortError") setStatus(t("info.osmError")); }
    finally { setBusy(false); }
  };
  const pickOsm = (h: OsmHit) => {
    picked.current = true; setOsmHits([]); setSearched(false); setQ(h.label);
    const m = osmToBuilding(h); apply(m);
    setStatus(t("info.osmFilled", { n: Object.keys(m.fields).length }));
  };
  const onPhoto = async (file?: File) => {
    if (!file) return;
    try { const ph = await preparePhoto(file, 1400); p.imageId = await putPhoto(ph.blob); saveProject(p); }
    catch { toast(t("err.photoFormat")); }
  };
  const g = p.gwr;

  return (
    <>
      <div className="field search">
        <label htmlFor="q">{t("info.search")}</label>
        <input id="q" type="search" autoComplete="off" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && hits.length === 0 && q.trim().length >= 3) { e.preventDefault(); findOsm(); } }} placeholder={t("info.searchPh")} />
        <div className="hint">{t("info.searchHint")}</div>
        {hits.length > 0 && (
          <div className="list suggestions" role="listbox">
            {hits.map(h => <button type="button" role="option" aria-selected={false} key={h.featureId} className="li" onClick={() => pick(h)}><div className="grow"><div className="t">{h.label}</div></div></button>)}
          </div>
        )}
        {osmHits.length > 0 && (
          <div className="list suggestions" role="listbox">
            {osmHits.map(h => <button type="button" role="option" aria-selected={false} key={h.featureId} className="li" onClick={() => pickOsm(h)}><div className="grow"><div className="t">{h.label}</div></div></button>)}
            <div className="small muted" style={{ padding: "6px 12px" }}>{t("info.osmCredit")}</div>
          </div>
        )}
        {searched && osmHits.length === 0 && q.trim().length >= 3 && !busy && (
          <button type="button" className="btn sm" onClick={findOsm}><Icon name="globe" size={18} /> {t("info.osmBtn")}</button>
        )}
        <div className={"status" + (busy ? " busy" : "")}>{status}</div>
      </div>
      {g && (
        <div className="card stack" style={{ gap: 6 }}>
          <span className="eyebrow">{g.source === "osm" ? t("info.fromOsm") : t("info.fromRegister")}</span>
          <div className="t">{g.name || g.label}</div>
          <div className="small muted">{[g.gkat && GKAT_TEXT[g.gkat], g.garea && t("info.footprint", { v: ch(g.garea) }), g.gebf && t("info.ebf", { v: ch(g.gebf) })].filter(Boolean).join(" · ")}</div>
          <div className="row small">
            {g.source === "osm"
              ? <a href={osmLink(g.featureId)} target="_blank" rel="noreferrer">{t("info.openOsm")}</a>
              : <a href={geoAdminLink(g.featureId)} target="_blank" rel="noreferrer">{t("info.openMap")}</a>}
            {isZurich(g) && <a href={ZUERICH_VIRTUELL} target="_blank" rel="noreferrer">{t("info.openZh")}</a>}
          </div>
        </div>
      )}
      <label className="photo-slot">
        {img ? <img src={img} alt="" /> : <span><Icon name="cam" size={28} /><br />{t("info.photo")}</span>}
        <input type="file" accept="image/*,.heic,.heif" capture="environment" aria-label={t("info.photo")} onChange={e => onPhoto(e.target.files?.[0])} />
      </label>
    </>
  );
}
