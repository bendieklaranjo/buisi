import type { FieldDef } from "../domain/fields";

interface Props {
  def: FieldDef;
  value: string;
  aiFilled: boolean;
  onChange: (v: string) => void;
}

/** One DIN field. Blue (ai-filled) while the value still equals what AI or defaults proposed. */
export function FieldInput({ def, value, aiFilled, onChange }: Props) {
  const id = "f_" + def.key;
  const cls = aiFilled ? "ai-filled" : undefined;
  let input;
  if (def.kind === "select") {
    const opts = def.options ?? [];
    input = (
      <select id={id} className={cls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Select…</option>
        {opts.map(o => <option key={o}>{o}</option>)}
        {value && !opts.includes(value) && <option>{value}</option>}
      </select>
    );
  } else if (def.kind === "textarea") {
    input = <textarea id={id} className={cls} value={value} onChange={e => onChange(e.target.value)} />;
  } else {
    input = <input id={id} className={cls} type={def.kind === "number" ? "number" : "text"} inputMode={def.kind === "number" ? "decimal" : undefined} value={value} onChange={e => onChange(e.target.value)} />;
  }
  return (
    <div className="field">
      <label htmlFor={id}>
        {def.label}{def.de && <span className="de">{def.de}</span>}
        {def.req && <span className={"req" + (def.req === "muss" ? " muss" : "")}>{def.req}</span>}
      </label>
      {input}
    </div>
  );
}
