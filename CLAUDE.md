# CLAUDE.md – guidance for Claude Code in this repo

## What this is
SwissInv-Beta is a phone-first web app (Vite + React + TypeScript) for reuse inventories of existing buildings, room by room, following the **Swiss-Inv data structure** (Cirkla, v1.0-2024). It is public and runs **without vision models** – the full tool with vision, LiDAR and price prediction is BUISI, a separate project. It is also a research instrument: it measures time per element in **assisted** mode (tap-to-outline + suggestions) versus **manual** mode (form only). Users are building surveyors and researchers working on site, often outdoors, one-handed, with poor signal.

## Commands
- `npm run dev` – dev server (also on the local network for phones)
- `npm run dev:phone` – dev server over HTTPS
- `npm run build` – `tsc -b` + Vite build. Run this after every change; it must pass with no type errors.

## Architecture
- `src/domain/swissinv.ts` – **the single source of truth** for Swiss-Inv fields: names, order, value lists, Muss/Kann, explanations, eBKP list, element catalogue. Screens and exports read from there; never hard-code fields elsewhere.
- `src/domain/fields.ts` – app vocabulary outside Swiss-Inv (project types, room uses, floors, room tags).
- `src/lib/gwr.ts` – Swiss building register via geo.admin.ch (public, no key). Register values are suggestions, never final.
- `src/lib/elements.ts` – element creation and auto-fill rules.
- `src/lib/store.ts` – the only place that touches storage (IndexedDB via idb-keyval). Objects are mutated, then saved with `saveProject` / `saveElement`. Components read with `useData()`.
- `src/lib/nav.ts` – routing. Routes are typed in `types.ts` (`Route`).
- `src/lib/segmentation/` – screens only use the `SegEngine` interface; current engine is `regionGrow.ts` (an image algorithm, not a model).
- `src/lib/timing.ts` – the time-study clock.
- `src/screens/` – one file per screen: Start → Menu → Project → Address → Building → Floors → Room → Element → Export, plus Study.

## Rules that must not break
1. **Human in the loop.** Register values, catalogue suggestions and building defaults are proposals. They show as `suggested` (blue) until the person changes them. Never overwrite a value the person typed.
2. **Swiss-Inv conformity.** Field names, order and value lists follow the template exactly. The "Gebäude" and "Bauteile" export sheets contain only Swiss-Inv fields, in template order. App additions are marked `extra: true` and go to the "Zusatzfelder" sheet.
3. **Timing semantics are research data.** `Timing.activeMs` counts only while the element screen is open and the app is visible. Outline time before the element exists is handed over via `segStart`. `firstSavedMs` is frozen at the first save. Do not change these definitions without updating the README and the export column names. Prefer adding new fields over changing existing ones.
4. **Mode is stored per element** (`timing.mode`), at creation time. Catalogue suggestions only apply in assisted mode; register data and building defaults apply in both.
5. **Room tags** follow `Floor_Use_Number`, e.g. `OG1_OFF_02`. Bauteil IDs are `<room tag>-<nn>`.
6. **Terminology.** Say *element* (Bauteil) or *product* (Bauprodukt), never "component", in UI copy and docs. "Component" is only used for React components in code.
7. **No vision models or AI calls** in this repo – that belongs to BUISI.
8. **Offline first.** Everything except the address search must work without a network connection.

## Style
- Mobile first: test at 400 px width. Touch targets at least 44 px.
- Colours and fonts are CSS tokens in `src/styles.css`. Use tokens, not literal colours.
- Field labels use the official Swiss-Inv German name, with a short English hint. Other UI copy is short, plain English. Error messages say what went wrong and what to do next.
- TypeScript strict mode. Small, focused modules; no new dependencies without a clear reason.
