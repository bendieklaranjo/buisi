import { MASK_COLORS, TYPE_DEFAULTS } from "../domain/fields";
import type { Box, Element, Project, Room, StoredMask } from "../domain/types";
import { elementsOf, nid, saveElement } from "./store";

export interface FromMask { mask: StoredMask; box: Box | null; label: string; taps: number; segStart: number; fromDetection: boolean }

/** Creates a draft element (an inventory row). With `seg` it comes from a confirmed outline. */
export function createElement(p: Project, r: Room, seg?: FromMask): Element {
  const now = Date.now();
  const e: Element = {
    id: nid(), pid: p.id, roomId: r.id, color: MASK_COLORS[elementsOf(p.id, r.id).length % MASK_COLORS.length],
    status: "draft", photoIds: [], fields: {}, aiFields: {}, createdAt: now, updatedAt: now,
    mask: seg?.mask, box: seg?.box ?? undefined,
    timing: { mode: p.mode, activeMs: seg ? now - seg.segStart : 0, segTaps: seg?.taps ?? 0, fromDetection: !!seg?.fromDetection, aiUsed: false, aiCount: 0, aiMs: 0 },
  };
  if (seg?.label) {
    e.fields.elementType = seg.label;
    Object.assign(e.fields, TYPE_DEFAULTS[seg.label] ?? {});
    e.aiFields = { ...e.fields };
  }
  saveElement(e);
  return e;
}
