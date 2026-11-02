import type { Mode } from "../domain/types";

export function ModeToggle({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="seg" role="group" aria-label="Inventory mode">
      <button type="button" aria-pressed={value === "assisted"} onClick={() => onChange("assisted")}>Assisted<small>tap-to-outline + suggestions</small></button>
      <button type="button" aria-pressed={value === "manual"} onClick={() => onChange("manual")}>Manual<small>baseline, form only</small></button>
    </div>
  );
}
