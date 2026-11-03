/**
 * Creating elements and computing suggested values ("auto-fill").
 *
 * Both modes: values that are derived, not guessed – Bauteil ID, Verortung im Gebäude,
 * the building-wide defaults (Verfügbarkeit, Status, Dokumente), and from the element type
 * (CRB rule set) the eBKP number, eBKP name, eBKP-H element and IFC entity + type (and the eBKP name from a chosen
 * eBKP number).
 * Assisted mode only: from the element type also unit, quantity, exposure and a default
 * name, plus Einbaujahr from the building's history. Manual mode is the baseline.
 */
import { MASK_COLORS, verortungText } from "../domain/fields";
import { RULE_BY_ID, ebkpName, isOutdoor, unitFor } from "../domain/crb";
import { EXPOSITION, PROJECT_DEFAULT_KEYS } from "../domain/swissinv";
import type { Box, Element, Mode, Project, Room } from "../domain/types";
import { getLang } from "../i18n";
import { elementsOf, nid, saveElement } from "./store";

export interface FromBox { box: Box; taps: number; segStart: number }

const INDOOR = EXPOSITION[0], OUTDOOR = EXPOSITION[3];

function nextBauteilId(p: Project, r: Room) {
  const prefix = r.tag + "-";
  let max = 0;
  for (const e of elementsOf(p.id)) {
    const id = e.fields.bauteilId ?? "";
    if (id.startsWith(prefix)) max = Math.max(max, parseInt(id.slice(prefix.length), 10) || 0);
  }
  return prefix + String(max + 1).padStart(2, "0");
}

/** Creates a draft element (one inventory row). With `seg` it comes from a box on the room photo. */
export function createElement(p: Project, r: Room, seg?: FromBox): Element {
  const now = Date.now();
  const derived: Record<string, string> = {
    bauteilId: nextBauteilId(p, r),
    verortung: verortungText(r.name, r.tag, r.floor),
  };
  for (const k of PROJECT_DEFAULT_KEYS) if (p.defaults[k]) derived[k] = p.defaults[k];
  if (p.mode === "assisted") {
    const year = p.building.jahrUmbau || p.building.baujahr;
    if (year) derived.einbaujahr = year;
  }
  const e: Element = {
    id: nid(), pid: p.id, roomId: r.id, color: MASK_COLORS[elementsOf(p.id, r.id).length % MASK_COLORS.length],
    status: "draft", photoIds: [], fields: { ...derived }, suggested: { ...derived }, createdAt: now, updatedAt: now,
    box: seg?.box,
    timing: { mode: p.mode, activeMs: seg ? now - seg.segStart : 0, segTaps: seg?.taps ?? 0 },
  };
  saveElement(e);
  return e;
}

/**
 * Values to propose after a field changed. Only fills fields that are empty or still hold an
 * earlier suggestion – never overwrites what the person typed.
 */
export function suggestionsAfterChange(key: string, value: string, mode: Mode): Record<string, string> {
  const out: Record<string, string> = {};
  if (key === "ebkp" && ebkpName(value, "de")) out.ebkpText = ebkpName(value, "de");
  if (key === "bauteiltyp") {
    const c = RULE_BY_ID[value];
    if (c) {
      out.ebkp = c.code; out.ebkpText = ebkpName(c.code, "de"); out.ifc = c.ifc; out.ifcTyp = c.ifcType;
      if (mode === "assisted") { out.bezeichnung = getLang() === "en" ? c.en : c.de; out.einheit = unitFor(c.ifc); out.menge = "1"; out.exposition = isOutdoor(c) ? OUTDOOR : INDOOR; }
    }
  }
  return out;
}

/** Applies suggestions to fields that are empty or still unchanged suggestions. Returns the keys that changed. */
export function applySuggestions(fields: Record<string, string>, suggested: Record<string, string>, add: Record<string, string>) {
  const changed: string[] = [];
  for (const [k, v] of Object.entries(add)) {
    const cur = fields[k] ?? "";
    const untouched = cur === "" || (suggested[k] !== undefined && suggested[k] === cur);
    if (untouched && cur !== v) { fields[k] = v; changed.push(k); }
    if (untouched) suggested[k] = v;
  }
  return changed;
}
