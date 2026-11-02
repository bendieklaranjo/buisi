import { useState, type FormEvent } from "react";
import { ModeToggle } from "../components/ModeToggle";
import { TopBar } from "../components/TopBar";
import { DEFAULT_PROJECT_TYPE, PROJECT_TYPES } from "../domain/fields";
import { EXPERT_KEYS } from "../domain/swissinv";
import type { Mode } from "../domain/types";
import { back, navigate } from "../lib/nav";
import { nid, rememberedExpert, saveProject, useData } from "../lib/store";

export function ProjectForm({ pid }: { pid?: string }) {
  const { projects } = useData();
  const p = pid ? projects[pid] : undefined;
  const [name, setName] = useState(p?.name ?? "");
  const [type, setType] = useState(p?.type || DEFAULT_PROJECT_TYPE);
  const [mode, setMode] = useState<Mode>(p?.mode ?? "assisted");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    let proj = p;
    if (!proj) {
      // new project: pre-fill the auditor from the last project on this device
      const ex = rememberedExpert();
      const building: Record<string, string> = { land: "Schweiz" };
      for (const k of EXPERT_KEYS) if (ex[k]) building[k] = ex[k];
      proj = { id: nid(), name: "", type: "", mode: "assisted", building, buildingSuggested: { ...building }, defaults: { status: "eingebaut" }, info: {}, rooms: [], createdAt: now, updatedAt: now };
    }
    Object.assign(proj, { name: name.trim(), type, mode });
    saveProject(proj);
    navigate(proj.info.floorsAbove ? { name: "floors", pid: proj.id } : { name: "address", pid: proj.id }, !p);
  };

  return (
    <>
      <TopBar title={p ? "Project" : "New project"} onBack={back} />
      <main className="wrap">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">Step 1 of 3</span><h2>Project</h2></div>
        <form className="stack" onSubmit={submit}>
          <div className="field"><label htmlFor="name">Project name <span className="de">optional – the building name from the register is used if empty</span></label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hönggerberg HIL, wing C" /></div>
          <fieldset className="field radio-list">
            <legend className="flabel">Project type</legend>
            {PROJECT_TYPES.map(t => (
              <label key={t.label} className={"check" + (t.available ? "" : " disabled")}>
                <input type="radio" name="ptype" value={t.label} checked={type === t.label} disabled={!t.available} onChange={() => setType(t.label)} />
                <span>{t.label}{!t.available && <em className="soon">coming soon</em>}</span>
              </label>
            ))}
          </fieldset>
          <div className="field"><span className="flabel">Inventory mode for the time study</span>
            <ModeToggle value={mode} onChange={setMode} />
            <p className="small muted">Every element records which mode it was captured in, so you can compare time per element later. You can switch at any time.</p></div>
          <div className="footer"><button className="btn primary" type="submit">Continue</button></div>
        </form>
      </main>
    </>
  );
}
