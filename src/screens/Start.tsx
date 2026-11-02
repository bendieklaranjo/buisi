import { BuildingIllustration } from "../components/BuildingIllustration";
import { navigate } from "../lib/nav";

export function Start() {
  return (
    <button className="splash wrap" onClick={() => navigate({ name: "menu" })} aria-label="Open SwissInv-Beta">
      <div><div className="brand">SwissInv<span className="beta">Beta</span></div><div className="sub">Reuse<br />inventory tool</div></div>
      <div className="phone"><BuildingIllustration /></div>
      <div className="go"><span>Tap to start</span><span>v0.2 · Swiss-Inv 1.0</span></div>
    </button>
  );
}
