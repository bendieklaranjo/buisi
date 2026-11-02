/**
 * App vocabulary that is not part of Swiss-Inv: project types, room uses, floor names,
 * the room-tag convention. The Swiss-Inv fields themselves live in swissinv.ts.
 */

/** Project types. Only the reuse inventory is available in SwissInv-Beta; the rest are shown as "coming soon". */
export const PROJECT_TYPES: { label: string; available: boolean }[] = [
  { label: "Wiederverwendungs-Inventar (Reuse audit)", available: true },
  { label: "Schadstoffermittlung (Pollutant survey)", available: false },
  { label: "Rückbaukonzept (Deconstruction plan)", available: false },
  { label: "Materialinventar / Materialpass (Material passport)", available: false },
];
export const DEFAULT_PROJECT_TYPE = PROJECT_TYPES[0].label;

/** Room main uses: [label, code used in the room tag]. */
export const USES: [string, string][] = [
  ["Office", "OFF"], ["Residential", "RES"], ["Living room", "LIV"], ["Bedroom", "BED"], ["Kitchen", "KIT"],
  ["Bathroom / WC", "WC"], ["Corridor", "COR"], ["Staircase", "STA"], ["Storage", "STO"], ["Technical room", "TEC"],
  ["Classroom", "CLS"], ["Laboratory", "LAB"], ["Retail", "RET"], ["Facade / exterior", "EXT"], ["Roof", "ROF"], ["Other", "OTH"],
];

export const MASK_COLORS = ["#E0B22E", "#D68AA6", "#9883C3", "#7A9BC8", "#5FA59A", "#D9844A", "#B4C34A", "#C46B6B"];

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
