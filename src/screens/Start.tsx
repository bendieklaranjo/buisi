import { t, useLang } from "../i18n";
import { navigate } from "../lib/nav";

/** Splash with the SwissInv illustration. */
export function Start() {
  useLang();
  return (
    <button className="splash wrap" onClick={() => navigate({ name: "language" })} aria-label="SwissInv-Beta">
      <div><div className="brand">SwissInv<span className="beta">Beta</span></div><div className="sub">{t("start.sub").split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</div></div>
      <img className="splash-img" src={import.meta.env.BASE_URL + "illustration.png"} alt="" />
      <div className="go"><span>{t("start.tap")}</span><span>v0.3 · Swiss-Inv 1.0</span></div>
    </button>
  );
}
