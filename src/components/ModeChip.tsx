import type { Project, Route } from "../domain/types";
import { navigate } from "../lib/nav";

export function ModeChip({ project, back }: { project: Project; back: Route }) {
  return (
    <button className={"mode " + project.mode} title="Mode used for new elements" onClick={() => navigate({ name: "mode", pid: project.id, back })}>
      {project.mode === "assisted" ? "Assisted" : "Manual"}
    </button>
  );
}
