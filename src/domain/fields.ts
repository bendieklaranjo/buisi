/**
 * App vocabulary that is not part of Swiss-Inv: project types, room uses, floor names,
 * the room-tag convention. The Swiss-Inv fields themselves live in swissinv.ts.
 */

/** Project types (stored in German). Only the reuse inventory is available in SwissInv-Beta. */
export const PROJECT_TYPES: { label: string; available: boolean }[] = [
  { label: "Wiederverwendungs-Inventar", available: true },
  { label: "Schadstoffermittlung", available: false },
  { label: "Rückbaukonzept", available: false },
  { label: "Materialpass", available: false },
];
export const DEFAULT_PROJECT_TYPE = PROJECT_TYPES[0].label;

/** Room main uses: code used in the room tag + German and English names. */
export const USES: { code: string; de: string; en: string }[] = [
  { code: "OFF", de: "Büro", en: "Office" }, { code: "RES", de: "Wohnen", en: "Residential" }, { code: "LIV", de: "Wohnzimmer", en: "Living room" },
  { code: "BED", de: "Schlafzimmer", en: "Bedroom" }, { code: "KIT", de: "Küche", en: "Kitchen" }, { code: "WC", de: "Bad / WC", en: "Bathroom / WC" },
  { code: "COR", de: "Korridor", en: "Corridor" }, { code: "STA", de: "Treppenhaus", en: "Staircase" }, { code: "STO", de: "Lager", en: "Storage" },
  { code: "TEC", de: "Technikraum", en: "Technical room" }, { code: "CLS", de: "Unterrichtsraum", en: "Classroom" }, { code: "LAB", de: "Labor", en: "Laboratory" },
  { code: "RET", de: "Verkauf", en: "Retail" }, { code: "EXT", de: "Fassade / Aussen", en: "Facade / exterior" }, { code: "ROF", de: "Dach", en: "Roof" },
  { code: "OTH", de: "Andere", en: "Other" },
];

export const MASK_COLORS = ["#E7BC29", "#D092A7", "#9C85C0", "#809EC2", "#F3A447", "#A5B592", "#444D26", "#FEFAC9"];

export const floorLabel = (f: number) => (f < 0 ? `${-f}.UG` : f === 0 ? "EG" : `${f}.OG`);
export const floorCode = (f: number) => (f < 0 ? `UG${-f}` : f === 0 ? "EG" : `OG${f}`);

/** Room tag after the naming convention Floor_Use_Number, e.g. OG1_OFF_02. */
export function makeRoomTag(existing: { floor: number; useCode: string }[], floor: number, useCode: string) {
  const n = existing.filter(r => r.floor === floor && r.useCode === useCode).length + 1;
  return `${floorCode(floor)}_${useCode}_${String(n).padStart(2, "0")}`;
}

/** Floors from top to bottom, e.g. [2, 1, 0, -1]. */
export function floorsOf(info: { floorsAbove?: number; basements?: number }) {
  const out: number[] = [];
  for (let f = (info.floorsAbove || 1) - 1; f >= -(info.basements || 0); f--) out.push(f);
  return out;
}

/** Swiss-Inv "Verortung im Gebäude": Raum XY_Geschoss, e.g. "Raum 114_2.OG". */
export const verortungText = (roomName: string, tag: string, floor: number) => `Raum ${roomName || tag}_${floorLabel(floor)}`;
