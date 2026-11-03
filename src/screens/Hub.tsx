import { Icon } from "../components/Icon";
import { ModeChip } from "../components/ModeChip";
import { TopBar } from "../components/TopBar";
import { BUILDING_FIELDS, missingBuildingMuss } from "../domain/swissinv";
import { t, useLang } from "../i18n";
import { home, navigate } from "../lib/nav";
import { elementsOf, usePhotoUrl, useData } from "../lib/store";

/** Project menu: Projektinformationen · Inventar · Export. */
export function Hub({ pid }: { pid: string }) {
  useLang();
  const p = useData().projects[pid];
  const img = usePhotoUrl(p?.imageId);
  if (!p) return null;
  const mussTotal = BUILDING_FIELDS.filter(f => f.req === "muss").length;
  const mussDone = mussTotal - missingBuildingMuss(p.building).length;
  const els = elementsOf(p.id), saved = els.filter(e => e.status === "saved").length;
  const inventoryStarted = p.rooms.length > 0; // until the first room exists, the inventory starts with its defaults page
  const b = p.building;

  return (
    <>
      <TopBar title={p.name || t("proj.new")} onBack={() => home()} onHome={() => home()} homeLabel={t("c.mainMenu")}>
        <ModeChip project={p} back={{ name: "hub", pid }} />
      </TopBar>
      <main className="wrap">
        <div className="hub-head">
          {img && <img src={img} alt="" className="hub-img" />}
          <div className="stack" style={{ gap: 4, minWidth: 0 }}>
            <span className="eyebrow">{t("hub.eyebrow")}</span>
            <h2>{p.name}</h2>
            <span className="small muted">{[[b.adresse, b.hausnummer].filter(Boolean).join(" "), [b.plz, b.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</span>
          </div>
        </div>
        <div className="hub-cards">
          <button className="hub-card" onClick={() => navigate({ name: "info", pid, step: 0 })}>
            <span className="hub-n">1</span>
            <div className="grow"><div className="t">{t("hub.info")}</div><div className="s">{t("hub.infoSub")}</div>
              <div className="mini-track"><div style={{ width: `${(mussDone / mussTotal) * 100}%` }} /></div>
              <div className="s">{t("hub.infoProgress", { done: mussDone, total: mussTotal })}</div></div>
            <Icon name="next" />
          </button>
          <button className="hub-card" onClick={() => navigate(inventoryStarted ? { name: "floors", pid } : { name: "defaults", pid })}>
            <span className="hub-n">2</span>
            <div className="grow"><div className="t">{t("hub.inventory")}</div>
              <div className="mini-track"><div style={{ width: `${els.length ? (saved / els.length) * 100 : 0}%` }} /></div>
              <div className="s">{t("hub.inventorySub", { rooms: p.rooms.length, saved, total: els.length })}</div></div>
            <Icon name="next" />
          </button>
          <button className="hub-card" onClick={() => navigate({ name: "export", pid })}>
            <span className="hub-n">3</span>
            <div className="grow"><div className="t">{t("hub.export")}</div><div className="s">{t("hub.exportSub")}</div></div>
            <Icon name="next" />
          </button>
        </div>
        <button className="btn ghost" onClick={() => navigate({ name: "project", pid })}>{t("hub.editProject")}</button>
      </main>
    </>
  );
}
