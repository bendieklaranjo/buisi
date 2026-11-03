import type { Mode } from "../domain/types";
import { t } from "../i18n";

export function ModeToggle({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="seg" role="group" aria-label={t("mode.title")}>
      <button type="button" aria-pressed={value === "assisted"} onClick={() => onChange("assisted")}>{t("mode.assisted")}<small>{t("mode.assistedSub")}</small></button>
      <button type="button" aria-pressed={value === "manual"} onClick={() => onChange("manual")}>{t("mode.manual")}<small>{t("mode.manualSub")}</small></button>
    </div>
  );
}
