export type Mode = "assisted" | "manual";

/** Normalised box [left, top, width, height], values 0..1 of the image. */
export type Box = [number, number, number, number];

/** App-level floor setup (not part of Swiss-Inv). */
export interface FloorSetup {
  floorsAbove?: number;
  basements?: number;
}

/** What the Swiss building register (GWR) returned, kept for reference. */
export interface GwrInfo {
  featureId: string;
  label: string;
  name?: string; // gbez, e.g. "ETH Hönggerberg"
  gemeinde?: string;
  gemeindeNr?: number;
  e?: number; // LV95 building coordinates
  n?: number;
  gkat?: number;
  gklas?: number;
  garea?: number; // footprint m²
  gebf?: number; // energy reference area m²
  gastw?: number;
  fetchedAt: number;
}

export interface Room {
  id: string;
  floor: number; // 0 = EG, 1 = 1.OG, -1 = 1.UG
  name: string;
  useCode: string;
  useLabel: string;
  tag: string; // Floor_Use_Number, e.g. OG1_OFF_02
  photoId?: string;
  photoW?: number;
  photoH?: number;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  mode: Mode;
  imageId?: string;
  /** Swiss-Inv "Gebäude" fields, keyed as in BUILDING_FIELDS. */
  building: Record<string, string>;
  /** Values proposed by the register; a field shows as suggested while its value still equals this. */
  buildingSuggested: Record<string, string>;
  /** Values copied into every new element (Verfügbarkeit, Dokumente, Status). */
  defaults: Record<string, string>;
  gwr?: GwrInfo;
  info: FloorSetup;
  rooms: Room[];
  lastFloor?: number;
  createdAt: number;
  updatedAt: number;
}

/** Run-length encoded binary mask at segmentation resolution. */
export interface StoredMask {
  w: number;
  h: number;
  rle: string;
}

export interface Timing {
  mode: Mode;
  /** Active time on this element in ms (outline + form), paused while the app is hidden. */
  activeMs: number;
  /** activeMs at the moment of first save – the main study measure. */
  firstSavedMs?: number;
  segTaps: number;
  /** Number of suggested values (catalogue, register, defaults) still unchanged at first save. */
  suggestionsKept?: number;
  /** Number of suggested values the person changed before the first save. */
  corrections?: number;
  mussFilled?: number;
  mussTotal?: number;
}

export interface Element {
  id: string;
  pid: string;
  roomId: string;
  color: string;
  status: "draft" | "saved";
  mask?: StoredMask;
  box?: Box;
  /** Photos in order; the first three are Frontalansicht, Seitenansicht, Detail Fixierung. */
  photoIds: string[];
  /** Swiss-Inv "Bauteil" fields (Stufe 1 + 2), keyed as in ELEMENT_FIELDS. */
  fields: Record<string, string>;
  /** Suggested values; a field shows as suggested (blue) while its value still equals this. */
  suggested: Record<string, string>;
  timing: Timing;
  createdAt: number;
  updatedAt: number;
  savedAt?: number;
}

export type Route =
  | { name: "start" }
  | { name: "menu" }
  | { name: "project"; pid?: string }
  | { name: "address"; pid: string }
  | { name: "building"; pid: string }
  | { name: "floors"; pid: string }
  | { name: "mode"; pid: string; back: Route }
  | { name: "addRoom"; pid: string; floor: number }
  | { name: "room"; pid: string; roomId: string }
  | { name: "element"; pid: string; elementId: string }
  | { name: "export"; pid: string }
  | { name: "study" };
