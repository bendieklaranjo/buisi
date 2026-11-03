/** Minimal router: screens are a Route object; the phone's back gesture works via browser history. */
import { useSyncExternalStore } from "react";
import type { Route } from "../domain/types";

let route: Route = (history.state as Route) ?? { name: "start" };
const ls = new Set<() => void>();
const emit = () => ls.forEach(l => l());

window.addEventListener("popstate", e => { route = (e.state as Route) ?? { name: "menu" }; emit(); });

export function navigate(to: Route, replace = false) {
  route = to;
  if (replace) history.replaceState(to, ""); else history.pushState(to, "");
  window.scrollTo(0, 0);
  emit();
}
export const back = () => history.back();
/** Home: inside a project → its project menu; otherwise → the main menu. */
export const home = (pid?: string) => navigate(pid ? { name: "hub", pid } : { name: "menu" });
export const useRoute = () => useSyncExternalStore(l => { ls.add(l); return () => ls.delete(l); }, () => route);
