import { useEffect, useRef, useState, type FormEvent } from "react";
import { FieldInput } from "../components/FieldInput";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { BUILDING_SECTIONS } from "../domain/swissinv";
import { GKAT_TEXT, fetchBuilding, geoAdminLink, gwrToBuilding, isZurich, searchAddress, ZUERICH_VIRTUELL, type AddressHit } from "../lib/gwr";
import { preparePhoto } from "../lib/images";
import { back, navigate } from "../lib/nav";
import { putPhoto, saveProject, usePhotoUrl, useData } from "../lib/store";
import { toast } from "../lib/toast";

const VERORTUNG = BUILDING_SECTIONS.find(s => s.id === "verortung")!.fields;

/** Step 2: find the building in the Swiss register; fills Verortung and building data in one go. */
export function Address({ pid }: { pid: string }) {
  const p = useData().projects[pid];
  const [b, setB] = useState<Record<string, string>>(() => ({ ...(p?.building ?? {}) }));
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<AddressHit[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const img = usePhotoUrl(p?.imageId);
  const ctl = useRef<AbortController | null>(null);

  // address search as you type (debounced)
  useEffect(() => {
    if (q.trim().length < 3) { setHits([]); return; }
    const t = setTimeout(async () => {
      ctl.current?.abort(); const c = new AbortController(); ctl.current = c;
      try { setHits(await searchAddress(q, c.signal)); setStatus(""); }
      catch (e) { if ((e as Error).name !== "AbortError") setStatus("The address search needs an internet connection. You can enter the address by hand below."); }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  if (!p) return null;

  const pick = async (h: AddressHit) => {
    setHits([]); setQ(h.label); setBusy(true); setStatus("Loading building data from the register…");
    try {
      const attrs = await fetchBuilding(h.featureId);
      const m = gwrToBuilding(attrs, h.featureId, h.label);
      // register values become suggestions; fields the person already typed stay
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
      setStatus(`${Object.keys(m.fields).length} fields filled from the register. Check the blue ones.`);
    } catch {
      setStatus("The building register could not be reached. Enter the address by hand, or try again.");
    } finally { setBusy(false); }
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try { const ph = await preparePhoto(file, 1400); p.imageId = await putPhoto(ph.blob); saveProject(p); }
    catch (e) { toast((e as Error).message); }
  };

  const change = (k: string, v: string) => setB({ ...b, [k]: v });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    p.building = b;
    if (!p.name) p.name = [b.adresse, b.hausnummer].filter(Boolean).join(" ") || "Untitled project";
    saveProject(p);
    navigate({ name: "building", pid });
  };
  const g = p.gwr;

  return (
    <>
      <TopBar title={p.name || "New project"} onBack={back} />
      <main className="wrap">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">Step 2 of 3 · Gebäude · Verortung</span><h2>Find the building</h2></div>

        <div className="field search">
          <label htmlFor="q">Search address <span className="de">Swiss building register (GWR) – fills most building fields</span></label>
          <input id="q" type="search" autoComplete="off" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. Stefano-Franscini-Platz 5, Zürich" />
          {hits.length > 0 && (
            <div className="list suggestions" role="listbox">
              {hits.map(h => <button type="button" role="option" key={h.featureId} className="li" onClick={() => pick(h)}><div className="grow"><div className="t">{h.label}</div></div></button>)}
            </div>
          )}
          <div className={"status" + (busy ? " busy" : "")}>{status}</div>
        </div>

        {g && (
          <div className="card stack" style={{ gap: 6 }}>
            <span className="eyebrow">From the register</span>
            <div className="t">{g.name || g.label}</div>
            <div className="small muted">{[g.gkat && GKAT_TEXT[g.gkat], g.garea && `Gebäudefläche ${g.garea.toLocaleString("de-CH")} m²`, g.gebf && `EBF ${g.gebf.toLocaleString("de-CH")} m²`].filter(Boolean).join(" · ")}</div>
            <div className="row small">
              <a href={geoAdminLink(g.featureId)} target="_blank" rel="noreferrer">Open in map.geo.admin.ch ↗</a>
              {isZurich(g) && <a href={ZUERICH_VIRTUELL} target="_blank" rel="noreferrer">Zürich virtuell (3D) ↗</a>}
            </div>
          </div>
        )}

        <form className="stack" onSubmit={submit}>
          <label className="photo-slot">
            {img ? <img src={img} alt="Building photo" /> : <span><Icon name="cam" size={28} /><br />Add a photo of the building</span>}
            <input type="file" accept="image/*" capture="environment" aria-label="Building photo" onChange={e => onPhoto(e.target.files?.[0])} />
          </label>
          {VERORTUNG.map(def => (
            <FieldInput key={def.key} def={def} value={b[def.key] ?? ""} suggested={!!b[def.key] && p.buildingSuggested[def.key] === b[def.key]} onChange={v => change(def.key, v)} />
          ))}
          <div className="footer"><button className="btn primary" type="submit">Continue</button></div>
        </form>
      </main>
    </>
  );
}
