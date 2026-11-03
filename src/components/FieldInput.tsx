import { useState } from "react";
import { DOKUMENTE_KEINE, joinMulti, splitMulti, type FieldDef } from "../domain/swissinv";
import { hint as hintOf, info as infoOf, label, opt, optShort, t } from "../i18n";

interface Props {
  def: FieldDef;
  value: string;
  /** Shows the field as suggested (blue) – e.g. from the register, the element type or defaults. */
  suggested?: boolean;
  onChange: (v: string) => void;
  /** Extra line under the field, e.g. a hint from the building register. */
  hint?: React.ReactNode;
  readOnly?: boolean;
  /** id of a <datalist> with suggestions for text fields */
  list?: string;
  /** Override the option list (e.g. a filtered eBKP list). */
  options?: string[];
}

/** One Swiss-Inv field: label in the UI language, Muss/Kann, info button with the template's explanation. */
export function FieldInput({ def, value, suggested, onChange, hint, readOnly, list, options }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const id = "f_" + def.key;
  const cls = suggested ? "suggested" : undefined;
  const opts = options ?? def.options ?? [];
  const infoText = infoOf(def);
  const hintText = hint ?? hintOf(def);
  let input;
  if (def.kind === "select") {
    input = (
      <select id={id} className={cls} value={value} disabled={readOnly} onChange={e => onChange(e.target.value)}>
        <option value="">{t("c.select")}</option>
        {opts.map(o => <option key={o} value={o}>{opt(o)}</option>)}
        {value && !opts.includes(value) && <option value={value}>{opt(value)}</option>}
      </select>
    );
  } else if (def.kind === "multi") {
    input = <MultiSelect id={id} options={opts} value={value} suggested={suggested} onChange={onChange} />;
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
        <label htmlFor={id}>{label(def)}</label>
        {def.extra && <span className="req">{t("c.extra")}</span>}
        <span className={"req" + (def.req === "muss" ? " muss" : "")}>{def.req === "muss" ? t("c.muss") : t("c.kann")}</span>
        {infoText && (
          <button type="button" className="info-btn" aria-expanded={showInfo} aria-label={t("c.infoAbout", { label: label(def) })} onClick={() => setShowInfo(!showInfo)}>i</button>
        )}
      </div>
      {showInfo && infoText && <p className="info-text">{infoText}</p>}
      {input}
      {hintText && <div className="hint">{hintText}</div>}
    </div>
  );
}

function MultiSelect({ id, options, value, suggested, onChange }: { id: string; options: string[]; value: string; suggested?: boolean; onChange: (v: string) => void }) {
  const sel = splitMulti(value);
  // "Keine" (none) excludes every other choice and vice versa
  const toggle = (o: string) => {
    if (sel.includes(o)) return onChange(joinMulti(sel.filter(x => x !== o)));
    if (o === DOKUMENTE_KEINE) return onChange(o);
    onChange(joinMulti(options.filter(x => x !== DOKUMENTE_KEINE && (x === o || sel.includes(x)))));
  };
  return (
    <details className={"multi" + (suggested ? " suggested" : "")} id={id}>
      <summary>{sel.length ? sel.map(optShort).join(", ") : t("c.selectMulti")}</summary>
      <div className="multi-list">
        {options.map(o => (
          <label key={o} className="check"><input type="checkbox" checked={sel.includes(o)} onChange={() => toggle(o)} /><span>{opt(o)}</span></label>
        ))}
      </div>
    </details>
  );
}
