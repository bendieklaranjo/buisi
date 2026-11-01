/** Tiny toast bus: call toast("Saved") anywhere; <Toast/> in App shows it. */
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("buisi:toast", { detail: message }));
}
