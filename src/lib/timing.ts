/**
 * Time-study clock. One element is "active" at a time; its active time grows while the
 * element screen is open and the app is visible. Segmentation time before the element
 * exists is measured by the room screen and handed over when the element is created.
 */
import { getData, saveElement } from "./store";

let active: { id: string; since: number } | null = null;
let resumeId: string | null = null;

export function startClock(elementId: string) {
  stopClock();
  active = { id: elementId, since: Date.now() };
}

export function stopClock() {
  if (!active) return;
  const el = getData().elements[active.id];
  if (el) { el.timing.activeMs += Date.now() - active.since; saveElement(el); }
  active = null;
}

/** Live active ms for display, including the running interval. */
export function liveMs(elementId: string) {
  const el = getData().elements[elementId];
  if (!el) return 0;
  return el.timing.activeMs + (active && active.id === elementId ? Date.now() - active.since : 0);
}

type PauseListener = (hidden: boolean, pausedMs: number) => void;
const pauseListeners = new Set<PauseListener>();
/** Lets the room screen shift its segmentation start time while the app was hidden. */
export function onPause(l: PauseListener) { pauseListeners.add(l); return () => { pauseListeners.delete(l); }; }

let hiddenAt = 0;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hiddenAt = Date.now();
    if (active) { resumeId = active.id; stopClock(); }
    pauseListeners.forEach(l => l(true, 0));
  } else {
    const paused = hiddenAt ? Date.now() - hiddenAt : 0;
    if (resumeId) { startClock(resumeId); resumeId = null; }
    pauseListeners.forEach(l => l(false, paused));
  }
});

/** Call when leaving the element screen: stops the clock and forgets any pending resume. */
export function endClock() { stopClock(); resumeId = null; }
