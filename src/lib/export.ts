/**
 * Exports following the Swiss-Inv data structure.
 * - Excel: sheets "Gebäude", "Bauteile" (Stufe 1 + 2, template column order and names),
 *   "Zusatzfelder" (app fields that are not part of Swiss-Inv) and "Zeitstudie".
 * - ZIP: the Excel file plus all photos, named as listed in "Liste der vorhandenen Fotos".
 * - CSV: the "Bauteile" sheet. PDF: a short report (design comes later).
 * Heavy libraries load on demand.
 */
import { floorLabel } from "../domain/fields";
import { BUILDING_FIELDS, BUILDING_SECTIONS, ELEMENT_STUFE1, ELEMENT_STUFE2, missingElementMuss, type FieldDef } from "../domain/swissinv";
import type { Element, Project } from "../domain/types";
import { elementsOf, getPhoto } from "./store";

/* ---------------------------------------------------------------- helpers */

const slug = (s: string) => (s || "projekt").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w-]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "projekt";
const stamp = () => new Date().toISOString().slice(0, 10);
export const baseName = (p: Project) => `SwissInv_${slug(p.name)}_${stamp()}`;

/** Template names: the second "Gebrauchszustand…" and "Liste der vorhandenen Dokumente" fields carry " (Text)" only in the app. */
const templateName = (d: FieldDef) => d.label.replace(/ \(Text\)$/, "");
const toDate = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v.slice(8, 10)}.${v.slice(5, 7)}.${v.slice(0, 4)}` : v);
function cell(d: FieldDef, v: string | undefined): string | number {
  const s = (v ?? "").trim();
  if (!s) return "";
  if (d.kind === "date") return toDate(s);
  if (d.key === "vollgeschosse") return s.padStart(2, "0");
  if (d.kind === "number" || d.kind === "year") { const n = Number(s.replace(",", ".")); return isNaN(n) ? s : n; }
  return s;
}

const savedElements = (p: Project) => elementsOf(p.id).filter(e => e.status === "saved");
const photoName = (e: Element, i: number) => `${slug(e.fields.bauteilId || e.id)}_${i + 1}.jpg`;

/* ---------------------------------------------------------------- tables */

const STUFE1 = ELEMENT_STUFE1.flatMap(s => s.fields).filter(d => !d.extra);
const STUFE2 = ELEMENT_STUFE2.flatMap(s => s.fields).filter(d => !d.extra);
const FOTO_COL = "Liste der vorhandenen Fotos";

/** "Bauteile": one row per saved element; columns in template order (Stufe 1, photos, Stufe 2). */
export function elementTable(p: Project): (string | number)[][] {
  const head = [...STUFE1.map(templateName), FOTO_COL, ...STUFE2.map(templateName)];
  const rows = savedElements(p).map(e => [
    ...STUFE1.map(d => cell(d, e.fields[d.key])),
    e.photoIds.map((_, i) => photoName(e, i)).join("; "),
    ...STUFE2.map(d => cell(d, e.fields[d.key])),
  ]);
  return [head, ...rows];
}

/** "Gebäude": one row per field, as in the template (Bereich | Datenfeld | Wert | Muss/Kann). */
export function buildingTable(p: Project): (string | number)[][] {
  return [
    ["Bereich", "Datenfeld", "Wert", "Muss / Kann"],
    ...BUILDING_SECTIONS.flatMap(s => s.fields.filter(d => !d.extra).map(d => [s.title, d.label, cell(d, p.building[d.key]), d.req === "muss" ? "Muss" : "Kann"])),
  ];
}

/** "Zusatzfelder": fields the app records beyond Swiss-Inv. */
export function extrasTable(p: Project): (string | number)[][] {
  const extraB = BUILDING_FIELDS.filter(d => d.extra);
  const out: (string | number)[][] = [["Gebäude – Zusatzfeld", "Wert"], ...extraB.map(d => [d.label, cell(d, p.building[d.key])])];
  if (p.gwr) out.push(["GWR Feature", p.gwr.featureId], ["GWR Gebäudebezeichnung", p.gwr.name ?? ""], ["GWR Koordinaten (LV95)", p.gwr.e && p.gwr.n ? `${p.gwr.e}; ${p.gwr.n}` : ""]);
  out.push([], ["Bauteil ID", "Raum-Tag", "Raum", "Geschoss", "Zielprojekt bekannt", "Zielprojekt", "Erfassungsmodus", "Offene Muss-Felder"]);
  for (const e of savedElements(p)) {
    const r = p.rooms.find(x => x.id === e.roomId);
    out.push([e.fields.bauteilId ?? "", r?.tag ?? "", r?.name ?? "", floorLabel(r?.floor ?? 0), e.fields.zielprojektBekannt ?? "", e.fields.zielprojekt ?? "", e.timing.mode,
      missingElementMuss(e.fields, e.photoIds.length).join(", ")]);
  }
  return out;
}

export function studyRows(projects: Project[]) {
  const out: Record<string, string | number>[] = [];
  for (const p of projects) for (const e of elementsOf(p.id)) {
    if (e.status !== "saved") continue;
    const r = p.rooms.find(x => x.id === e.roomId); const t = e.timing;
    out.push({
      element_id: e.fields.bauteilId || e.id, project: p.name, room_tag: r?.tag ?? "", bezeichnung: e.fields.bezeichnung ?? "", ebkp: e.fields.ebkp ?? "", mode: t.mode,
      created_at: new Date(e.createdAt).toISOString(), saved_at: e.savedAt ? new Date(e.savedAt).toISOString() : "",
      active_s_first_save: +((t.firstSavedMs ?? t.activeMs) / 1000).toFixed(1), active_s_total: +(t.activeMs / 1000).toFixed(1),
      segmentation_taps: t.segTaps, suggestions_kept: t.suggestionsKept ?? 0, corrections: t.corrections ?? 0,
      muss_filled: t.mussFilled ?? "", muss_total: t.mussTotal ?? "", photos: e.photoIds.length,
    });
  }
  return out;
}

/* ---------------------------------------------------------------- files */

const csvOf = (rows: (string | number)[][], sep = ";") => {
  const q = (v: unknown) => { const s = String(v ?? ""); return /[";\n,]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return "﻿" + rows.map(r => r.map(q).join(sep)).join("\r\n");
};
export const toCSV = (rows: Record<string, unknown>[]) => (rows.length ? csvOf([Object.keys(rows[0]), ...rows.map(r => Object.values(r) as (string | number)[])], ",") : "");

export function download(filename: string, data: Blob) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function workbook(p: Project): Promise<ArrayBuffer> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const sheet = (rows: (string | number)[][], widths: number[]) => { const ws = XLSX.utils.aoa_to_sheet(rows); ws["!cols"] = widths.map(w => ({ wch: w })); return ws; };
  XLSX.utils.book_append_sheet(wb, sheet(buildingTable(p), [24, 52, 40, 10]), "Gebäude");
  const et = elementTable(p);
  XLSX.utils.book_append_sheet(wb, sheet(et, et[0].map(() => 20)), "Bauteile");
  XLSX.utils.book_append_sheet(wb, sheet(extrasTable(p), [26, 18, 18, 10, 18, 22, 14, 40]), "Zusatzfelder");
  const sr = studyRows([p]);
  if (sr.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sr), "Zeitstudie");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}
const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function exportXLSX(p: Project) {
  download(baseName(p) + ".xlsx", new Blob([await workbook(p)], { type: XLSX_TYPE }));
}

/** Excel + all photos, named as in "Liste der vorhandenen Fotos". */
export async function exportZIP(p: Project) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  zip.file(baseName(p) + ".xlsx", await workbook(p));
  const dir = zip.folder("Fotos")!;
  for (const e of savedElements(p)) {
    for (let i = 0; i < e.photoIds.length; i++) { const b = await getPhoto(e.photoIds[i]); if (b) dir.file(photoName(e, i), b); }
  }
  if (p.imageId) { const b = await getPhoto(p.imageId); if (b) dir.file("Gebaeude.jpg", b); }
  download(baseName(p) + ".zip", await zip.generateAsync({ type: "blob" }));
}

export function exportCSV(p: Project) {
  download(baseName(p) + "_Bauteile.csv", new Blob([csvOf(elementTable(p))], { type: "text/csv" }));
}

export function exportStudyCSV(projects: Project[]) {
  download(`SwissInv_Zeitstudie_${stamp()}.csv`, new Blob([toCSV(studyRows(projects))], { type: "text/csv" }));
}

export async function exportPDF(p: Project) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const b = p.building;
  doc.setFontSize(18); doc.text("SwissInv-Beta · Bauteilinventar", 14, 18);
  doc.setFontSize(10);
  doc.text(`${p.name} · ${[b.adresse, b.hausnummer].filter(Boolean).join(" ")}, ${[b.plz, b.ort].filter(Boolean).join(" ")} · EGID ${b.egid || "–"} · EGRID ${b.egrid || "–"}`, 14, 25);
  doc.text(`Exportiert ${new Date().toLocaleString("de-CH")} · Swiss-Inv Datenstruktur v1.0-2024`, 14, 30);
  autoTable(doc, {
    startY: 35, theme: "grid", headStyles: { fillColor: [67, 75, 38] }, styles: { fontSize: 8 },
    head: [["Bauwerksart", "Bauweise", "Baujahr", "Gebäudevolumen m3", "Geschossfläche m2", "Vollgeschosse", "Erschliessung", "Expertin"]],
    body: [[b.bauwerksart ?? "", b.bauweise ?? "", b.baujahr ?? "", b.gebaeudevolumen ?? "", b.geschossflaeche ?? "", b.vollgeschosse ?? "", (b.erschliessung ?? "").replace(/ \(.*/, ""), b.exName ?? ""]],
  });
  const t = elementTable(p);
  const pick = ["Bauteil ID", "Bezeichnung", "eBKP-H/T Nummer", "Verortung im Gebäude", "Menge", "Einheit", "Höhe", "Breite", "Tiefe", "Schadstoffbelastet", "Verbindungsarten (grobe Einschätzung)", "Start Verfügbarkeit"];
  const idx = pick.map(h => t[0].indexOf(h));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastY = (doc as any).lastAutoTable?.finalY ?? 50;
  autoTable(doc, {
    startY: lastY + 6, theme: "striped", headStyles: { fillColor: [127, 142, 105] }, styles: { fontSize: 7, cellPadding: 1.4 },
    head: [pick.map(h => h.replace(" (grobe Einschätzung)", ""))], body: t.slice(1).map(r => idx.map(i => String(r[i] ?? ""))),
  });
  download(baseName(p) + ".pdf", new Blob([doc.output("arraybuffer")], { type: "application/pdf" }));
}
