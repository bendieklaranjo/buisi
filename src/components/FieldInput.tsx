import { useState } from "react";
import { joinMulti, splitMulti, type FieldDef } from "../domain/swissinv";

interface Props {
  def: FieldDef;
  value: string;
  /** Shows the field as suggested (blue) – e.g. from the register, the catalogue or project defaults. */
  suggested?: boolean;
  onChange: (v: string) => void;
  /** Extra line under the field, e.g. a hint from the building register. */
  hint?: React.ReactNode;
  readOnly?: boolean;
  /** id of a <datalist> with suggestions for text fields */
  list?: string;
}

/** One Swiss-Inv field: official label, English hint, Muss/Kann, info button with the template's explanation. */
export function FieldInput({ def, value, suggested, onChange, hint, readOnly, list }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const id = "f_" + def.key;
  const cls = suggested ? "suggested" : undefined;
  let input;
  if (def.kind === "select") {
    const opts = def.options ?? [];
    input = (
      <select id={id} className={cls} value={value} disabled={readOnly} onChange={e => onChange(e.target.value)}>
        <option value="">Auswählen…</option>
        {opts.map(o => <option key={o}>{o}</option>)}
        {value && !opts.includes(value) && <option>{value}</option>}
      </select>
    );
  } else if (def.kind === "multi") {
    input = <MultiSelect id={id} options={def.options ?? []} value={value} suggested={suggested} onChange={onChange} />;
  } else if (def.kind === "textarea") {
    input = <textarea id={id} className={cls} value={value} readOnly={readOnly} onChange={e => onChange(e.target.value)} placeholder={def.placeholder} />;
  } else {
    const type = def.kind === "number" || def.kind === "year" ? "number" : def.kind === "date" ? "date" : def.kind === "email" ? "email" : def.kind === "tel" ? "tel" : "text";
    input = (
      <div className={def.unit ? "with-unit" : undefined}>
        <input id={id} className={cls} type={type} readOnly={readOnly} list={list}
          inputMode={def.kind === "number" ? "decimal" : def.kind === "year" ? "numeric" : undefined}
          min={def.kind === "year" ? 1000 : undefined} max={def.kind === "year" ? 2100 : undefined}
          value={value} placeholder={def.placeholder} onChange={e => onChange(e.target.value)} />
        {def.unit && <span className="unit">{def.unit}</span>}
      </div>
    );
  }
  return (
    <div className="field">
      <div className="flabel-row">
        <label htmlFor={id}>{def.label}{def.en && <span className="de">{def.en}</span>}</label>
        {def.extra && <span className="req">Zusatz</span>}
        <span className={"req" + (def.req === "muss" ? " muss" : "")}>{def.req}</span>
        {def.info && (
          <button type="button" className="info-btn" aria-expanded={showInfo} aria-label={`Erläuterung zu ${def.label}`} onClick={() => setShowInfo(!showInfo)}>i</button>
        )}
      </div>
      {showInfo && def.info && <p className="info-text">{def.info}</p>}
      {input}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function MultiSelect({ id, options, value, suggested, onChange }: { id: string; options: string[]; value: string; suggested?: boolean; onChange: (v: string) => void }) {
  const sel = splitMulti(value);
  const toggle = (o: string) => onChange(joinMulti(sel.includes(o) ? sel.filter(x => x !== o) : options.filter(x => x === o || sel.includes(x))));
  const short = (o: string) => o.replace(/\s*\(.*\)$/, "");
  return (
    <details className={"multi" + (suggested ? " suggested" : "")} id={id}>
      <summary>{sel.length ? sel.map(short).join(", ") : "Auswählen… (mehrere möglich)"}</summary>
      <div className="multi-list">
        {options.map(o => (
          <label key={o} className="check"><input type="checkbox" checked={sel.includes(o)} onChange={() => toggle(o)} /><span>{o}</span></label>
        ))}
      </div>
    </details>
  );
}
