/**
 * Domain vocabulary: DIN SPEC 91484 fields, option lists and naming conventions.
 * Edit here to change what the app asks for – screens and exports read from these lists.
 */

export const PROJECT_TYPES = ["Pre-demolition audit", "Deconstruction / Rückbau", "Renovation / Umbau", "Reuse catalogue", "Other"];
export const BAUWEISE = ["Monolithische Bauweise", "Fertigteilbauweise", "Mischbauweise"];
export const GEBAEUDEKLASSEN = ["GK 1", "GK 2", "GK 3", "GK 4", "GK 5"];
export const KATEGORIEN = [
  "Wohngebäude",
  "Gebäude für Verwaltung / Büro",
  "Gebäude für Bildung (Schule, Hochschule)",
  "Gebäude für Gesundheit",
  "Gebäude für Handel / Gewerbe",
  "Gebäude für Industrie / Produktion",
  "Gebäude für Kultur / Freizeit",
  "Gebäude für Verkehr",
  "Gebäude mit gemischter Nutzung (Mixed use)",
  "Sonstiges",
];

/** Room main uses: [label, code used in the room tag]. */
export const USES: [string, string][] = [
  ["Office", "OFF"], ["Residential", "RES"], ["Living room", "LIV"], ["Bedroom", "BED"], ["Kitchen", "KIT"],
  ["Bathroom / WC", "WC"], ["Corridor", "COR"], ["Staircase", "STA"], ["Storage", "STO"], ["Technical room", "TEC"],
  ["Classroom", "CLS"], ["Retail", "RET"], ["Other", "OTH"],
];

export const ELEMENT_TYPES = [
  "Window", "Door (interior)", "Door (exterior)", "Radiator", "Light fixture", "Washbasin", "WC", "Kitchen unit",
  "Built-in cabinet", "Flooring", "Wall / ceiling cladding", "Railing / handrail", "Steel beam / profile", "Timber beam",
  "Facade panel", "Roof element", "Other",
];
export const FUNKTION = ["Gebäudehülle", "TGA", "Tragstruktur", "Ausbauteile", "Andere"];
export const UNITS = ["Stk", "m", "m²", "m³", "kg"];
export const REUSE = ["high", "medium", "low"];

/** Defaults per element type, applied in assisted mode. e-BKP-H codes are main groups only – verify. */
export const TYPE_DEFAULTS: Record<string, Record<string, string>> = {
  "Window": { funktion: "Gebäudehülle", einheit: "Stk", menge: "1", ebkp: "E 3" },
  "Door (exterior)": { funktion: "Gebäudehülle", einheit: "Stk", menge: "1", ebkp: "E 3" },
  "Door (interior)": { funktion: "Ausbauteile", einheit: "Stk", menge: "1", ebkp: "G" },
  "Radiator": { funktion: "TGA", einheit: "Stk", menge: "1", ebkp: "D" },
  "Light fixture": { funktion: "TGA", einheit: "Stk", menge: "1", ebkp: "D" },
  "Washbasin": { funktion: "TGA", einheit: "Stk", menge: "1", ebkp: "D" },
  "WC": { funktion: "TGA", einheit: "Stk", menge: "1", ebkp: "D" },
  "Kitchen unit": { funktion: "Ausbauteile", einheit: "Stk", menge: "1", ebkp: "G" },
  "Built-in cabinet": { funktion: "Ausbauteile", einheit: "Stk", menge: "1", ebkp: "G" },
  "Flooring": { funktion: "Ausbauteile", einheit: "m²", ebkp: "G" },
  "Wall / ceiling cladding": { funktion: "Ausbauteile", einheit: "m²", ebkp: "G" },
  "Railing / handrail": { funktion: "Ausbauteile", einheit: "m", ebkp: "G" },
  "Steel beam / profile": { funktion: "Tragstruktur", einheit: "Stk", menge: "1", ebkp: "C" },
  "Timber beam": { funktion: "Tragstruktur", einheit: "Stk", menge: "1", ebkp: "C" },
  "Facade panel": { funktion: "Gebäudehülle", einheit: "m²", ebkp: "E" },
  "Roof element": { funktion: "Gebäudehülle", einheit: "m²", ebkp: "F" },
};

