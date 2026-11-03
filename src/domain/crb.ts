/**
 * Element types from the CRB rule set "eBKP-H (2020) – IFC" (BETA 1.0). Each rule element has an
 * eBKP-H element code (e.g. G01.05), names in DE/EN/FR/IT and the IFC entity + predefined type.
 * Picking a type generates the Swiss-Inv eBKP number (two-digit, e.g. G01), the eBKP name and the
 * IFC entity. Source data: crb/ebkp-ifc.json, extracted from
 * "CRB_ifc_Regelsatz_eBKP-H2020_BETA_1.0.xlsx" (sheet CRB_eBKP-H-Ifc, level 4 "IFC-Regelelement";
 * main groups A/B, cost items, IFC2x3 duplicates and openings left out).
 */
import data from "./crb/ebkp-ifc.json";
import { EBKP, EBKP_TEXT, EBKP_TEXT_EN } from "./swissinv";

export interface RuleType {
  id: string; // "<code> <German name>", stored in the Bauteiltyp field
  code: string; // eBKP-H element, e.g. "G01.05"
  group: string; // eBKP-H element group (Swiss-Inv level), e.g. "G01"
  de: string; en: string; fr: string; it: string;
  ifc: string; // IFC entity, e.g. "IfcDoor"
  ifcType: string; // predefined type, or the object type when USERDEFINED
  external: boolean | null; // CRB IsExternal
}

type Row = [string, string, string, string, string, string, string, string, number | null];
const raw = data as unknown as { source: string; elements: Record<string, [string, string, string, string]>; rules: Row[] };

export const CRB_SOURCE = raw.source;
export const RULE_TYPES: RuleType[] = raw.rules.map(([code, de, en, fr, it, ifc, pt, ot, ext]) => ({
  id: `${code} ${de}`, code, group: code.slice(0, 3), de, en: en || de, fr, it, ifc,
  ifcType: pt === "USERDEFINED" && ot ? ot : pt, external: ext === null ? null : ext === 1,
}));
export const RULE_BY_ID: Record<string, RuleType> = Object.fromEntries(RULE_TYPES.map(r => [r.id, r]));

/** Name of an eBKP-H element (level 3), e.g. G01.05 → "Innentür". */
export const elementName = (code: string, lang: "de" | "en") => { const e = raw.elements[code]; return e ? (lang === "en" ? e[1] : e[0]) : ""; };

/** Name of any eBKP-H code: element (G01.05) from the CRB table, element group (G01) from Swiss-Inv. */
export const ebkpName = (code: string, lang: "de" | "en") =>
  elementName(code, lang) || (lang === "en" ? EBKP_TEXT_EN[code] : EBKP_TEXT[code]) || "";

/** All eBKP-H codes for manual choice: element groups and their elements, in order. */
export const EBKP_CODES: string[] = [...new Set([...EBKP.map(e => e[0]), ...Object.keys(raw.elements)])].sort();

/** Usual Swiss-Inv unit for an IFC entity (a suggestion – surfaces in m2, runs in m1, the rest per piece). */
export function unitFor(ifc: string): string {
  if (/^Ifc(Covering|Roof|Slab|Wall|Plate|CurtainWall|Course)$/.test(ifc)) return "m2";
  if (/Segment$|^Ifc(Railing|Kerb)$/.test(ifc)) return "m1";
  return "Stk.";
}

/** Whether the element is usually outdoors: CRB IsExternal, else the eBKP main group (E façade, F roof, I surroundings). */
export const isOutdoor = (r: RuleType) => r.external ?? /^[EFI]/.test(r.code);

/** Search over code and names in both UI languages. */
export function searchTypes(q: string, limit = 40): RuleType[] {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  return RULE_TYPES.filter(r => r.code.toLowerCase().startsWith(s) || r.de.toLowerCase().includes(s) || r.en.toLowerCase().includes(s)).slice(0, limit);
}
