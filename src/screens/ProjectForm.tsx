import { useState, type FormEvent } from "react";
import { ModeToggle } from "../components/ModeToggle";
import { TopBar } from "../components/TopBar";
import { PROJECT_TYPES } from "../domain/fields";
import type { Mode, Project } from "../domain/types";
import { back, navigate } from "../lib/nav";
import { nid, saveProject, useData } from "../lib/store";

export function ProjectForm({ pid }: { pid?: string }) {
  const { projects } = useData();
  const p = pid ? projects[pid] : undefined;
  const [name, setName] = useState(p?.name ?? "");
  const [client, setClient] = useState(p?.client ?? "");
  const [type, setType] = useState(p?.type ?? PROJECT_TYPES[0]);
  const [mode, setMode] = useState<Mode>(p?.mode ?? "assisted");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const proj: Project = p ?? { id: nid(), name: "", client: "", type: "", mode: "assisted", street: "", nr: "", zip: "", city: "", info: {}, rooms: [], createdAt: now, updatedAt: now };
    Object.assign(proj, { name: name.trim() || "Untitled project", client: client.trim(), type, mode });
    saveProject(proj);
    navigate(proj.info.floorsAbove ? { name: "floors", pid: proj.id } : { name: "address", pid: proj.id }, !p);
  };

  return (
    <>
      <TopBar title={p ? "Project" : "New project"} onBack={back} />
      <main className="wrap">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">Step 1 of 3</span><h2>Project</h2></div>
        <form className="stack" onSubmit={submit}>
          <div className="field"><label htmlFor="name">Project name</label><input id="name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hönggerberg HIL, wing C" /></div>
          <div className="field"><label htmlFor="client">Client</label><input id="client" type="text" value={client} onChange={e => setClient(e.target.value)} /></div>
          <div className="field"><label htmlFor="ptype">Project type</label>
            <select id="ptype" value={type} onChange={e => setType(e.target.value)}>{PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="field"><span className="flabel">Inventory mode for the time study</span>
            <ModeToggle value={mode} onChange={setMode} />
            <p className="small muted">Every element records which mode it was captured in, so you can compare time per element later. You can switch at any time.</p></div>
          <div className="footer"><button className="btn primary" type="submit">Continue</button></div>
        </form>
      </main>
    </>
  );
}
