/**
 * Swiss building register (GWR) via the public geo.admin.ch API – no key needed, CORS enabled.
 * 1. searchAddress(): address search → featureId ("EGID_EDID")
 * 2. fetchBuilding(): GWR attributes for that building
 * 3. gwrToBuilding(): maps GWR attributes onto Swiss-Inv "Gebäude" fields (as suggestions)
 * Docs: https://api3.geo.admin.ch/services/sdiservices.html
 */
import type { GwrInfo } from "../domain/types";

const API = "https://api3.geo.admin.ch/rest/services";
const LAYER = "ch.bfs.gebaeude_wohnungs_register";

export interface AddressHit { label: string; featureId: string }

export async function searchAddress(text: string, signal?: AbortSignal): Promise<AddressHit[]> {
  const q = text.trim();
  if (q.length < 3) return [];
  const url = `${API}/api/SearchServer?type=locations&origins=address&limit=8&searchText=${encodeURIComponent(q)}`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`Address search failed (${r.status})`);
  const j = await r.json();
  return (j.results ?? [])
    .map((x: { attrs?: { label?: string; featureId?: string } }) => ({
      label: String(x.attrs?.label ?? "").replace(/<[^>]+>/g, "").trim(),
      featureId: String(x.attrs?.featureId ?? ""),
    }))
    .filter((h: AddressHit) => h.featureId && /^\d+_\d+$/.test(h.featureId));
}

export type GwrAttributes = Record<string, unknown>;

export async function fetchBuilding(featureId: string, signal?: AbortSignal): Promise<GwrAttributes> {
  const r = await fetch(`${API}/ech/MapServer/${LAYER}/${encodeURIComponent(featureId)}?returnGeometry=false&lang=de`, { signal });
  if (!r.ok) throw new Error(`Building register request failed (${r.status})`);
  const j = await r.json();
  return (j.feature?.attributes ?? j.feature?.properties ?? {}) as GwrAttributes;
}

/** GWR building class (GKLAS) → SIA 102 Bauwerksart, where there is a clear match. */
const GKLAS_TO_SIA: Record<number, string> = {
  1110: "II Wohnen EFH", 1121: "I Wohnen MFH", 1122: "I Wohnen MFH", 1130: "I Wohnen MFH",
  1220: "III Verwaltung", 1230: "V Verkauf", 1231: "VI Restaurant",
  1251: "IX Industrie", 1252: "X Lager", 1261: "VII Versammlungslokal", 1262: "VII Versammlungslokal",
  1263: "IV Schule", 1264: "VIII Spital", 1265: "XI Sportbaute",
};

const num = (v: unknown) => (typeof v === "number" ? v : v != null && v !== "" && !isNaN(Number(v)) ? Number(v) : undefined);
const str = (v: unknown) => (v == null ? "" : Array.isArray(v) ? String(v[0] ?? "") : String(v));

export interface GwrMapped { fields: Record<string, string>; info: GwrInfo; floorsAbove?: number }

/** Maps GWR attributes onto Swiss-Inv building fields. Only values the register actually has are returned. */
export function gwrToBuilding(a: GwrAttributes, featureId: string, label: string): GwrMapped {
  const f: Record<string, string> = {};
  const set = (k: string, v: unknown) => { const s = str(v).trim(); if (s && s !== "n.n.") f[k] = s; };
  set("egrid", a.egrid);
  set("egid", a.egid);
  set("adresse", a.strname);
  set("hausnummer", a.deinr);
  set("plz", a.dplz4);
  set("ort", a.dplzname || a.ggdename);
  f.land = "Schweiz";
  set("baujahr", a.gbauj);
  const vol = num(a.gvol); if (vol) f.gebaeudevolumen = String(Math.round(vol));
  const gastw = num(a.gastw); if (gastw) f.vollgeschosse = String(gastw).padStart(2, "0");
  const sia = GKLAS_TO_SIA[num(a.gklas) ?? -1]; if (sia) f.bauwerksart = sia;
  return {
    fields: f,
    floorsAbove: gastw,
    info: {
      featureId, label,
      name: str(a.gbez) && str(a.gbez) !== "n.n." ? str(a.gbez) : undefined,
      gemeinde: str(a.ggdename) || undefined, gemeindeNr: num(a.ggdenr),
      e: num(a.gkode), n: num(a.gkodn), gkat: num(a.gkat), gklas: num(a.gklas),
      garea: num(a.garea), gebf: num(a.gebf), gastw,
      fetchedAt: Date.now(),
    },
  };
}

/** Link to the building in map.geo.admin.ch (GWR layer, feature selected). */
export const geoAdminLink = (featureId: string) =>
  `https://map.geo.admin.ch/#/map?lang=de&topic=ech&layers=${LAYER}@features=${encodeURIComponent(featureId)}&bgLayer=ch.swisstopo.pixelkarte-farbe`;

/** Stadt Zürich 3D city model viewer (has building heights and the 3D model). */
export const ZUERICH_VIRTUELL = "https://3d.stzh.ch/appl/3d/zuerichvirtuell/";
export const isZurich = (info?: GwrInfo) => info?.gemeindeNr === 261 || /^zürich$/i.test(info?.gemeinde ?? "");

/** Plain-language names for GWR building categories (GKAT). */
export const GKAT_TEXT: Record<number, string> = {
  1010: "Provisorische Unterkunft", 1020: "Reines Wohngebäude", 1030: "Wohngebäude mit Nebennutzung",
  1040: "Gebäude mit teilweiser Wohnnutzung", 1060: "Gebäude ohne Wohnnutzung", 1080: "Sonderbau",
};