export type Requirement = "muss" | "sollte" | "kann" | "";
export interface FieldDef {
  key: string;
  label: string;
  de: string; // German DIN term
  req: Requirement;
  kind: "text" | "number" | "select" | "textarea";
  options?: string[];
}

/** Element fields after DIN SPEC 91484 (Verortung and Fotos are handled separately). */
export const ELEMENT_FIELDS: FieldDef[] = [
  { key: "elementType", label: "Element type", de: "", req: "muss", kind: "select", options: ELEMENT_TYPES },
  { key: "ebkp", label: "e-BKP-H code", de: "", req: "", kind: "text" },
  { key: "material", label: "Material", de: "", req: "", kind: "text" },
  { key: "funktion", label: "Function in the building", de: "Funktion des Bauprodukts", req: "muss", kind: "select", options: FUNKTION },
  { key: "menge", label: "Quantity", de: "Menge", req: "muss", kind: "number" },
  { key: "einheit", label: "Unit", de: "Einheit", req: "muss", kind: "select", options: UNITS },
  { key: "hoehe", label: "Height (mm)", de: "Höhe", req: "muss", kind: "number" },
  { key: "breite", label: "Width (mm)", de: "Breite", req: "muss", kind: "number" },
  { key: "laenge", label: "Length / depth (mm)", de: "Länge", req: "muss", kind: "number" },
  { key: "hersteller", label: "Manufacturer", de: "Hersteller", req: "muss", kind: "text" },
  { key: "verbindung", label: "Connection types (rough)", de: "Verbindungsarten", req: "muss", kind: "text" },
  { key: "zustand", label: "Visual condition", de: "Gebrauchszustand – visuell", req: "sollte", kind: "text" },
  { key: "schadstoff", label: "Suspected hazardous substances", de: "Offenkundiger Schadstoffverdacht", req: "muss", kind: "text" },
  { key: "reuse", label: "Reusability", de: "", req: "", kind: "select", options: REUSE },
  { key: "weitere", label: "Further information", de: "Weitere Informationen", req: "kann", kind: "textarea" },
];
export const FIELD_BY_KEY = Object.fromEntries(ELEMENT_FIELDS.map(f => [f.key, f]));
export const MUSS_KEYS = ELEMENT_FIELDS.filter(f => f.req === "muss").map(f => f.key);

export const MASK_COLORS = ["#E0B22E", "#D68AA6", "#9883C3", "#7A9BC8", "#5FA59A", "#D9844A", "#B4C34A", "#C46B6B"];

export const floorLabel = (f: number) => (f < 0 ? `${-f}.UG` : f === 0 ? "EG" : `${f}.OG`);
export const floorCode = (f: number) => (f < 0 ? `UG${-f}` : f === 0 ? "EG" : `OG${f}`);

/** Room tag after the naming convention Floor_Use_Number, e.g. OG1_OFF_02. */
export function makeRoomTag(existing: { floor: number; useCode: string }[], floor: number, useCode: string) {
  const n = existing.filter(r => r.floor === floor && r.useCode === useCode).length + 1;
  return `${floorCode(floor)}_${useCode}_${String(n).padStart(2, "0")}`;
}

export function floorsOf(info: { floorsAbove?: number; basements?: number }) {
  const out: number[] = [];
  for (let f = (info.floorsAbove || 1) - 1; f >= -(info.basements || 0); f--) out.push(f);
  return out;
}

export const missingMuss = (fields: Record<string, string>) => MUSS_KEYS.filter(k => !String(fields[k] ?? "").trim());
