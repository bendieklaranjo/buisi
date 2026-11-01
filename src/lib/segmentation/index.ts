import { createRegionGrowEngine } from "./regionGrow";
import type { SegEngine } from "./types";

export * from "./types";
export * from "./mask";

/** The engine the app uses. Swap this line for a SAM engine later (see README). */
export function createEngine(): SegEngine {
  return createRegionGrowEngine();
}

export const DEFAULT_TOLERANCE = 14;
