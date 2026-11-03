# CLAUDE.md – guidance for Claude Code in this repo

## What this is
SwissInv-Beta is a phone-first web app (Vite + React + TypeScript) for reuse inventories of existing buildings, room by room, following the **Swiss-Inv data structure** (Cirkla, v1.0-2024). It is public and runs **without vision models** – the full tool with vision, LiDAR and price prediction is BUISI, a separate project. It is also a research instrument: it measures time per element in **assisted** mode (bounding box on the room photo + suggestions) versus **manual** mode (form only). Users are building surveyors and researchers working on site, often outdoors, one-handed, with poor signal.

## Commands
- `npm run dev` – dev server (also on the local network for phones)
- `npm run dev:phone` – dev server over HTTPS
- `npm run build` – `tsc -b` + Vite build. Run this after every change; it must pass with no type errors.

## Architecture
- `src/domain/swissinv.ts` – **the single source of truth** for Swiss-Inv fields: names (DE official + EN), order, value lists, Muss/Kann, explanations, eBKP list. Screens and exports read from there; never hard-code fields elsewhere.
- `src/domain/crb.ts` + `crb/ebkp-ifc.json` – element types from the CRB rule set eBKP-H (2020) – IFC. Never invent eBKP/IFC pairs; take them from this table.
- `src/i18n/` – German/English. `t(key)` for UI texts (`ui.ts`), `label(def)` / `info(def)` for fields, `opt(value)` for value lists (`options.ts`). Every new UI text needs both languages.
- `src/domain/fields.ts` – app vocabulary outside Swiss-Inv (project types, room uses, floors, room tags).
- `src/lib/gwr.ts` – Swiss building register via geo.admin.ch (public, no key). Register values are suggestions, never final.
- `src/lib/osm.ts` – fallback outside Switzerland via OpenStreetMap Nominatim. Usage policy: no search-as-you-type, at most 1 request/s, show "© OpenStreetMap contributors". Stored values stay German (`accept-language=de`).
- `src/lib/elements.ts` – element creation and auto-fill rules.
- `src/lib/store.ts` – the only place that touches storage (IndexedDB via idb-keyval). Objects are mutated, then saved with `saveProject` / `saveElement`. Components read with `useData()`.
- `src/lib/nav.ts` – routing. Routes are typed in `types.ts` (`Route`).
- `src/lib/segmentation/` – `regionGrow.ts` (an image algorithm, not a model) gives the automatic bounding box on a tap. SwissInv-Beta shows boxes only; masks belong to BUISI.
- `src/lib/timing.ts` – the time-study clock.
- `src/screens/` – Start → Language → Menu → Project → Hub (project menu) → Info (Projektinformationen, 4 pages) · Defaults → Floors → Room → Element (6 pages) · Export, plus Study. Step pages use `Progress` and `StepFooter` (back · skip · next) and a home button in `TopBar`.

## Rules that must not break
1. **Human in the loop.** Register values, catalogue suggestions and building defaults are proposals. They show as `suggested` (blue) until the person changes them. Never overwrite a value the person typed.
2. **Swiss-Inv conformity.** Field names, order and value lists follow the template exactly. The "Gebäude" and "Bauteile" export sheets contain only Swiss-Inv fields, in template order. App additions are marked `extra: true` and go to the "Zusatzfelder" sheet.
3. **Timing semantics are research data.** `Timing.activeMs` counts only while the element screen is open and the app is visible. Outline time before the element exists is handed over via `segStart`. `firstSavedMs` is frozen at the first save. Do not change these definitions without updating the README and the export column names. Prefer adding new fields over changing existing ones.
4. **Mode is stored per element** (`timing.mode`), at creation time. Catalogue suggestions only apply in assisted mode; register data and building defaults apply in both.
5. **Room tags** follow `Floor_Use_Number`, e.g. `OG1_OFF_02`. Bauteil IDs are `<room tag>-<nn>`.
6. **Terminology.** Say *element* (Bauteil) or *product* (Bauprodukt), never "component", in UI copy and docs. "Component" is only used for React components in code.
7. **No vision models or AI calls** in this repo – that belongs to BUISI.
8. **Both languages, always.** The UI is fully German or fully English. Stored values and Excel/CSV column names stay in the official German of the template; only the display is translated.
9. **Offline first.** Everything except the address search must work without a network connection.

## Style
- Mobile first: test at 400 px width. Touch targets at least 44 px.
- Colours and fonts are CSS tokens in `src/styles.css`. Use tokens, not literal colours.
- In German, field labels are the official Swiss-Inv names; in English, plain English labels (the ⓘ shows the official name). UI copy is short and plain. Error messages say what went wrong and what to do next.
- TypeScript strict mode. Small, focused modules; no new dependencies without a clear reason.
