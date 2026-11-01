import type { Mode } from "../domain/types";

export function ModeToggle({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="seg" role="group" aria-label="Inventory mode">
      <button type="button" aria-pressed={value === "assisted"} onClick={() => onChange("assisted")}>Assisted<small>segmentation + AI fill</small></button>
      <button type="button" aria-pressed={value === "manual"} onClick={() => onChange("manual")}>Manual<small>baseline, no AI</small></button>
    </div>
  );
}
