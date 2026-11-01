import { useState } from "react";
import { BuildingIllustration } from "../components/BuildingIllustration";
import { TopBar } from "../components/TopBar";
import { exportCSV, exportPDF, exportXLSX, inventoryRows } from "../lib/export";
import { back, navigate } from "../lib/nav";
import { elementsOf, useData } from "../lib/store";

export function ExportScreen({ pid }: { pid: string }) {
  const p = useData().projects[pid];
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  if (!p) return null;
  const rows = inventoryRows(p);
  const open = elementsOf(p.id).filter(e => e.status !== "saved").length;

  const run = async (fn: () => void | Promise<void>) => {
    setMsg("Preparing file…");
    try { await fn(); setMsg(""); setDone(true); }
    catch (e) { console.warn(e); setMsg("The export failed. Try CSV instead."); }
  };

  if (done) return (
    <>
      <TopBar title="Export" onBack={back} />
      <main className="wrap">
        <div style={{ padding: "20px 10%" }}><BuildingIllustration /></div>
        <h2>Inventory exported</h2>
        <p className="muted">{rows.length} elements from {p.name}.</p>
        <div className="footer"><button className="btn" onClick={() => setDone(false)}>Export another format</button><button className="btn primary" onClick={() => navigate({ name: "menu" })}>Back to projects</button></div>
      </main>
    </>
  );

  return (
    <>
      <TopBar title="Export" onBack={back} />
      <main className="wrap">
        <h2>Export to</h2>
        <p className="muted">{rows.length} saved element{rows.length === 1 ? "" : "s"} in {p.rooms.length} room{p.rooms.length === 1 ? "" : "s"}.{open ? ` ${open} open element${open > 1 ? "s" : ""} will be left out.` : ""}</p>
        <div className="bigchoice">
          <button className="btn sage" disabled={!rows.length} onClick={() => run(() => exportPDF(p))}>PDF <span className="small">report</span></button>
          <button className="btn sage" disabled={!rows.length} onClick={() => run(() => exportXLSX(p))}>Excel <span className="small">.xlsx</span></button>
          <button className="btn sage" disabled={!rows.length} onClick={() => run(() => exportCSV(p))}>CSV <span className="small">.csv</span></button>
        </div>
        <p className="small muted">Excel includes three sheets: inventory, building information and time study. Reuse marketplace upload is planned.</p>
        <div className={"status" + (msg === "Preparing file…" ? " busy" : "")}>{msg}</div>
      </main>
    </>
  );
}
