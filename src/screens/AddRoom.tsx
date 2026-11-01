import { useState, type FormEvent } from "react";
import { TopBar } from "../components/TopBar";
import { USES, floorLabel, makeRoomTag } from "../domain/fields";
import type { Room } from "../domain/types";
import { back, navigate } from "../lib/nav";
import { nid, saveProject, useData } from "../lib/store";

export function AddRoom({ pid, floor }: { pid: string; floor: number }) {
  const p = useData().projects[pid];
  const [name, setName] = useState("");
  const [use, setUse] = useState(USES[0][1]);
  const [other, setOther] = useState("");
  if (!p) return null;
  const code = use === "OTH" && other.trim() ? other.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "OTH" : use;
  const tag = makeRoomTag(p.rooms, floor, code);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const label = use === "OTH" ? other.trim() || "Other" : USES.find(u => u[1] === use)![0];
    const r: Room = { id: nid(), floor, name: name.trim(), useCode: code, useLabel: label, tag, detections: [], createdAt: Date.now() };
    p.rooms.push(r);
    saveProject(p);
    navigate({ name: "room", pid, roomId: r.id }, true);
  };

  return (
    <>
      <TopBar title={`${floorLabel(floor)} · new room`} onBack={back} />
      <main className="wrap">
        <h2>New room</h2>
        <form className="stack" onSubmit={submit}>
          <div className="field"><label htmlFor="rname">Room name</label><input id="rname" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Office 2.14" /></div>
          <div className="field"><label htmlFor="ruse">Main use</label>
            <select id="ruse" value={use} onChange={e => setUse(e.target.value)}>{USES.map(([l, c]) => <option key={c} value={c}>{l}</option>)}</select></div>
          {use === "OTH" && <div className="field"><label htmlFor="rother">Describe the use</label><input id="rother" type="text" value={other} onChange={e => setOther(e.target.value)} /></div>}
          <div className="card"><span className="eyebrow">Room tag</span><div className="tag" style={{ fontSize: 20, marginTop: 4 }}>{tag}</div><p className="small muted">Floor_Use_Number, created automatically.</p></div>
          <div className="footer"><button className="btn primary" type="submit">Create room</button></div>
        </form>
      </main>
    </>
  );
}
