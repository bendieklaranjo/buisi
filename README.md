# SwissInv-Beta

A phone-first web app for **reuse inventories** of existing buildings, room by room, following the **Swiss-Inv data structure** (Cirkla, v1.0-2024). A person stays in the loop at every step: the building register pre-fills the building data, tap-to-outline proposes the element, the element catalogue proposes eBKP, IFC entity and unit – and the person checks and completes everything. Every element records how long it took, so assisted and manual inventory can be compared.

**Live demo:** https://bendieklaranjo.github.io/swissinv-beta/

SwissInv-Beta is the public, model-free part of the research. The full tool with vision models, LiDAR and price prediction is **BUISI**, developed separately.

## What it does

The app runs fully in **German or English** (chosen after the start screen; French and Italian are announced as coming soon). Every page has a progress bar, **back**, **skip** and a **home** button (project menu, or main menu outside a project).

1. **Start → language → main menu** – start a new project or resume one; time study results.
2. **Project** – name, project type (only the reuse inventory is available; others are "coming soon") and inventory mode.
3. **Project menu** with three parts:
   - **Projektinformationen** – four pages: find the building (address search in the Swiss building register GWR, which fills EGRID, EGID, address, year built, volume, storeys and the SIA 102 building type; outside Switzerland, e.g. in Germany, a button searches OpenStreetMap instead, which fills the address and, where mapped, storeys, year built and building type), Allgemeine Gebäudedaten, Weitere Informationen, Kontakte. The auditor is remembered for the next project.
   - **Inventar** – starts with the values for all elements (Verfügbarkeit, Status, Dokumente) and the floors, then floors → rooms → elements. Rooms get a tag after `Floor_Use_Number`, e.g. `OG1_OFF_02`; "Next room" sits in the top corner.
   - **Export** – Excel in the Swiss-Inv structure, ZIP with Excel + photos, CSV, PDF report.
4. **Room photo → bounding box** (assisted mode) – tap an element for an automatic box, or drag a box around it. The crop becomes the first photo. (Segmentation masks are reserved for BUISI.)
5. **Element** – six pages: photos (front, side, fixing detail), identification (function in the building → element type, which generates the eBKP number and name and the IFC entity; the name stays free), quantity and dimensions (with a sketch), potential, description and attachments ("Keine" for no documents), Bauteil Stufe 2. Verortung is filled from the room and not asked.

Blue fields are **suggestions** (from the register, the element type or the building-wide values). They stay blue until the person checks or changes them, and the app never overwrites what the person typed.

### Illustration

`public/illustration.png` is the SwissInv building illustration shown on the start screen, in the main menu and after an export. Replace the file to change it.

### Element types (CRB)

The element types come from the **CRB rule set "eBKP-H (2020) – IFC", BETA 1.0** (`CRB_ifc_Regelsatz_eBKP-H2020_BETA_1.0.xlsx`, sheet `CRB_eBKP-H-Ifc`, level 4 "IFC-Regelelement"). They were extracted into `src/domain/crb/ebkp-ifc.json`: 768 rule elements in eBKP-H main groups C–J, each with its eBKP-H element code (e.g. G01.05), names in DE/EN/FR/IT, the IFC entity and its predefined type. Left out: main groups A/B, cost items, IFC2x3 duplicates and openings. You pick a main group (C–J), then the type, or search by name or code. Picking a type fills the full eBKP number + name (e.g. G01.05 Innentür) and the IFC entity (IfcDoor); the predefined type (DOOR) goes to "Zusatzfelder". To update, re-extract the JSON from a newer CRB file.

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
- **"Keine"** in "Liste der vorhandenen Dokumente" is an app addition for elements without documents.
- **Element type (Bauteiltyp)** and **IFC PredefinedType** are app fields from the CRB rule set; they standardise eBKP and IFC and are exported in "Zusatzfelder".

## The time study

- Each element stores its **mode**: `assisted` (bounding box on the room photo, crop as first photo, suggestions from the element type) or `manual` (form only). Both modes get the register data, the building-wide values, and eBKP + IFC generated from the element type.
- The clock **starts** at the first tap or drag on the room photo (assisted) or at "Add element manually", **pauses** while the app is in the background, and **stops** at the first save (`firstSavedMs`).
- Also logged: outline taps, suggestions kept, suggestions corrected, required fields filled, number of photos.
- Results: **Time study results** in the menu, its CSV export, and the "Zeitstudie" sheet in the Excel export.

## How the app is organised

```
src/
  i18n/              German/English: ui.ts (UI texts), options.ts (English for value lists)
  domain/
    swissinv.ts      Swiss-Inv fields (DE + EN), lists, explanations, eBKP
    crb.ts           element types from the CRB eBKP-H – IFC rule set (crb/ebkp-ifc.json)
    fields.ts        app vocabulary: project types, room uses, floors, room tags
    types.ts         data model
  lib/
    gwr.ts           Swiss building register (geo.admin.ch) search and mapping
    osm.ts           OpenStreetMap (Nominatim) address search outside Switzerland – only on button press, max 1 request/s
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
