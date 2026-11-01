import { BuildingIllustration } from "../components/BuildingIllustration";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { navigate } from "../lib/nav";
import { elementsOf, useData } from "../lib/store";

export function Menu() {
  const { ready, projects } = useData();
  const list = Object.values(projects).sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <>
      <TopBar title="BUISI" />
      <main className="wrap">
        <div className="hero-menu">
          <BuildingIllustration width={120} />
          <div className="stack" style={{ gap: 6 }}><span className="eyebrow">Building stock inventory</span><h2>Document reusable components, room by room.</h2></div>
        </div>
        <div className="bigchoice">
          <button className="btn primary" onClick={() => navigate({ name: "project" })}>Start new project <span aria-hidden="true">→</span></button>
        </div>
        <div className="section-title"><h3>Resume project</h3><span className="small muted">{list.length} project{list.length === 1 ? "" : "s"}</span></div>
        <div className="list">
          {!ready ? <div className="empty status busy">Loading your projects…</div>
            : list.length === 0 ? <div className="empty">No projects yet. Start one to begin your first inventory.</div>
            : list.map(p => {
              const saved = elementsOf(p.id).filter(e => e.status === "saved").length;
              const sub = [p.client, [p.street, p.nr].filter(Boolean).join(" "), p.city].filter(Boolean).join(" · ") || p.type;
              return (
                <button key={p.id} className="li" onClick={() => navigate(p.info.floorsAbove ? { name: "floors", pid: p.id } : { name: "address", pid: p.id })}>
                  <div className="grow"><div className="t">{p.name}</div><div className="s">{sub}</div></div>
                  <span className={"pill" + (saved ? " ok" : "")}>{saved} elements</span>
                </button>
              );
            })}
        </div>
        <button className="btn ghost" onClick={() => navigate({ name: "study" })}><Icon name="chart" /> Time study results</button>
        <p className="small muted">Data is stored on this device. Export regularly.</p>
      </main>
    </>
  );
}
