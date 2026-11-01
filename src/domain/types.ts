export type Mode = "assisted" | "manual";

/** Normalised box [left, top, width, height], values 0..1 of the image. */
export type Box = [number, number, number, number];

export interface BuildingInfo {
  kat?: string; // Bauwerkskategorie (HOAI Anlage 10.2)
  ort?: string; // Ort
  bauweise?: string; // Bauweise/-art
  baujahr?: string; // Baujahr
  gk?: string; // Gebäudeklasse (MBO § 2 Abs. 3)
  bri?: string; // Brutto-Rauminhalt m³ (DIN 277)
  bgf?: string; // Brutto-Grundfläche m² (DIN 277)
  nutzung?: string; // Nutzungsart
  umbau?: string; // vergangene Umbaumaßnahmen
  floorsAbove?: number;
  basements?: number;
}

export interface Detection {
  id: string;
  label: string;
  box: Box;
  color: string;
  usedBy?: string | null; // element id created from this detection
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
  detections: Detection[];
  detectMs?: number;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  mode: Mode;
  street: string;
  nr: string;
  zip: string;
  city: string;
  imageId?: string;
  info: BuildingInfo;
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
  /** Active time on this element in ms (segmentation + form), paused while the app is hidden. */
  activeMs: number;
  /** activeMs at the moment of first save – the main study measure. */
  firstSavedMs?: number;
  segTaps: number;
  fromDetection: boolean;
  aiUsed: boolean;
  aiCount: number;
  aiMs: number;
  aiFieldsFilled?: number;
  aiFieldsKept?: number;
  corrections?: number;
  mussFilled?: number;
}

export interface Element {
  id: string;
  pid: string;
  roomId: string;
  color: string;
  status: "draft" | "saved";
  mask?: StoredMask;
  box?: Box;
  photoIds: string[];
  fields: Record<string, string>;
  /** Values as proposed by AI or defaults; a field is "AI-filled" while its value still equals this. */
  aiFields: Record<string, string>;
  aiNote?: string;
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
