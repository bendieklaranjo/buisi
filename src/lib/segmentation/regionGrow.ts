/**
 * Placeholder engine: colour region growing from the tapped point, stopped at edges,
 * then closing + hole filling (so tapping a window frame captures the whole window).
 * Good enough to test the human-in-the-loop flow; replace with SAM for real use.
 */
import type { SegEngine, SegPrompt, SegResult } from "./types";
import { maskArea } from "./mask";

interface Prepared { W: number; H: number; l: Float32Array; a: Float32Array; b: Float32Array; G: Float32Array }

const MAX_SIDE = 360; // working resolution – keeps each tap well under 50 ms on phones

function prepareImage(img: HTMLImageElement): Prepared {
  const s = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const W = Math.max(8, Math.round(img.naturalWidth * s)), H = Math.max(8, Math.round(img.naturalHeight * s));
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data, N = W * H;
  const L = new Float32Array(N), A = new Float32Array(N), B = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = d[i * 4], g = d[i * 4 + 1], bl = d[i * 4 + 2];
    L[i] = 0.3 * r + 0.59 * g + 0.11 * bl; A[i] = (r - g) * 0.9; B[i] = ((r + g) / 2 - bl) * 0.9;
  }
  const blur = (src: Float32Array) => {
    const o = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let sum = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) { const yy = y + dy; if (yy < 0 || yy >= H) continue;
        for (let dx = -1; dx <= 1; dx++) { const xx = x + dx; if (xx < 0 || xx >= W) continue; sum += src[yy * W + xx]; n++; } }
      o[y * W + x] = sum / n;
    }
    return o;
  };
  const l = blur(L), a = blur(A), b = blur(B), lm = blur(l);
  const sob = (v: Float32Array, i: number) => {
    const gx = v[i - W + 1] + 2 * v[i + 1] + v[i + W + 1] - v[i - W - 1] - 2 * v[i - 1] - v[i + W - 1];
    const gy = v[i + W - 1] + 2 * v[i + W] + v[i + W + 1] - v[i - W - 1] - 2 * v[i - W] - v[i - W + 1];
    return Math.hypot(gx, gy) / 4;
  };
  const G = new Float32Array(N);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x; G[i] = Math.max(sob(l, i) * 1.4, sob(lm, i) * 1.6, sob(a, i), sob(b, i));
  }
  return { W, H, l, a, b, G };
}

function grow(p: Prepared, sx: number, sy: number, tol: number, box: number[] | null) {
  const { W, H, l, a, b, G } = p; const N = W * H; const m = new Uint8Array(N);
  sx = Math.max(0, Math.min(W - 1, Math.round(sx))); sy = Math.max(0, Math.min(H - 1, Math.round(sy)));
  // snap the seed to the calmest pixel nearby (a tap often lands on an edge)
  let best = G[sy * W + sx], bx = sx, by = sy;
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    const xx = sx + dx, yy = sy + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
    const g = G[yy * W + xx] + 0.4 * (Math.abs(dx) + Math.abs(dy)); if (g < best) { best = g; bx = xx; by = yy; }
  }
  sx = bx; sy = by;
  let x0 = 0, y0 = 0, x1 = W - 1, y1 = H - 1;
  if (box) { x0 = Math.max(0, Math.floor(box[0])); y0 = Math.max(0, Math.floor(box[1])); x1 = Math.min(W - 1, Math.ceil(box[0] + box[2])); y1 = Math.min(H - 1, Math.ceil(box[1] + box[3])); }
  let sl = 0, sa = 0, sb = 0, n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const xx = sx + dx, yy = sy + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
    const j = yy * W + xx; sl += l[j]; sa += a[j]; sb += b[j]; n++;
  }
  const seedL = sl / n, seedA = sa / n, seedB = sb / n;
  let ml = seedL, ma = seedA, mb = seedB, cnt = 0, Sl = 0, Sa = 0, Sb = 0, leaked = false;
  const gT = 4 + tol * 0.75, cap = box ? N : Math.floor(N * 0.55);
  const q = new Int32Array(N); let qh = 0, qt = 0; const si = sy * W + sx; q[qt++] = si; m[si] = 1;
  while (qh < qt) {
    const i = q[qh++]; cnt++; Sl += l[i]; Sa += a[i]; Sb += b[i];
    if ((cnt & 31) === 0) { ml = Sl / cnt; ma = Sa / cnt; mb = Sb / cnt; }
    if (cnt > cap) { leaked = true; break; }
    const x = i % W, y = (i - x) / W;
    const nbs = [x > x0 ? i - 1 : -1, x < x1 ? i + 1 : -1, y > y0 ? i - W : -1, y < y1 ? i + W : -1];
    for (const j of nbs) {
      if (j < 0 || m[j]) continue;
      const dl = l[j] - ml, da = a[j] - ma, db = b[j] - mb;
      const dl2 = l[j] - seedL, da2 = a[j] - seedA, db2 = b[j] - seedB;
      const dist = Math.sqrt(0.55 * dl * dl + da * da + db * db);
      const dist2 = Math.sqrt(0.55 * dl2 * dl2 + da2 * da2 + db2 * db2);
      if (dist < tol && dist2 < tol * 1.3 && G[j] < gT) { m[j] = 1; q[qt++] = j; }
    }
  }
  return { mask: closeAndFill(m, W, H), leaked: leaked || (!box && cnt > N * 0.3) };
}

