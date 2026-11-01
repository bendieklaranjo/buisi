/**
 * Segmentation engine interface. The app only talks to this interface, so the current
 * colour region-growing engine can be replaced by SAM (MobileSAM / SlimSAM via
 * onnxruntime-web) without touching the screens. See README → "Swapping in SAM".
 */
export interface Point { x: number; y: number } // normalised 0..1

export interface SegPrompt {
  positive: Point[]; // taps on the element
  negative: Point[]; // taps on areas to remove
  box?: [number, number, number, number]; // normalised [l, t, w, h], e.g. from AI detection
  tolerance: number; // engine-specific sensitivity (region growing: colour distance)
}

export interface SegResult {
  mask: Uint8Array; // 1 = element, row-major, size w*h
  w: number;
  h: number;
  /** The outline spread into the surroundings; ask the user to correct it. */
  leaked: boolean;
  /** Engine lowered the tolerance on its own to stop a leak (0 = no change). */
  autoTolerance: number;
  /** A box prompt produced too little, so the box itself was used. */
  usedBoxFallback: boolean;
}

export interface SegEngine {
  readonly name: string;
  /** Called once per room photo. Heavy work (e.g. SAM image encoder) belongs here. */
  prepare(img: HTMLImageElement): Promise<void>;
  /** Called on every tap. Should be fast. */
  segment(prompt: SegPrompt): SegResult;
}
