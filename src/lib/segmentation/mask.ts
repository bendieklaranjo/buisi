/** Mask utilities shared by all engines. */
import type { Box, StoredMask } from "../../domain/types";

export function maskArea(m: Uint8Array) { let n = 0; for (let i = 0; i < m.length; i++) n += m[i]; return n; }

export function maskBox(m: Uint8Array, W: number, H: number): Box | null {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (m[y * W + x]) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : [x0 / W, y0 / H, (x1 - x0 + 1) / W, (y1 - y0 + 1) / H];
}

/** Run-length encode: alternating run lengths starting with zeros. */
export function encodeMask(m: Uint8Array, w: number, h: number): StoredMask {
  const out: number[] = []; let cur = 0, run = 0;
  for (let i = 0; i < m.length; i++) { if (m[i] === cur) run++; else { out.push(run); run = 1; cur = m[i]; } }
  out.push(run);
  return { w, h, rle: out.join(",") };
}

const decoded = new Map<string, Uint8Array>();
export function decodeMask(s: StoredMask): Uint8Array {
  const key = s.w + "x" + s.h + ":" + s.rle;
  const hit = decoded.get(key); if (hit) return hit;
  const m = new Uint8Array(s.w * s.h); let i = 0, v = 0;
  for (const r of s.rle.split(",")) { const n = +r; if (v) m.fill(1, i, i + n); i += n; v ^= 1; }
  decoded.set(key, m);
  return m;
}

/** Coloured overlay canvas at mask resolution: translucent fill, opaque edge. */
export function maskOverlay(m: Uint8Array, W: number, H: number, color: string, alpha: number) {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d")!; const img = ctx.createImageData(W, H);
  const r = parseInt(color.slice(1, 3), 16), g = parseInt(color.slice(3, 5), 16), b = parseInt(color.slice(5, 7), 16);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!m[i]) continue;
    const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1 || !m[i - 1] || !m[i + 1] || !m[i - W] || !m[i + W];
    img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = edge ? 255 : Math.round(alpha * 255);
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
