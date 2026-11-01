/**
 * AI helpers (Claude vision) for the assisted mode. Requests go to the local proxy
 * in server/ai-proxy.mjs, which holds the API key. If the proxy is not running,
 * `aiStatus()` reports "off" and the app hides the AI buttons.
 */
import { ELEMENT_FIELDS, ELEMENT_TYPES, FUNKTION, UNITS, floorLabel } from "../domain/fields";
import type { Box, Project, Room } from "../domain/types";
import { blobToBase64 } from "./images";

let status: "unknown" | "on" | "off" = "unknown";
export async function aiStatus(): Promise<boolean> {
  if (status !== "unknown") return status === "on";
  try {
    const r = await fetch("/api/health");
    const j = await r.json();
    status = r.ok && j.ok ? "on" : "off";
  } catch { status = "off"; }
  return status === "on";
}

export class AiError extends Error {}

async function askJson<T>(prompt: string, images: Blob[], signal?: AbortSignal): Promise<T> {
  const imgs = await Promise.all(images.map(async b => ({ media_type: b.type || "image/jpeg", data: await blobToBase64(b) })));
  let r: Response;
  try {
    r = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt, images: imgs }), signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw new AiError("Stopped.");
    throw new AiError("The AI service is not reachable. Is `npm run ai` running?");
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new AiError(j.error || `AI request failed (${r.status}).`);
  const text: string = j.text || "";
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const start = text.search(/[[{]/), end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  const raw = fence ? fence[1] : start >= 0 ? text.slice(start, end + 1) : text;
  try { return JSON.parse(raw) as T; } catch { throw new AiError("The AI answer could not be read. Try again."); }
}

export interface Detected { label: string; box: Box }

export async function detectComponents(photo: Blob, project: Project, room: Room, signal?: AbortSignal): Promise<Detected[]> {
  const res = await askJson<{ components?: { label?: string; box?: number[] }[] }>(
    `You are assisting a building surveyor who documents reusable building components (circular construction, pre-demolition inventory). The image shows one room (${room.useLabel}) of a building${project.info.baujahr ? " built in " + project.info.baujahr : ""}.
List the clearly visible components that could be removed and reused and typically have market demand, such as windows, doors, radiators, light fixtures, washbasins, WCs, kitchen units, built-in cabinets, wooden flooring, railings, beams, cladding panels. Ignore loose furniture and people.
Reply with only JSON: {"components":[{"label":"Window","box":[x,y,w,h]}]}
- label: one of ${ELEMENT_TYPES.map(t => JSON.stringify(t)).join(", ")}
- box: bounding box normalised to the image, values 0..1, origin top-left, [left, top, width, height]
- at most 12 components, one entry per physical item.`,
    [photo], signal);
  return (res.components || [])
    .filter(d => Array.isArray(d.box) && d.box.length === 4 && d.box.every(n => typeof n === "number"))
    .slice(0, 12)
    .map(d => {
      let [x, y, w, h] = d.box!.map(v => Math.max(0, Math.min(1, v)));
      w = Math.min(w, 1 - x); h = Math.min(h, 1 - y);
      return { label: ELEMENT_TYPES.includes(d.label || "") ? d.label! : String(d.label || "Other").slice(0, 40), box: [x, y, w, h] as Box };
    })
    .filter(d => d.box[2] > 0.01 && d.box[3] > 0.01);
}

export async function fillFields(images: Blob[], hasCrop: boolean, known: Record<string, string>, project: Project, room: Room | undefined, signal?: AbortSignal) {
  const keys = ELEMENT_FIELDS.map(f => f.key);
  return askJson<{ fields?: Record<string, unknown>; note?: string }>(
    `You help a building surveyor document a reusable building component for a pre-demolition / reuse inventory following DIN SPEC 91484.
Context: building "${project.name}"${project.info.baujahr ? ", built " + project.info.baujahr : ""}${project.info.bauweise ? ", " + project.info.bauweise : ""}${project.city ? ", " + project.city : ""}. Room: ${room?.useLabel || ""} on floor ${floorLabel(room?.floor ?? 0)}.
${hasCrop ? "Image 1 is a crop of the room photo around the element. Further images are close-ups of the same element." : "The images are photos of the element."}
Already entered by the surveyor (keep these unless clearly wrong): ${JSON.stringify(known)}

Reply with only JSON of this shape:
{"fields":{${keys.map(k => `"${k}":""`).join(",")}},"note":""}
Rules:
- elementType: one of ${ELEMENT_TYPES.join(" | ")}
- ebkp: Swiss e-BKP-H code as precise as you can tell (e.g. "E 3" for windows/exterior doors), else main group letter
- funktion: one of ${FUNKTION.join(" | ")}
- einheit: one of ${UNITS.join(" | ")}; menge: number as text
- hoehe/breite/laenge: millimetres as whole numbers; estimate from typical sizes and visible references; "" if you cannot judge at all
- hersteller: only if a brand or label is readable, else ""
- verbindung: how it is fixed (e.g. "screwed into masonry", "glued", "clipped")
- zustand: short visual condition
- schadstoff: only obvious suspicions given era and material (e.g. "PCB in sealant possible (1955–1975)"), else "none apparent"
- reuse: high | medium | low
- weitere: one short sentence of anything a buyer should know
- note: one short sentence naming the fields you are least sure about. Use "" for anything you cannot tell.`,
    images, signal);
}
