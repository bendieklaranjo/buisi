/** Photo helpers: decode (incl. iPhone HEIC), downscale and compress, crop around a box. */
import { MAX_PHOTO_BYTES } from "../domain/swissinv";
import type { Box } from "../domain/types";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image could not be loaded"));
    img.src = src;
  });
}

const isHeic = (f: Blob) => /image\/hei[cf]/i.test(f.type) || ("name" in f && /\.hei[cf]$/i.test(String((f as File).name)));

/** Converts iPhone HEIC/HEIF photos to JPEG. Chrome, Edge and Firefox can't open HEIC themselves. */
async function heicToJpeg(file: Blob): Promise<Blob> {
  const { default: heic2any } = await import("heic2any");
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  return Array.isArray(out) ? out[0] : out;
}

async function decode(file: Blob): Promise<HTMLImageElement> {
  const tryLoad = async (b: Blob) => { const u = URL.createObjectURL(b); try { return await loadImage(u); } finally { URL.revokeObjectURL(u); } };
  if (isHeic(file)) return tryLoad(await heicToJpeg(file));
  try { return await tryLoad(file); }
  catch {
    // some phones send HEIC with an empty or wrong type – try converting before giving up
    try { return await tryLoad(await heicToJpeg(file)); }
    catch { throw new Error("This photo format can't be opened. Please use a JPEG or PNG photo."); }
  }
}

const encode = (c: HTMLCanvasElement, q: number) =>
  new Promise<Blob>((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", q));

/**
 * Resize a photo to at most `max` px on the long side and re-encode as JPEG under 1.5 MB
 * (Swiss-Inv: photos "nicht grösser als 1.5 MB").
 */
export async function preparePhoto(file: Blob, max = 1600): Promise<{ blob: Blob; w: number; h: number }> {
  const img = await decode(file);
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * s);
  c.height = Math.round(img.naturalHeight * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  let q = 0.85, blob = await encode(c, q);
  while (blob.size > MAX_PHOTO_BYTES && q > 0.4) { q -= 0.15; blob = await encode(c, q); }
  return { blob, w: c.width, h: c.height };
}

export interface Crop { canvas: HTMLCanvasElement; sx: number; sy: number; sw: number; sh: number }

/** Crop the image around a normalised box with a margin (default 15 %). */
export function cropAround(img: HTMLImageElement, box: Box, margin = 0.15, maxSide = 1200): Crop {
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

export const canvasToBlob = (c: HTMLCanvasElement, q = 0.88) => encode(c, q);
