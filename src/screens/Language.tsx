import { TopBar } from "../components/TopBar";
import { LANGUAGES, setLang, t, useLang, type Lang } from "../i18n";
import { navigate } from "../lib/nav";

/** Language selection after the start screen. French and Italian are announced as coming soon. */
export function Language() {
  const cur = useLang();
  const pick = (l: Lang) => { setLang(l); navigate({ name: "menu" }); };
  return (
    <>
      <TopBar title="SwissInv-Beta" />
      <main className="wrap">
        <h2>{t("lang.title")}</h2>
        <div className="bigchoice">
          {LANGUAGES.map(l => (
            <button key={l.code} className={"btn " + (l.available ? (l.code === cur ? "primary" : "") : "ghost")} disabled={!l.available} onClick={() => pick(l.code as Lang)}>
              {l.name}{!l.available && <span className="soon">{t("lang.soon")}</span>}
            </button>
          ))}
        </div>
      </main>
    </>
  );
}
