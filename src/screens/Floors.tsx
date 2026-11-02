import { useState } from "react";
import { Icon } from "../components/Icon";
import { ModeChip } from "../components/ModeChip";
import { TopBar } from "../components/TopBar";
import { floorLabel, floorsOf } from "../domain/fields";
import { navigate } from "../lib/nav";
import { elementsOf, saveProject, useData } from "../lib/store";

export function Floors({ pid }: { pid: string }) {
  const p = useData().projects[pid];
  const floors = p ? floorsOf(p.info) : [0];
  const [floor, setFloorState] = useState(() => (p && floors.includes(p.lastFloor ?? 0) ? p.lastFloor ?? 0 : 0));
  if (!p) return null;
  const setFloor = (f: number) => { setFloorState(f); p.lastFloor = f; saveProject(p); };

  const n = floors.length, show = Math.min(n, 8);
  const idx = floors.indexOf(floor);
  const start = Math.max(0, Math.min(idx - Math.floor(show / 2), n - show));
  const vis = floors.slice(start, start + show);
  const gap = 34, h = 40 + gap * (vis.length - 1) + 40;
  const rooms = p.rooms.filter(r => r.floor === floor);
  const savedTotal = elementsOf(p.id).filter(e => e.status === "saved").length;

  return (
    <>
      <TopBar title={p.name} onBack={() => navigate({ name: "menu" })}>
        <ModeChip project={p} back={{ name: "floors", pid }} />
        <button className="iconbtn" onClick={() => navigate({ name: "export", pid })} aria-label="Finish and export"><Icon name="save" /></button>
      </TopBar>
      <main className="wrap">
        <div className="row">
          <div className="grow"><span className="eyebrow">Floors · select one to inventory</span></div>
          <button className="btn sm ghost" onClick={() => navigate({ name: "building", pid })}><Icon name="info" /> Building info</button>
        </div>
        <div className="floors">
          {n > show && <button className="btn sm ghost" disabled={start === 0} onClick={() => setFloor(floors[Math.max(0, idx - 4)])}>Higher floors ↑</button>}
          <svg viewBox={`0 0 340 ${h}`} role="group" aria-label="Floors">
            {/* painted bottom-up, so the highest floor sits in front and basements at the back */}
            {vis.map((f, k) => ({ f, k })).reverse().map(({ f, k }) => {
              const y = 14 + k * gap, sel = f === floor, count = p.rooms.filter(r => r.floor === f).length;
              const fill = sel ? "var(--primary)" : f < 0 ? "var(--sage-deep)" : "var(--sage)";
              return (
                <g key={f} className="floor-shape" tabIndex={0} role="button" aria-label={`${floorLabel(f)}, ${count} rooms`}
                  onClick={() => setFloor(f)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFloor(f); } }}>
                  <polygon points={`70,${y + 40} 110,${y} 330,${y} 290,${y + 40}`} fill={fill} stroke="var(--sage-deep)" strokeWidth={1.5} />
                  <text x={56} y={y + 26} textAnchor="end" style={{ fontFamily: "var(--f-mono)", fontSize: 12, fill: "var(--fg)" }}>{floorLabel(f)}</text>
                  {count > 0 && <text x={200} y={y + 25} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: sel ? "var(--on-primary)" : "#1E2412" }}>{count} room{count > 1 ? "s" : ""}</text>}
                </g>
              );
            })}
          </svg>
          {n > show && <button className="btn sm ghost" disabled={start + show >= n} onClick={() => setFloor(floors[Math.min(n - 1, idx + 4)])}>Lower floors ↓</button>}
        </div>
        <div className="section-title"><h3>{floorLabel(floor)} · rooms</h3><span className="small muted">{savedTotal} elements in project</span></div>
        <div className="list">
          {rooms.length === 0 ? <div className="empty">No rooms on this floor yet.</div> : rooms.map(r => {
            const rc = elementsOf(p.id, r.id), saved = rc.filter(e => e.status === "saved").length;
            return (
              <button key={r.id} className="li" onClick={() => navigate({ name: "room", pid, roomId: r.id })}>
                <div className="grow"><div className="t">{r.name || r.useLabel}</div><div className="s tag">{r.tag}</div></div>
                <span className={"pill" + (saved && saved === rc.length ? " ok" : "")}>{saved}/{rc.length}</span>
              </button>
            );
          })}
        </div>
        <button className="btn block" onClick={() => navigate({ name: "addRoom", pid, floor })}><Icon name="plus" /> Add room</button>
      </main>
    </>
  );
}
