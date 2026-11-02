/**
 * Creating elements and computing suggested values ("auto-fill").
 *
 * Both modes: values that are derived, not guessed – Bauteil ID, Verortung im Gebäude,
 * eBKP text for a chosen eBKP number, and the building-wide defaults (Verfügbarkeit,
 * Dokumente, Status).
 * Assisted mode only: suggestions from the element catalogue (eBKP, IFC, unit, quantity,
 * exposure) and Einbaujahr from the building's history. Manual mode is the baseline
 * for the time study, so it gets no catalogue suggestions.
 */
import { MASK_COLORS, verortungText } from "../domain/fields";
import { CATALOG_BY_NAME, EBKP_TEXT, EXPOSITION, PROJECT_DEFAULT_KEYS } from "../domain/swissinv";
import type { Box, Element, Mode, Project, Room, StoredMask } from "../domain/types";
import { elementsOf, nid, saveElement } from "./store";

export interface FromMask { mask: StoredMask; box: Box | null; taps: number; segStart: number }

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

/** Creates a draft element (one inventory row). With `seg` it comes from a confirmed outline. */
export function createElement(p: Project, r: Room, seg?: FromMask): Element {
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
    mask: seg?.mask, box: seg?.box ?? undefined,
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
  if (key === "ebkp" && EBKP_TEXT[value]) out.ebkpText = EBKP_TEXT[value];
  if (key === "bezeichnung" && mode === "assisted") {
    const c = CATALOG_BY_NAME[value];
    if (c) {
      out.ebkp = c.ebkp; out.ebkpText = EBKP_TEXT[c.ebkp] ?? "";
      out.ifc = c.ifc; out.einheit = c.unit; out.menge = "1";
      out.exposition = c.outdoor ? OUTDOOR : INDOOR;
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