function morph(m: Uint8Array, W: number, H: number, dilate: boolean) {
  const o = new Uint8Array(m.length);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let v = dilate ? 0 : 1;
    outer: for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      const mv = xx >= 0 && yy >= 0 && xx < W && yy < H ? m[yy * W + xx] : 0;
      if (dilate && mv) { v = 1; break outer; }
      if (!dilate && !mv) { v = 0; break outer; }
    }
    o[y * W + x] = v;
  }
  return o;
}

function closeAndFill(m: Uint8Array, W: number, H: number) {
  const c = morph(morph(m, W, H, true), W, H, false);
  const N = W * H, reach = new Uint8Array(N), q = new Int32Array(N); let qh = 0, qt = 0;
  const push = (i: number) => { if (!c[i] && !reach[i]) { reach[i] = 1; q[qt++] = i; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (qh < qt) { const i = q[qh++], x = i % W; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (i >= W) push(i - W); if (i < N - W) push(i + W); }
  for (let i = 0; i < N; i++) if (!c[i] && !reach[i]) c[i] = 1;
  return c;
}

export function createRegionGrowEngine(): SegEngine {
  let prep: Prepared | null = null;
  return {
    name: "region-grow",
    async prepare(img) { prep = prepareImage(img); },
    segment(prompt: SegPrompt): SegResult {
      if (!prep) throw new Error("Call prepare() first");
      const { W, H } = prep;
      const m = new Uint8Array(W * H);
      const box = prompt.box ? [prompt.box[0] * W, prompt.box[1] * H, prompt.box[2] * W, prompt.box[3] * H] : null;
      let leaked = false, autoTolerance = 0, usedBoxFallback = false;
      for (const pt of prompt.positive) {
        let t = prompt.tolerance, g = grow(prep, pt.x * W, pt.y * H, t, box);
        while (g.leaked && t > 5) { t = Math.max(5, Math.round(t * 0.65)); g = grow(prep, pt.x * W, pt.y * H, t, box); }
        if (t !== prompt.tolerance) autoTolerance = t;
        leaked = leaked || g.leaked;
        for (let i = 0; i < m.length; i++) if (g.mask[i]) m[i] = 1;
      }
      if (box && maskArea(m) < box[2] * box[3] * 0.08) {
        m.fill(0);
        for (let y = Math.max(0, Math.floor(box[1])); y < Math.min(H, box[1] + box[3]); y++)
          for (let x = Math.max(0, Math.floor(box[0])); x < Math.min(W, box[0] + box[2]); x++) m[y * W + x] = 1;
        usedBoxFallback = true;
      }
      for (const pt of prompt.negative) {
        const g = grow(prep, pt.x * W, pt.y * H, prompt.tolerance, null);
        for (let i = 0; i < m.length; i++) if (g.mask[i]) m[i] = 0;
      }
      return { mask: m, w: W, h: H, leaked, autoTolerance, usedBoxFallback };
    },
  };
}
