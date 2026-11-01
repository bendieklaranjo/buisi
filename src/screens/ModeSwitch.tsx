import { ModeToggle } from "../components/ModeToggle";
import { TopBar } from "../components/TopBar";
import { back } from "../lib/nav";
import { saveProject, useData } from "../lib/store";

export function ModeSwitch({ pid }: { pid: string }) {
  const p = useData().projects[pid];
  if (!p) return null;
  return (
    <>
      <TopBar title="Inventory mode" onBack={back} />
      <main className="wrap">
        <h2>Which mode for the next elements?</h2>
        <p className="muted">Elements you already captured keep the mode they were captured in. Switch per room or per building half so both modes see comparable elements.</p>
        <ModeToggle value={p.mode} onChange={m => { p.mode = m; saveProject(p); }} />
        <div className="footer"><button className="btn primary" onClick={back}>Done</button></div>
      </main>
    </>
  );
}
