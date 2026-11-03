/**
 * Language handling. The UI is fully German or fully English; French and Italian are listed
 * as "coming soon". Stored values (Swiss-Inv value lists, export column names) always stay in
 * the official German of the template – only what is shown on screen is translated.
 *
 *   const L = useLang();          // re-renders on language change
 *   t("menu.newProject")          // UI text in the current language
 *   label(def) / info(def)        // Swiss-Inv field label / explanation
 *   opt("Geschraubt")             // display text for a stored option value
 */
import { useSyncExternalStore } from "react";
import { UI } from "./ui";
import { OPTION_EN } from "./options";

export type Lang = "de" | "en";
export const LANGUAGES: { code: string; name: string; available: boolean }[] = [
  { code: "de", name: "Deutsch", available: true },
  { code: "en", name: "English", available: true },
  { code: "fr", name: "Français", available: false },
  { code: "it", name: "Italiano", available: false },
];

const KEY = "swissinv:lang";
let lang: Lang = (() => { try { const v = localStorage.getItem(KEY); return v === "en" ? "en" : "de"; } catch { return "de"; } })();
const ls = new Set<() => void>();

export function setLang(l: Lang) {
  lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* storage blocked */ }
  document.documentElement.lang = l;
  ls.forEach(f => f());
}
export const getLang = () => lang;
export const useLang = () => useSyncExternalStore(f => { ls.add(f); return () => ls.delete(f); }, () => lang);
export const hasChosenLang = () => { try { return !!localStorage.getItem(KEY); } catch { return false; } };

export type UIKey = keyof typeof UI;

/** UI text; `{name}` placeholders are filled from `vars`. */
export function t(key: UIKey, vars?: Record<string, string | number>): string {
  const e = UI[key];
  let s: string = lang === "en" ? e.en : e.de;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

/** Field label in the current language (German = the official Swiss-Inv name). */
export const label = (d: { label: string; labelEn: string }) => (lang === "en" ? d.labelEn : d.label);
export const hint = (d: { hint?: string; hintEn?: string }) => (lang === "en" ? d.hintEn : d.hint);
export const info = (d: { info?: string; infoEn?: string; label: string }) =>
  lang === "en" ? (d.infoEn ? `${d.infoEn} (Swiss-Inv: “${d.label}”)` : `Swiss-Inv: “${d.label}”`) : d.info;
/** Display text for a stored (German) option value. */
export const opt = (v: string) => (lang === "en" ? OPTION_EN[v] ?? v : v);
/** Short form of a long option, e.g. "Innenraum (komplett …)" → "Innenraum". */
export const optShort = (v: string) => opt(v).replace(/\s*\(.*\)$/, "");
