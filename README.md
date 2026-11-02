# SwissInv-Beta

A phone-first web app for **reuse inventories** of existing buildings, room by room, following the **Swiss-Inv data structure** (Cirkla, v1.0-2024). A person stays in the loop at every step: the building register pre-fills the building data, tap-to-outline proposes the element, the element catalogue proposes eBKP, IFC entity and unit – and the person checks and completes everything. Every element records how long it took, so assisted and manual inventory can be compared.

**Live demo:** https://bendieklaranjo.github.io/swissinv-beta/

SwissInv-Beta is the public, model-free part of the research. The full tool with vision models, LiDAR and price prediction is **BUISI**, developed separately.

## What it does

1. **Project** – name, project type (only the reuse inventory is available; others are marked "coming soon") and inventory mode.
2. **Find the building** – address search in the Swiss building register (GWR, via geo.admin.ch). Fills EGRID, EGID, address, year built, building volume, storeys and the SIA 102 building type. Links to map.geo.admin.ch and, in Zürich, to Zürich virtuell (3D).
3. **Building information** – the Swiss-Inv "Gebäude" fields (Allgemeine Gebäudedaten, Weitere Informationen, Kontakte), with the template's explanations behind each ⓘ button. The auditor's contact details are remembered for the next project. Values that are the same for all elements (Verfügbarkeit, Dokumente, Status) are set once here.
4. **Floors → rooms** – rooms get a tag after `Floor_Use_Number`, e.g. `OG1_OFF_02`.
5. **Room photo → tap-to-outline** (assisted mode) – tap an element, correct the outline, confirm. The outline crop becomes the first photo.
6. **Element** – Swiss-Inv "Bauteil Stufe 1" (and optional "Stufe 2"): function in the building (eBKP main group) before the eBKP element group, height/width/depth with a sketch, three photo slots (front, side, fixing detail), "destination project known".
7. **Export** – Excel in the Swiss-Inv structure, ZIP with Excel + photos, CSV, PDF.

Blue fields are **suggestions** (from the register, the catalogue or the building defaults). They stay blue until the person checks or changes them, and the app never overwrites what the person typed.

## Quick start (VS Code)

You need [Node.js](https://nodejs.org) (LTS).

```bash
npm install
npm run dev
```

Open the `Local` address on your computer, or the `Network` address on your phone (same Wi-Fi). Use `npm run dev:phone` for HTTPS on the local network.

## Live demo (GitHub Pages)

Every push to `main` builds the app and publishes it (`.github/workflows/deploy.yml`, Pages source: GitHub Actions). The demo URL follows the repository name. After a deploy, reload with Ctrl+Shift+R or use a private window – Pages caches for about 10 minutes. Each tester's data stays in their own browser.

## Swiss-Inv conformity

- All field names, order, value lists, Muss/Kann and explanations come from `src/domain/swissinv.ts`, transcribed from the template.
- The Excel export has the sheets **Gebäude** and **Bauteile** in template order and naming. Fields the app adds beyond Swiss-Inv (marked "Zusatz" in the app) go to a separate sheet **Zusatzfelder**: Hauptmaterial, destination project, mode, GWR reference.
- **Dimensions:** the template lists height, width, depth, length and diameter as Muss. The app counts the group as complete with height + width + depth, or length, or diameter.
- **Photos:** at least 3 per element, compressed to under 1.5 MB, named `<Bauteil ID>_<n>.jpg` in the ZIP and in "Liste der vorhandenen Fotos".
- **Bauwerksart** allows several values for mixed-use buildings, joined with "; ".

## The time study

- Each element stores its **mode**: `assisted` (tap-to-outline, crop as first photo, catalogue suggestions) or `manual` (form only). Both modes get the register data and the building-wide defaults.
- The clock **starts** at the first tap on an element (assisted) or at "Add element manually", **pauses** while the app is in the background, and **stops** at the first save (`firstSavedMs`).
- Also logged: outline taps, suggestions kept, suggestions corrected, required fields filled, number of photos.
- Results: **Time study results** in the menu, its CSV export, and the "Zeitstudie" sheet in the Excel export.

## How the app is organised

```
src/
  domain/
    swissinv.ts      Swiss-Inv fields, lists, explanations, eBKP, element catalogue
    fields.ts        app vocabulary: project types, room uses, floors, room tags
    types.ts         data model
  lib/
    gwr.ts           Swiss building register (geo.admin.ch) search and mapping
    elements.ts      element creation and suggestions (auto-fill)
    store.ts         IndexedDB storage (projects, elements, photos)
    timing.ts        time-study clock
    segmentation/    engine interface + region-growing engine
    export.ts        Excel, ZIP, CSV, PDF, time study
    images.ts        photo decoding (incl. iPhone HEIC), compression, cropping
    nav.ts           screen navigation
  screens/           one file per screen
  components/        shared UI pieces
```

## Roadmap for SwissInv-Beta

- [ ] Zürich-specific data from the city's 3D model (building height, volume) where the register is incomplete
- [ ] French and Italian versions (Swiss-Inv exists in DE/FR/IT)
- [ ] Installable offline app (`vite-plugin-pwa`)
- [ ] PDF report design
- [ ] Verify the eBKP suggestions in the element catalogue with practitioners

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server, reachable from your phone |
| `npm run dev:phone` | Same, over HTTPS |
| `npm run build` | Type check and production build into `dist/` |
| `npm run preview` | Serve the production build |
