import type { Project, Route } from "../domain/types";
import { t } from "../i18n";
import { navigate } from "../lib/nav";

export function ModeChip({ project, back }: { project: Project; back: Route }) {
  return (
    <button className={"mode " + project.mode} title={t("mode.title")} onClick={() => navigate({ name: "mode", pid: project.id, back })}>
      {project.mode === "assisted" ? t("mode.assisted") : t("mode.manual")}
    </button>
  );
}
