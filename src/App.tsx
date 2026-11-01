import { Toast } from "./components/Toast";
import { useRoute } from "./lib/nav";
import { Address } from "./screens/Address";
import { AddRoom } from "./screens/AddRoom";
import { Building } from "./screens/Building";
import { ElementScreen } from "./screens/ElementScreen";
import { ExportScreen } from "./screens/Export";
import { Floors } from "./screens/Floors";
import { Menu } from "./screens/Menu";
import { ModeSwitch } from "./screens/ModeSwitch";
import { ProjectForm } from "./screens/ProjectForm";
import { RoomScreen } from "./screens/Room";
import { Start } from "./screens/Start";
import { Study } from "./screens/Study";

/** Screen switch. Each Route (src/domain/types.ts) maps to one screen in src/screens. */
export function App() {
  const r = useRoute();
  let screen;
  switch (r.name) {
    case "start": screen = <Start />; break;
    case "menu": screen = <Menu />; break;
    case "project": screen = <ProjectForm key={r.pid ?? "new"} pid={r.pid} />; break;
    case "address": screen = <Address key={r.pid} pid={r.pid} />; break;
    case "building": screen = <Building key={r.pid} pid={r.pid} />; break;
    case "floors": screen = <Floors key={r.pid} pid={r.pid} />; break;
    case "mode": screen = <ModeSwitch pid={r.pid} />; break;
    case "addRoom": screen = <AddRoom pid={r.pid} floor={r.floor} />; break;
    case "room": screen = <RoomScreen key={r.roomId} pid={r.pid} roomId={r.roomId} />; break;
    case "element": screen = <ElementScreen key={r.elementId} pid={r.pid} elementId={r.elementId} />; break;
    case "export": screen = <ExportScreen pid={r.pid} />; break;
    case "study": screen = <Study />; break;
  }
  return <>{screen}<Toast /></>;
}
