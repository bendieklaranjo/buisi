# BUISI – Building stock inventory tool

A phone-first web app for documenting reusable building elements and products, room by room. A person stays in the loop at every step: segmentation proposes an outline, the person corrects it; AI proposes field values, the person checks them. Every element records how long it took, so assisted and manual inventory can be compared.

Version 0.1 – ported from the claude.ai prototype.

## Quick start (VS Code)

You need [Node.js](https://nodejs.org) (LTS) and [VS Code](https://code.visualstudio.com).

1. Unzip this folder and open it in VS Code (**File → Open Folder…**).
2. Open a terminal (**Terminal → New Terminal**) and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open the `Local` address in your browser.
4. **On your phone:** connect to the same Wi-Fi and open the `Network` address (e.g. `http://192.168.1.20:5173`). The page reloads every time you save a file.

If the phone can't reach the address, allow Node.js through your computer's firewall.

### Testing over HTTPS

Some phone features (installing to the home screen, a live camera view later) need HTTPS:
```bash
npm run dev:phone
```
Your phone will warn about the self-signed certificate. Accept it for this local address.

### Turning on the AI features (optional)

"Mark elements with AI" and "Fill fields" use Claude's vision through a small local proxy, so your API key never reaches the browser.

1. Copy `.env.example` to `.env` and put your key from [console.anthropic.com](https://console.anthropic.com) into it.
2. In a second terminal, run `npm run ai`.

Without the proxy the app works normally and simply hides the AI buttons.

## Live demo (GitHub Pages)

Every push to `main` builds the app and publishes it at `https://<your-github-username>.github.io/buisi/` (see `.github/workflows/deploy.yml`). The link is HTTPS, so it works on any phone, with the camera, and without being on the same Wi-Fi.

- **One-time setup:** on github.com, open the repository → **Settings → Pages → Source: GitHub Actions**.
- **Progress:** the **Actions** tab shows each deploy. A green tick means the new version is live, usually 1–2 minutes after pushing.
- **Data stays on each device:** every tester's inventory is stored in their own browser. Nothing is uploaded.
- **AI features** are hidden on the hosted demo. The local proxy only runs on your computer. Hosting them needs a small server function (planned).

## How the app is organised

```
src/
  domain/
    types.ts         data model: Project, Room, Element, Timing, Route
    fields.ts        DIN SPEC 91484 fields, option lists, room-tag convention
  lib/
    store.ts         IndexedDB storage (projects, elements, photos)
    timing.ts        time-study clock
    segmentation/    engine interface + current region-growing engine
    ai.ts            Claude vision calls (via server/ai-proxy.mjs)
    export.ts        CSV, Excel, PDF, time-study export
    images.ts        photo resizing and cropping
    nav.ts           screen navigation (phone back gesture works)
  screens/           one file per screen, in the order of the BUISI deck
  components/        shared UI pieces
  styles.css         design tokens (sage/olive) and styles
server/
  ai-proxy.mjs       local proxy for Claude API requests
```

To change what the app asks for (fields, units, element types, room uses), edit `src/domain/fields.ts`.

## The time study

- Each element stores its **mode**: `assisted` (segmentation + AI) or `manual` (baseline). Switch with the mode chip in the top bar.
- The clock **starts** at the first tap on an element (assisted) or at "Add element manually".
- It **pauses** while the app is in the background, and **stops** at the first save (`firstSavedMs`).
- Also logged per element: segmentation taps, AI wait time, AI fields filled, AI fields kept, human corrections, required fields filled, number of photos.
- Results: **Time study results** in the menu, the CSV export there, and the "Time study" sheet in the Excel export.

## Swapping in SAM

The screens only use the interface in `src/lib/segmentation/types.ts`. To use MobileSAM or SlimSAM:

1. `npm install onnxruntime-web`
2. Put the ONNX encoder and decoder files in `public/models/`.
3. Create `src/lib/segmentation/sam.ts` that implements `SegEngine`:
   - `prepare(img)` runs the image encoder once per room photo. This is slow (about 1–3 s on a phone), so show "Preparing outlines…" while it runs.
   - `segment(prompt)` runs the decoder with positive points (label 1), negative points (label 0) and an optional box. It returns the mask at a working resolution.
4. Change `createEngine()` in `src/lib/segmentation/index.ts` to return the SAM engine.

Keep the region-growing engine as a fallback for older phones.

## Roadmap

- [ ] SAM segmentation (see above)
- [ ] Address lookup: Swiss building register (GWR), Zürich open data, Street View image
- [ ] Installable offline app (`vite-plugin-pwa`)
- [ ] Live camera view instead of photo capture
- [ ] Shared projects and a backend (e.g. Supabase) – replace the persistence functions in `src/lib/store.ts`
- [ ] Upload to reuse marketplaces
- [ ] Native iOS/Android app with Capacitor
- [ ] Verify e-BKP-H defaults in `TYPE_DEFAULTS` (currently main groups only)

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server, reachable from your phone |
| `npm run dev:phone` | Same, over HTTPS |
| `npm run ai` | Local AI proxy (needs `.env`) |
| `npm run build` | Type check and production build into `dist/` |
| `npm run preview` | Serve the production build |
