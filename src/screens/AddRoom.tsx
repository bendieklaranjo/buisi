import { useState, type FormEvent } from "react";
import { TopBar } from "../components/TopBar";
import { USES, floorLabel, makeRoomTag } from "../domain/fields";
import type { Room } from "../domain/types";
import { getLang, t, useLang } from "../i18n";
import { back, home, navigate } from "../lib/nav";
import { nid, saveProject, useData } from "../lib/store";

export function AddRoom({ pid, floor }: { pid: string; floor: number }) {
  useLang();
  const p = useData().projects[pid];
  const [name, setName] = useState("");
  const [use, setUse] = useState(USES[0].code);
  const [other, setOther] = useState("");
  if (!p) return null;
  const code = use === "OTH" && other.trim() ? other.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "OTH" : use;
  const tag = makeRoomTag(p.rooms, floor, code);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const u = USES.find(x => x.code === use)!;
    const r: Room = { id: nid(), floor, name: name.trim(), useCode: code, useLabel: use === "OTH" ? other.trim() || u.de : u.de, tag, createdAt: Date.now() };
    p.rooms.push(r);
    saveProject(p);
    navigate({ name: "room", pid, roomId: r.id }, true);
  };

  return (
    <>
      <TopBar title={t("room.newTitle", { floor: floorLabel(floor) })} onBack={back} onHome={() => home(pid)} />
      <main className="wrap">
        <h2>{t("room.new")}</h2>
        <form className="stack" onSubmit={submit}>
          <div className="field"><label htmlFor="rname">{t("room.name")}</label><input id="rname" type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t("room.namePh")} /></div>
          <div className="field"><label htmlFor="ruse">{t("room.use")}</label>
            <select id="ruse" value={use} onChange={e => setUse(e.target.value)}>{USES.map(u => <option key={u.code} value={u.code}>{u[getLang()]}</option>)}</select></div>
          {use === "OTH" && <div className="field"><label htmlFor="rother">{t("room.other")}</label><input id="rother" type="text" value={other} onChange={e => setOther(e.target.value)} /></div>}
          <div className="card"><span className="eyebrow">{t("room.tag")}</span><div className="tag" style={{ fontSize: 20, marginTop: 4 }}>{tag}</div><p className="small muted">{t("room.tagHint")}</p></div>
          <div className="footer"><button className="btn primary" type="submit">{t("room.create")}</button></div>
        </form>
      </main>
    </>
  );
}
