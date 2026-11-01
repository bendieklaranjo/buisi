import { useState, type FormEvent, type ReactNode } from "react";
import { TopBar } from "../components/TopBar";
import { BAUWEISE, GEBAEUDEKLASSEN, KATEGORIEN } from "../domain/fields";
import type { BuildingInfo } from "../domain/types";
import { back, navigate } from "../lib/nav";
import { saveProject, useData } from "../lib/store";

/** General building information after DIN SPEC 91484, Tabelle 1. */
export function Building({ pid }: { pid: string }) {
  const p = useData().projects[pid];
  const [i, setI] = useState<BuildingInfo>({ basements: 0, ...(p?.info ?? {}) });
  if (!p) return null;
  const set = (k: keyof BuildingInfo) => (e: { target: { value: string } }) => setI({ ...i, [k]: e.target.value });
  const L = ({ id, en, de, muss, children }: { id: string; en: string; de: string; muss?: boolean; children: ReactNode }) => (
    <div className="field"><label htmlFor={id}>{en} <span className="de">{de}</span>{muss && <span className="req muss">Muss</span>}</label>{children}</div>
  );
  const submit = (e: FormEvent) => {
    e.preventDefault();
    p.info = {
      ...i,
      floorsAbove: Math.max(1, Math.min(60, parseInt(String(i.floorsAbove), 10) || 1)),
      basements: Math.max(0, Math.min(6, parseInt(String(i.basements), 10) || 0)),
    };
    saveProject(p);
    navigate({ name: "floors", pid });
  };
  const opts = (arr: string[]) => [<option key="" value="">Select…</option>, ...arr.map(a => <option key={a}>{a}</option>)];

  return (
    <>
      <TopBar title={p.name} onBack={back} />
      <main className="wrap">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">Step 3 of 3 · DIN SPEC 91484, Tabelle 1</span><h2>General building information</h2></div>
        <form className="stack" onSubmit={submit}>
          {L({ id: "kat", en: "Building category", de: "Bauwerkskategorie", muss: true, children: <><input id="kat" type="text" list="katl" value={i.kat ?? ""} onChange={set("kat")} /><datalist id="katl">{KATEGORIEN.map(k => <option key={k} value={k} />)}</datalist></> })}
          {L({ id: "ort", en: "Location", de: "Ort", muss: true, children: <input id="ort" type="text" value={i.ort ?? ""} onChange={set("ort")} /> })}
          {L({ id: "bauweise", en: "Construction method", de: "Bauweise/-art", muss: true, children: <select id="bauweise" value={i.bauweise ?? ""} onChange={set("bauweise")}>{opts(BAUWEISE)}</select> })}
          <div className="grid2">
            {L({ id: "baujahr", en: "Year built", de: "Baujahr", children: <input id="baujahr" type="number" inputMode="numeric" value={i.baujahr ?? ""} onChange={set("baujahr")} /> })}
            {L({ id: "gk", en: "Building class", de: "Gebäudeklasse", children: <select id="gk" value={i.gk ?? ""} onChange={set("gk")}>{opts(GEBAEUDEKLASSEN)}</select> })}
          </div>
          <div className="grid2">
            {L({ id: "bri", en: "Gross volume m³", de: "BRI", children: <input id="bri" type="number" inputMode="decimal" value={i.bri ?? ""} onChange={set("bri")} /> })}
            {L({ id: "bgf", en: "Gross floor area m²", de: "BGF", children: <input id="bgf" type="number" inputMode="decimal" value={i.bgf ?? ""} onChange={set("bgf")} /> })}
          </div>
          {L({ id: "nutzung", en: "Type of use", de: "Nutzungsart", muss: true, children: <input id="nutzung" type="text" list="katl" value={i.nutzung ?? ""} onChange={set("nutzung")} /> })}
          {L({ id: "umbau", en: "Past alterations", de: "Umbaumaßnahmen", muss: true, children: <textarea id="umbau" value={i.umbau ?? ""} onChange={set("umbau")} /> })}
          <div className="grid2">
            <div className="field"><label htmlFor="fa">Floors above ground</label><input id="fa" type="number" min={1} max={60} required inputMode="numeric" value={i.floorsAbove ?? ""} onChange={set("floorsAbove")} /></div>
            <div className="field"><label htmlFor="fb">Basement floors</label><input id="fb" type="number" min={0} max={6} inputMode="numeric" value={i.basements ?? 0} onChange={set("basements")} /></div>
          </div>
          <p className="small muted">BRI and BGF according to DIN 277, building class according to MBO § 2 Abs. 3, category and use according to HOAI Anlage 10.2.</p>
          <div className="footer"><button className="btn primary" type="submit">Start inventory</button></div>
        </form>
      </main>
    </>
  );
}
