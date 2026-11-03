import { ModeToggle } from "../components/ModeToggle";
import { TopBar } from "../components/TopBar";
import { t, useLang } from "../i18n";
import { back } from "../lib/nav";
import { saveProject, useData } from "../lib/store";

export function ModeSwitch({ pid }: { pid: string }) {
  useLang();
  const p = useData().projects[pid];
  if (!p) return null;
  return (
    <>
      <TopBar title={t("mode.title")} onBack={back} />
      <main className="wrap">
        <h2>{t("mode.question")}</h2>
        <p className="muted">{t("mode.text")}</p>
        <ModeToggle value={p.mode} onChange={m => { p.mode = m; saveProject(p); }} />
        <div className="footer"><button className="btn primary" onClick={back}>{t("c.done")}</button></div>
      </main>
    </>
  );
}
