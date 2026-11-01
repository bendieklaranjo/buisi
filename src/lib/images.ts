/** Photo helpers: downscale camera images before storing, load images, crop around a box. */
import type { Box } from "../domain/types";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image could not be loaded"));
    img.src = src;
  });
}

/** Resize a camera photo to at most `max` px on the long side and re-encode as JPEG. */
export async function preparePhoto(file: Blob, max = 1600): Promise<{ blob: Blob; w: number; h: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob>((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", 0.85));
    return { blob, w: c.width, h: c.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export interface Crop { canvas: HTMLCanvasElement; sx: number; sy: number; sw: number; sh: number }

/** Crop the image around a normalised box with a margin (default 15 %). */
export function cropAround(img: HTMLImageElement, box: Box, margin = 0.15, maxSide = 900): Crop {
  const [x, y, w, h] = box;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const sx = Math.max(0, (x - w * margin) * iw);
  const sy = Math.max(0, (y - h * margin) * ih);
  const sw = Math.min(iw - sx, w * (1 + 2 * margin) * iw);
  const sh = Math.min(ih - sy, h * (1 + 2 * margin) * ih);
  const s = Math.min(1, maxSide / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * s));
  canvas.height = Math.max(1, Math.round(sh * s));
  canvas.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return { canvas, sx, sy, sw, sh };
}

export const canvasToBlob = (c: HTMLCanvasElement, q = 0.88) =>
  new Promise<Blob>((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", q));

export function blobToBase64(b: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] ?? "");
    r.onerror = rej;
    r.readAsDataURL(b);
  });
}
