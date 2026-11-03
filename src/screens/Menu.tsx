import { BuildingIllustration } from "../components/BuildingIllustration";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { t, useLang } from "../i18n";
import { navigate } from "../lib/nav";
import { elementsOf, useData } from "../lib/store";

/** Main menu: start or resume a project, time study. */
export function Menu() {
  const L = useLang();
  const { ready, projects } = useData();
  const list = Object.values(projects).sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <>
      <TopBar title="SwissInv-Beta">
        <button className="mode" onClick={() => navigate({ name: "language" })} title={t("c.language")}><Icon name="globe" size={14} /> {L.toUpperCase()}</button>
      </TopBar>
      <main className="wrap">
        <div className="hero-menu">
          <BuildingIllustration width={150} />
          <div className="stack" style={{ gap: 6 }}><span className="eyebrow">{t("menu.eyebrow")}</span><h2>{t("menu.headline")}</h2></div>
        </div>
        <div className="bigchoice">
          <button className="btn primary" onClick={() => navigate({ name: "project" })}>{t("menu.new")} <span aria-hidden="true">→</span></button>
        </div>
        <div className="section-title"><h3>{t("menu.resume")}</h3><span className="small muted">{list.length === 1 ? t("menu.count1") : t("menu.count", { n: list.length })}</span></div>
        <div className="list">
          {!ready ? <div className="empty status busy">{t("menu.loading")}</div>
            : list.length === 0 ? <div className="empty">{t("menu.empty")}</div>
            : list.map(p => {
              const saved = elementsOf(p.id).filter(e => e.status === "saved").length;
              const b = p.building;
              const sub = [[b.adresse, b.hausnummer].filter(Boolean).join(" "), [b.plz, b.ort].filter(Boolean).join(" "), b.egid && `EGID ${b.egid}`].filter(Boolean).join(" · ");
              return (
                <button key={p.id} className="li" onClick={() => navigate({ name: "hub", pid: p.id })}>
                  <div className="grow"><div className="t">{p.name}</div><div className="s">{sub}</div></div>
                  <span className={"pill" + (saved ? " ok" : "")}>{t("menu.elements", { n: saved })}</span>
                </button>
              );
            })}
        </div>
        <button className="btn ghost" onClick={() => navigate({ name: "study" })}><Icon name="chart" /> {t("menu.study")}</button>
        <p className="small muted">{t("menu.storage")}</p>
      </main>
    </>
  );
}
