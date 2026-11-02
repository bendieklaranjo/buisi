import { useState, type FormEvent } from "react";
import { FieldInput } from "../components/FieldInput";
import { TopBar } from "../components/TopBar";
import { BUILDING_SECTIONS, ELEMENT_FIELD, EXPERT_KEYS, PROJECT_DEFAULT_KEYS, missingBuildingMuss } from "../domain/swissinv";
import { back, navigate } from "../lib/nav";
import { rememberExpert, saveProject, useData } from "../lib/store";

const SECTIONS = BUILDING_SECTIONS.filter(s => s.id !== "verortung"); // Verortung is on the address screen
const NAV = [...SECTIONS.map(s => [s.id, s.title]), ["defaults", "Für alle Bauteile"], ["floors", "Geschosse"]];

/** Step 3: Swiss-Inv "Gebäude" (Allgemeine Gebäudedaten, Weitere Informationen, Kontakte) + defaults for all elements. */
export function Building({ pid }: { pid: string }) {
  const p = useData().projects[pid];
  const [b, setB] = useState<Record<string, string>>(() => ({ ...(p?.building ?? {}) }));
  const [d, setD] = useState<Record<string, string>>(() => ({ ...(p?.defaults ?? {}) }));
  const [floorsAbove, setFloorsAbove] = useState(String(p?.info.floorsAbove ?? ""));
  const [basements, setBasements] = useState(String(p?.info.basements ?? 0));
  if (!p) return null;
  const g = p.gwr;
  const missing = missingBuildingMuss(b);

  const hints: Record<string, React.ReactNode> = {
    geschossflaeche: g && (g.garea || g.gebf)
      ? <>Register: footprint {g.garea ? `${g.garea.toLocaleString("de-CH")} m²` : "–"}{g.gebf ? `, energy reference area (EBF) ${g.gebf.toLocaleString("de-CH")} m²` : ""}. Neither is the SIA 416 floor area, but they help estimate it.</>
      : undefined,
    vollgeschosse: g?.gastw ? <>Register: {g.gastw} storeys above ground. The register may include attic storeys; Swiss-Inv counts full storeys only.</> : undefined,
    gebaeudevolumen: b.gebaeudevolumen && p.buildingSuggested.gebaeudevolumen === b.gebaeudevolumen ? <>From the register. Check which standard (SIA 416 or 116) it was measured to.</> : undefined,
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    p.building = b; p.defaults = d;
    p.info = { floorsAbove: Math.max(1, Math.min(60, parseInt(floorsAbove, 10) || 1)), basements: Math.max(0, Math.min(6, parseInt(basements, 10) || 0)) };
    rememberExpert(Object.fromEntries(EXPERT_KEYS.map(k => [k, b[k] ?? ""])));
    saveProject(p);
    navigate({ name: "floors", pid });
  };

  return (
    <>
      <TopBar title={p.name} onBack={back} />
      <nav className="section-nav wrap" aria-label="Sections">
        {NAV.map(([id, t]) => <a key={id} href={"#s-" + id} onClick={ev => { ev.preventDefault(); document.getElementById("s-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{t}</a>)}
      </nav>
      <main className="wrap">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">Step 3 of 3 · Swiss-Inv · Gebäude</span><h2>Building information</h2>
          <p className={"small" + (missing.length ? "" : " muted")} style={missing.length ? { color: "var(--warn)" } : undefined}>
            {missing.length ? `${missing.length} required (Muss) field${missing.length > 1 ? "s" : ""} still empty – marked MUSS below.` : "All required building fields are filled."}</p>
        </div>
        <form className="stack" onSubmit={submit}>
          {SECTIONS.map(s => (
            <section key={s.id} id={"s-" + s.id} className="stack form-section">
              <h3 className="section-h">{s.title}</h3>
              {s.fields.map(def => (
                <FieldInput key={def.key} def={def} value={b[def.key] ?? ""} hint={hints[def.key]}
                  suggested={!!b[def.key] && p.buildingSuggested[def.key] === b[def.key]}
                  onChange={v => setB({ ...b, [def.key]: v })} />
              ))}
            </section>
          ))}

          <section id="s-defaults" className="stack form-section">
            <h3 className="section-h">Für alle Bauteile</h3>
            <p className="small muted">Usually the same for every element of this building. Set them once; each new element starts with these values and you can still change them per element.</p>
            {PROJECT_DEFAULT_KEYS.map(k => (
              <FieldInput key={k} def={{ ...ELEMENT_FIELD[k], en: ELEMENT_FIELD[k].en?.replace(" – default from the building", "") }} value={d[k] ?? ""} onChange={v => setD({ ...d, [k]: v })} />
            ))}
          </section>

          <section id="s-floors" className="stack form-section">
            <h3 className="section-h">Geschosse für das Inventar</h3>
            <p className="small muted">Used by the app to list floors; not part of Swiss-Inv.{g?.gastw ? ` The register lists ${g.gastw} storeys above ground.` : ""}</p>
            <div className="grid2">
              <div className="field"><label htmlFor="fa">Floors above ground</label><input id="fa" type="number" min={1} max={60} required inputMode="numeric" value={floorsAbove} onChange={e => setFloorsAbove(e.target.value)} /></div>
              <div className="field"><label htmlFor="fb">Basement floors</label><input id="fb" type="number" min={0} max={6} inputMode="numeric" value={basements} onChange={e => setBasements(e.target.value)} /></div>
            </div>
          </section>
          <div className="footer"><button className="btn primary" type="submit">Start inventory</button></div>
        </form>
      </main>
    </>
  );
}
