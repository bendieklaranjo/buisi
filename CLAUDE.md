# CLAUDE.md – guidance for Claude Code in this repo

## What this is
BUISI is a phone-first web app (Vite + React + TypeScript) for inventorying reusable building components in existing buildings, room by room. It is also a research instrument: it measures time per element in **assisted** mode (segmentation + AI) versus **manual** mode (baseline). Users are building surveyors and researchers working on site, often outdoors, one-handed, with poor signal.

## Commands
- `npm run dev` – dev server (also on the local network for phones)
- `npm run dev:phone` – dev server over HTTPS
- `npm run ai` – local Claude API proxy (`server/ai-proxy.mjs`, reads `.env`)
- `npm run build` – `tsc -b` + Vite build. Run this after every change; it must pass with no type errors.

## Architecture
- `src/domain/` – data model (`types.ts`) and domain vocabulary (`fields.ts`). Field lists, units, element types, room uses and the room-tag convention live in `fields.ts`. Screens and exports read from there; never hard-code these elsewhere.
- `src/lib/store.ts` – the only place that touches storage (IndexedDB via idb-keyval). Objects are mutated, then saved with `saveProject` / `saveElement`. Components read with `useData()`.
- `src/lib/nav.ts` – routing. Routes are typed in `types.ts` (`Route`). Use `navigate()` and `back()`.
- `src/lib/segmentation/` – screens only use the `SegEngine` interface. The current engine is `regionGrow.ts` (placeholder). SAM goes in a new engine file, switched in `index.ts`.
- `src/lib/ai.ts` – all AI calls go through `/api/ai` (the local proxy). Never put API keys in client code.
- `src/lib/timing.ts` – the time-study clock.
- `src/screens/` – one file per screen, following the BUISI deck flow: Start → Menu → Project → Address → Building → Floors → Room → Element → Export, plus Study.

## Rules that must not break
1. **Human in the loop.** AI output is a proposal. AI- or default-filled values show as `ai-filled` (blue) until the person changes them. Never overwrite a value the person typed.
2. **Timing semantics are research data.** `Timing.activeMs` counts only while the element screen is open and the app is visible. Segmentation time before the element exists is handed over via `segStart`. `firstSavedMs` is frozen at the first save. Do not change these definitions without updating the README and the export column names. Prefer adding new fields over changing existing ones.
3. **Mode is stored per element** (`timing.mode`), at creation time.
4. **DIN SPEC 91484 naming.** Keep the German terms next to the English labels in the UI and as column names in exports.
5. **Room tags** follow `Floor_Use_Number`, e.g. `OG1_OFF_02` (see `makeRoomTag`).
6. **Offline first.** Everything except the AI calls must work without a network connection.

## Style
- Mobile first: test at 400 px width. Touch targets at least 44 px.
- Colours and fonts are CSS tokens in `src/styles.css` (`:root` and the dark-mode blocks). Use tokens, not literal colours.
- UI copy is short, plain English and names things as surveyors know them. Error messages say what went wrong and what to do next.
- TypeScript strict mode. Small, focused modules; no new dependencies without a clear reason.
