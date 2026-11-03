import { Toast } from "./components/Toast";
import { useLang } from "./i18n";
import { useRoute } from "./lib/nav";
import { AddRoom } from "./screens/AddRoom";
import { Defaults } from "./screens/Defaults";
import { ElementScreen } from "./screens/ElementScreen";
import { ExportScreen } from "./screens/Export";
import { Floors } from "./screens/Floors";
import { Hub } from "./screens/Hub";
import { Info } from "./screens/Info";
import { Language } from "./screens/Language";
import { Menu } from "./screens/Menu";
import { ModeSwitch } from "./screens/ModeSwitch";
import { ProjectForm } from "./screens/ProjectForm";
import { RoomScreen } from "./screens/Room";
import { Start } from "./screens/Start";
import { Study } from "./screens/Study";

/**
 * Screen switch. Flow: Start → Language → Menu → Project → Project menu (hub) with
 * Projektinformationen (4 step pages) · Inventar (defaults → floors → rooms → element step pages) · Export.
 */
export function App() {
  useLang();
  const r = useRoute();
  let screen;
  switch (r.name) {
    case "start": screen = <Start />; break;
    case "language": screen = <Language />; break;
    case "menu": screen = <Menu />; break;
    case "project": screen = <ProjectForm key={r.pid ?? "new"} pid={r.pid} />; break;
    case "hub": screen = <Hub pid={r.pid} />; break;
    case "info": screen = <Info key={r.pid + r.step} pid={r.pid} step={r.step} />; break;
    case "defaults": screen = <Defaults pid={r.pid} />; break;
    case "floors": screen = <Floors key={r.pid} pid={r.pid} />; break;
    case "mode": screen = <ModeSwitch pid={r.pid} />; break;
    case "addRoom": screen = <AddRoom pid={r.pid} floor={r.floor} />; break;
    case "room": screen = <RoomScreen key={r.roomId} pid={r.pid} roomId={r.roomId} />; break;
    case "element": screen = <ElementScreen key={r.elementId} pid={r.pid} elementId={r.elementId} step={r.step ?? 0} />; break;
    case "export": screen = <ExportScreen pid={r.pid} />; break;
    case "study": screen = <Study />; break;
    default: screen = <Menu />;
  }
  return <>{screen}<Toast /></>;
}
