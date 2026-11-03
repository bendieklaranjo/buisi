import { useState } from "react";
import { FieldInput } from "../components/FieldInput";
import { Progress } from "../components/Progress";
import { StepFooter } from "../components/StepFooter";
import { TopBar } from "../components/TopBar";
import { ELEMENT_FIELD, PROJECT_DEFAULT_KEYS } from "../domain/swissinv";
import { t, useLang } from "../i18n";
import { back, home, navigate } from "../lib/nav";
import { elementsOf, saveProject, useData } from "../lib/store";

/** Beginning of the inventory: values for all elements + floors for the app. */
export function Defaults({ pid }: { pid: string }) {
  useLang();
  const p = useData().projects[pid];
  const [d, setD] = useState<Record<string, string>>(() => ({ ...(p?.defaults ?? {}) }));
  const [above, setAbove] = useState(String(p?.info.floorsAbove ?? ""));
  const [below, setBelow] = useState(String(p?.info.basements ?? 0));
  if (!p) return null;
  const els = elementsOf(p.id), saved = els.filter(e => e.status === "saved").length;

  const save = () => {
    p.defaults = d;
    p.info = { floorsAbove: Math.max(1, Math.min(60, parseInt(above, 10) || 1)), basements: Math.max(0, Math.min(6, parseInt(below, 10) || 0)) };
    saveProject(p);
  };
  const next = () => { save(); navigate({ name: "floors", pid }); };

  return (
    <>
      <TopBar title={t("inv.title")} onBack={() => { save(); back(); }} onHome={() => { save(); home(pid); }} />
      <Progress value={saved} max={Math.max(1, els.length)} label={t("inv.progress", { saved, total: els.length })} />
      <main className="wrap">
        <h2>{t("inv.defaults")}</h2>
        <p className="small muted">{t("inv.defaultsText")}</p>
        {PROJECT_DEFAULT_KEYS.map(k => (
          <FieldInput key={k} def={{ ...ELEMENT_FIELD[k], hint: undefined, hintEn: undefined }} value={d[k] ?? ""} onChange={v => setD({ ...d, [k]: v })} />
        ))}
        <h3 className="section-h">{t("inv.floors")}</h3>
        <p className="small muted">{t("inv.floorsText")} {p.gwr?.gastw ? t("inv.floorsReg", { n: p.gwr.gastw }) : ""}</p>
        <div className="grid2">
          <div className="field"><label htmlFor="fa">{t("inv.above")}</label><input id="fa" type="number" min={1} max={60} inputMode="numeric" value={above} onChange={e => setAbove(e.target.value)} /></div>
          <div className="field"><label htmlFor="fb">{t("inv.below")}</label><input id="fb" type="number" min={0} max={6} inputMode="numeric" value={below} onChange={e => setBelow(e.target.value)} /></div>
        </div>
        <StepFooter onBack={() => { save(); back(); }} onSkip={next} onNext={next} nextLabel={t("inv.start")} />
      </main>
    </>
  );
}
