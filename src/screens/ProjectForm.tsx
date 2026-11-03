import { useState, type FormEvent } from "react";
import { ModeToggle } from "../components/ModeToggle";
import { TopBar } from "../components/TopBar";
import { DEFAULT_PROJECT_TYPE, PROJECT_TYPES } from "../domain/fields";
import { EXPERT_KEYS } from "../domain/swissinv";
import type { Mode } from "../domain/types";
import { opt, t, useLang } from "../i18n";
import { back, home, navigate } from "../lib/nav";
import { nid, rememberedExpert, saveProject, useData } from "../lib/store";

export function ProjectForm({ pid }: { pid?: string }) {
  useLang();
  const { projects } = useData();
  const p = pid ? projects[pid] : undefined;
  const [name, setName] = useState(p?.name ?? "");
  const [type, setType] = useState(p?.type || DEFAULT_PROJECT_TYPE);
  const [mode, setMode] = useState<Mode>(p?.mode ?? "assisted");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    let proj = p;
    if (!proj) {
      // new project: pre-fill the auditor from the last project on this device
      const ex = rememberedExpert();
      const building: Record<string, string> = { land: "Schweiz" };
      for (const k of EXPERT_KEYS) if (ex[k]) building[k] = ex[k];
      proj = { id: nid(), name: "", type: "", mode: "assisted", building, buildingSuggested: { ...building }, defaults: { status: "eingebaut" }, info: {}, rooms: [], createdAt: now, updatedAt: now };
    }
    Object.assign(proj, { name: name.trim(), type, mode });
    saveProject(proj);
    navigate({ name: "hub", pid: proj.id }, !p);
  };

  return (
    <>
      <TopBar title={p ? t("proj.edit") : t("proj.new")} onBack={back} onHome={() => home(p?.id)} homeLabel={p ? t("c.home") : t("c.mainMenu")} />
      <main className="wrap">
        <h2>{t("proj.title")}</h2>
        <form className="stack" onSubmit={submit}>
          <div className="field"><label htmlFor="name">{t("proj.name")}</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t("proj.namePh")} />
            <div className="hint">{t("proj.nameHint")}</div></div>
          <fieldset className="field radio-list">
            <legend className="flabel">{t("proj.type")}</legend>
            {PROJECT_TYPES.map(pt => (
              <label key={pt.label} className={"check" + (pt.available ? "" : " disabled")}>
                <input type="radio" name="ptype" value={pt.label} checked={type === pt.label} disabled={!pt.available} onChange={() => setType(pt.label)} />
                <span>{opt(pt.label)}{!pt.available && <em className="soon">{t("lang.soon")}</em>}</span>
              </label>
            ))}
          </fieldset>
          <div className="field"><span className="flabel">{t("proj.mode")}</span>
            <ModeToggle value={mode} onChange={setMode} />
            <p className="small muted">{t("proj.modeHint")}</p></div>
          <div className="footer"><button className="btn primary" type="submit">{t("c.continue")}</button></div>
        </form>
      </main>
    </>
  );
}
