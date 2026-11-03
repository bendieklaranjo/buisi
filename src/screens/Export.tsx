import { useState } from "react";
import { BuildingIllustration } from "../components/BuildingIllustration";
import { TopBar } from "../components/TopBar";
import { t, useLang } from "../i18n";
import { elementTable, exportCSV, exportPDF, exportXLSX, exportZIP } from "../lib/export";
import { back, home } from "../lib/nav";
import { elementsOf, useData } from "../lib/store";

export function ExportScreen({ pid }: { pid: string }) {
  useLang();
  const p = useData().projects[pid];
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  if (!p) return null;
  const rows = elementTable(p).slice(1);
  const open = elementsOf(p.id).filter(e => e.status !== "saved").length;

  const run = async (fn: () => void | Promise<void>) => {
    setMsg(t("ex.preparing"));
    try { await fn(); setMsg(""); setDone(true); }
    catch (e) { console.warn(e); setMsg(t("ex.failed")); }
  };

  if (done) return (
    <>
      <TopBar title={t("ex.title")} onBack={back} onHome={() => home(pid)} />
      <main className="wrap">
        <div style={{ padding: "20px 10%" }}><BuildingIllustration /></div>
        <h2>{t("ex.done")}</h2>
        <p className="muted">{t("ex.doneText", { n: rows.length, p: p.name })}</p>
        <div className="footer"><button className="btn" onClick={() => setDone(false)}>{t("ex.another")}</button><button className="btn primary" onClick={() => home(pid)}>{t("c.home")}</button></div>
      </main>
    </>
  );

  return (
    <>
      <TopBar title={t("ex.title")} onBack={back} onHome={() => home(pid)} />
      <main className="wrap">
        <h2>{t("ex.head")}</h2>
        <p className="muted">{t("ex.count", { n: rows.length, r: p.rooms.length })}{open ? t("ex.open", { n: open }) : ""}</p>
        <div className="bigchoice">
          <button className="btn sage" disabled={!rows.length} onClick={() => run(() => exportZIP(p))}>{t("ex.zip")} <span className="small">.zip</span></button>
          <button className="btn sage" disabled={!rows.length} onClick={() => run(() => exportXLSX(p))}>Excel <span className="small">.xlsx</span></button>
          <button className="btn sage" disabled={!rows.length} onClick={() => run(() => exportPDF(p))}>{t("ex.pdf")} <span className="small">{t("ex.report")}</span></button>
          <button className="btn sage" disabled={!rows.length} onClick={() => run(() => exportCSV(p))}>CSV <span className="small">.csv</span></button>
        </div>
        <p className="small muted">{t("ex.note")}</p>
        <div className={"status" + (msg === t("ex.preparing") ? " busy" : "")}>{msg}</div>
      </main>
    </>
  );
}
