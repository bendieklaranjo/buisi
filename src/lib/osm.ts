/**
 * Address search outside Switzerland via OpenStreetMap (Nominatim) – no key needed, CORS enabled.
 * Used as a fallback when the Swiss building register (GWR) finds nothing, e.g. for German addresses.
 * Nominatim usage policy: at most 1 request per second and no search-as-you-type, so the app only
 * searches when the person presses the button. https://operations.osmfoundation.org/policies/nominatim/
 * OSM has the address and coordinates; floors, building use and year only where mappers added them.
 */
import type { GwrInfo } from "../domain/types";
import type { GwrMapped } from "./gwr";

const API = "https://nominatim.openstreetmap.org/search";

interface Place {
  display_name: string; lat: string; lon: string; osm_type: string; osm_id: number;
  category?: string; type?: string; name?: string;
  address?: Record<string, string>; extratags?: Record<string, string> | null;
}
export interface OsmHit { label: string; featureId: string; place: Place }

let last = 0;
export async function searchOsm(text: string, signal?: AbortSignal): Promise<OsmHit[]> {
  const q = text.trim();
  if (q.length < 3) return [];
  const wait = 1100 - (Date.now() - last); // keep to the 1 request/second limit
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  last = Date.now();
  const url = `${API}?format=jsonv2&addressdetails=1&extratags=1&limit=6&accept-language=de&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`OpenStreetMap search failed (${r.status})`);
  const j = (await r.json()) as Place[];
  return j.map(p => ({ label: p.display_name, featureId: `${p.osm_type}/${p.osm_id}`, place: p }));
}

/** OSM building=* → SIA 102 Bauwerksart, where there is a clear match. */
const BUILDING_TO_SIA: Record<string, string> = {
  house: "II Wohnen EFH", detached: "II Wohnen EFH", semidetached_house: "II Wohnen EFH", terrace: "II Wohnen EFH", bungalow: "II Wohnen EFH",
  apartments: "I Wohnen MFH", residential: "I Wohnen MFH", dormitory: "I Wohnen MFH",
  office: "III Verwaltung", government: "III Verwaltung", commercial: "III Verwaltung",
  school: "IV Schule", university: "IV Schule", college: "IV Schule", kindergarten: "IV Schule",
  retail: "V Verkauf", supermarket: "V Verkauf", kiosk: "V Verkauf",
  hospital: "VIII Spital", industrial: "IX Industrie", warehouse: "X Lager",
  church: "VII Versammlungslokal", civic: "VII Versammlungslokal", sports_hall: "XI Sportbaute",
};

const year = (v?: string) => v?.match(/\b(1[5-9]\d\d|20\d\d)\b/)?.[1];

/** Maps an OSM result onto Swiss-Inv building fields. Only values OSM actually has are returned. */
export function osmToBuilding(h: OsmHit): GwrMapped {
  const a = h.place.address ?? {}, x = h.place.extratags ?? {};
  const f: Record<string, string> = {};
  const set = (k: string, v?: string) => { if (v && v.trim()) f[k] = v.trim(); };
  set("adresse", a.road ?? a.pedestrian ?? a.street);
  set("hausnummer", a.house_number);
  set("plz", a.postcode);
  set("ort", a.city ?? a.town ?? a.village ?? a.municipality ?? a.hamlet);
  set("land", a.country);
  set("baujahr", year(x.start_date) ?? year(x.construction_date) ?? year(x["building:start_date"]));
  const levels = Number(x["building:levels"]);
  const floorsAbove = Number.isFinite(levels) && levels > 0 ? Math.round(levels) : undefined;
  if (floorsAbove) f.vollgeschosse = String(floorsAbove).padStart(2, "0");
  const kind = x.building ?? (h.place.category === "building" ? h.place.type : undefined);
  const sia = kind && BUILDING_TO_SIA[kind]; if (sia) f.bauwerksart = sia;
  const info: GwrInfo = {
    source: "osm", featureId: h.featureId, label: h.label,
    name: h.place.name || undefined, gemeinde: f.ort, gastw: floorsAbove,
    lat: Number(h.place.lat), lon: Number(h.place.lon), fetchedAt: Date.now(),
  };
  return { fields: f, info, floorsAbove };
}

export const osmLink = (featureId: string) => `https://www.openstreetmap.org/${featureId}`;
