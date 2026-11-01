import { BuildingIllustration } from "../components/BuildingIllustration";
import { navigate } from "../lib/nav";

export function Start() {
  return (
    <button className="splash wrap" onClick={() => navigate({ name: "menu" })} aria-label="Open BUISI">
      <div><div className="brand">BUISI</div><div className="sub">Building stock<br />inventory tool</div></div>
      <div className="phone"><BuildingIllustration /></div>
      <div className="go"><span>Tap to start</span><span>v0.1</span></div>
    </button>
  );
}
