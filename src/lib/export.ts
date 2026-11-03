/**
 * Exports following the Swiss-Inv data structure.
 * - Excel: sheets "Gebäude", "Bauteile" (Stufe 1 + 2, template column order and names),
 *   "Zusatzfelder" (app fields that are not part of Swiss-Inv) and "Zeitstudie".
 * - ZIP: the Excel file plus all photos, named as listed in "Liste der vorhandenen Fotos".
 * - CSV: the "Bauteile" sheet.
 * - PDF: report in the UI language – header with project image and building data, overview
 *   table, then one page per element with its fields and photos.
 * Excel/CSV always use the official German names and values; heavy libraries load on demand.
 */
import { RULE_BY_ID, ebkpName } from "../domain/crb";
import { floorLabel } from "../domain/fields";
import { BUILDING_FIELDS, BUILDING_SECTIONS, ELEMENT_FIELD, STUFE1_KEYS, STUFE2_KEYS, STUFE2_SECTIONS, missingElementMuss, splitMulti, type FieldDef } from "../domain/swissinv";
import type { Element, Project } from "../domain/types";
import { getLang, label, opt, optShort } from "../i18n";
import { elementsOf, getPhoto } from "./store";

/* ---------------------------------------------------------------- helpers */

const slug = (s: string) => (s || "projekt").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\w-]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "projekt";
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
/** Value for the PDF report, in the UI language. */
function shown(d: FieldDef, v: string | undefined): string {
  const s = (v ?? "").trim();
  if (!s) return "";
  if (d.kind === "date") return toDate(s);
  if (d.kind === "multi") return splitMulti(s).map(optShort).join(", ");
  if (d.kind === "select") return optShort(s);
  return d.unit ? `${s} ${d.unit}` : s;
}

const savedElements = (p: Project) => elementsOf(p.id).filter(e => e.status === "saved");
const photoName = (e: Element, i: number) => `${slug(e.fields.bauteilId || e.id)}_${i + 1}.jpg`;

/* ---------------------------------------------------------------- tables */

const STUFE1 = STUFE1_KEYS.map(k => ELEMENT_FIELD[k]).filter(d => !d.extra);
const STUFE2 = STUFE2_KEYS.map(k => ELEMENT_FIELD[k]).filter(d => !d.extra);
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
  const sectionName = (id: string, title: string) => (id === "verortung" ? "Verortung" : title);
  return [
    ["Bereich", "Datenfeld", "Wert", "Muss / Kann"],
    ...BUILDING_SECTIONS.flatMap(s => s.fields.filter(d => !d.extra).map(d => [sectionName(s.id, s.title), d.label, cell(d, p.building[d.key]), d.req === "muss" ? "Muss" : "Kann"])),
  ];
}

/** "Zusatzfelder": fields the app records beyond Swiss-Inv. */
export function extrasTable(p: Project): (string | number)[][] {
  const extraB = BUILDING_FIELDS.filter(d => d.extra);
  const out: (string | number)[][] = [["Gebäude – Zusatzfeld", "Wert"], ...extraB.map(d => [d.label, cell(d, p.building[d.key])])];
  if (p.gwr?.source === "osm") out.push(["OSM Objekt", p.gwr.featureId], ["OSM Name", p.gwr.name ?? ""], ["OSM Koordinaten (WGS84)", p.gwr.lat && p.gwr.lon ? `${p.gwr.lat}; ${p.gwr.lon}` : ""]);
  else if (p.gwr) out.push(["GWR Feature", p.gwr.featureId], ["GWR Gebäudebezeichnung", p.gwr.name ?? ""], ["GWR Koordinaten (LV95)", p.gwr.e && p.gwr.n ? `${p.gwr.e}; ${p.gwr.n}` : ""]);
  out.push([], ["Bauteil ID", "Bauteiltyp", "IFC PredefinedType", "Raum-Tag", "Raum", "Geschoss", "Zielprojekt bekannt", "Zielprojekt", "Erfassungsmodus", "Offene Muss-Felder"]);
  for (const e of savedElements(p)) {
    const r = p.rooms.find(x => x.id === e.roomId);
    const miss = missingElementMuss(e.fields, e.photoIds.length).map(k => (k === "_dims" ? "Abmessungen" : k === "_photos" ? "Fotos (mind. 3)" : ELEMENT_FIELD[k].label));
    out.push([e.fields.bauteilId ?? "", RULE_BY_ID[e.fields.bauteiltyp ?? ""]?.de ?? e.fields.bauteiltyp ?? "", e.fields.ifcTyp ?? "", r?.tag ?? "", r?.name ?? "", floorLabel(r?.floor ?? 0), e.fields.zielprojektBekannt ?? "", e.fields.zielprojekt ?? "", e.timing.mode, miss.join(", ")]);
  }
  return out;
}

export function studyRows(projects: Project[]) {
  const out: Record<string, string | number>[] = [];
  for (const p of projects) for (const e of elementsOf(p.id)) {
    if (e.status !== "saved") continue;
    const r = p.rooms.find(x => x.id === e.roomId); const t = e.timing;
    out.push({
      element_id: e.fields.bauteilId || e.id, project: p.name, room_tag: r?.tag ?? "", bauteiltyp: e.fields.bauteiltyp ?? "", bezeichnung: e.fields.bezeichnung ?? "", ebkp: e.fields.ebkp ?? "", mode: t.mode,
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
  XLSX.utils.book_append_sheet(wb, sheet(extrasTable(p), [26, 26, 18, 18, 18, 10, 18, 22, 14, 40]), "Zusatzfelder");
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

/* ---------------------------------------------------------------- PDF report */

interface Pic { data: string; w: number; h: number }
async function pic(id?: string): Promise<Pic | null> {
  if (!id) return null;
  const b = await getPhoto(id); if (!b) return null;
  const data = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(b); });
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = data; });
  return { data, w: img.naturalWidth, h: img.naturalHeight };
}

const OLIVE: [number, number, number] = [68, 77, 38], SAGE: [number, number, number] = [165, 181, 146], INK: [number, number, number] = [27, 31, 16];

export async function exportPDF(p: Project) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const en = getLang() === "en";
  const T = (de: string, e: string) => (en ? e : de);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, M = 14;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastY = () => ((doc as any).lastAutoTable?.finalY ?? 40) as number;
  const b = p.building;
  const address = [[b.adresse, b.hausnummer].filter(Boolean).join(" "), [b.plz, b.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const date = new Date().toLocaleDateString(en ? "en-GB" : "de-CH");

  const header = (title: string, sub: string) => {
    doc.setFillColor(...OLIVE); doc.rect(0, 0, W, 22, "F");
    doc.setTextColor(241, 243, 236); doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.text(title, M, 10);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(sub, M, 16.5);
    doc.text(date, W - M, 16.5, { align: "right" });
    doc.setTextColor(...INK);
  };
  const footer = () => {
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(120);
      doc.text(`SwissInv-Beta · Swiss-Inv ${T("Datenstruktur", "data structure")} v1.0-2024 · ${p.name}`, M, 290);
      doc.text(`${i} / ${n}`, W - M, 290, { align: "right" });
    }
  };
  const kv = (rows: [string, string][], startY: number, x: number, width: number) => autoTable(doc, {
    startY, margin: { left: x, right: W - x - width }, tableWidth: width, theme: "plain",
    styles: { fontSize: 8, cellPadding: { top: 1.1, bottom: 1.1, left: 1.5, right: 1.5 }, textColor: INK, lineColor: [220, 224, 212], lineWidth: { bottom: 0.2 } },
    columnStyles: { 0: { cellWidth: width * 0.42, textColor: [99, 107, 82] } },
    body: rows.filter(r => r[1]),
  });
  /** A titled key-value block; skipped entirely when none of its rows has a value. Returns the y below it. */
  const block = (title: string, rows: [string, string][], y: number) => {
    const filledRows = rows.filter(r => r[1]);
    if (!filledRows.length) return y;
    if (y > 262) { doc.addPage(); header("Swiss Inv", p.name); y = 32; }
    sectionTitle(title, y); kv(filledRows, y + 2, M, W - 2 * M);
    return lastY() + 6;
  };
  const sectionTitle = (s: string, y: number) => { doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...OLIVE); doc.text(s, M, y); doc.setFont("helvetica", "normal"); doc.setTextColor(...INK); };

  /* ---- page 1: project header, image, building data ---- */
  header(T("SwissInv-Beta · Bauteilinventar", "SwissInv-Beta · Element inventory"), `${p.name}${address ? " · " + address : ""}`);
  const projectPic = await pic(p.imageId);
  let y = 30;
  if (projectPic) {
    const w = 80, h = Math.min(60, (w * projectPic.h) / projectPic.w);
    doc.addImage(projectPic.data, "JPEG", W - M - w, y, w, h);
  }
  const bf = (k: string) => BUILDING_FIELDS.find(f => f.key === k)!;
  const brow = (k: string): [string, string] => [label(bf(k)), shown(bf(k), b[k])];
  kv([brow("egrid"), brow("egid"), [T("Adresse", "Address"), address], brow("bauwerksart"), brow("bauweise"), brow("baujahr"), brow("gebaeudevolumen"),
    brow("geschossflaeche"), brow("vollgeschosse"), brow("jahrUmbau"), brow("erschliessung")], y, M, projectPic ? W - 2 * M - 86 : W - 2 * M);
  y = Math.max(lastY(), projectPic ? 30 + 60 : 0) + 7;
  sectionTitle(T("Kontakte", "Contacts"), y);
  kv([brow("agName"), brow("agEmail"), brow("agTelefon"), brow("exName"), brow("exEmail"), brow("exTelefon"), brow("architektin"), brow("ingenieurin")], y + 2, M, W - 2 * M);

  /* ---- overview ---- */
  const els = savedElements(p);
  y = lastY() + 8;
  sectionTitle(T(`Übersicht · ${els.length} Bauteile`, `Overview · ${els.length} elements`), y);
  const dims = (e: Element) => {
    const f = e.fields;
    if (f.hoehe || f.breite || f.tiefe) return `${f.hoehe || "–"} × ${f.breite || "–"} × ${f.tiefe || "–"} cm`;
    if (f.laenge) return `L ${f.laenge} cm`; if (f.durchmesser) return `Ø ${f.durchmesser} cm`; return "";
  };
  autoTable(doc, {
    startY: y + 2, theme: "striped", margin: { left: M, right: M },
    headStyles: { fillColor: SAGE, textColor: INK, fontSize: 7.5 }, styles: { fontSize: 7.5, cellPadding: 1.4 },
    head: [[T("Bauteil ID", "Element ID"), T("Bezeichnung", "Name"), "eBKP", T("Verortung", "Location"), T("Menge", "Qty"), T("H × B × T", "H × W × D"), T("Schadstoffe", "Pollutants"), T("Verfügbar ab", "Available from")]],
    body: els.map(e => [e.fields.bauteilId ?? "", e.fields.bezeichnung ?? "", e.fields.ebkp ?? "", e.fields.verortung ?? "", [e.fields.menge, e.fields.einheit].filter(Boolean).join(" "), dims(e), opt(e.fields.schadstoffbelastet ?? ""), toDate(e.fields.verfuegbarStart ?? "")]),
  });

  /* ---- one page per element ---- */
  const ef = (k: string) => ELEMENT_FIELD[k];
  const erow = (e: Element, k: string): [string, string] => [label(ef(k)), shown(ef(k), e.fields[k])];
  for (const e of els) {
    doc.addPage();
    header("Swiss Inv", `${p.name} · ${e.fields.verortung ?? ""}`);
    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text(`${e.fields.bauteilId ?? ""}  ${e.fields.bezeichnung ?? ""}`, M, 31);
    doc.setFont("helvetica", "normal");
    const leftW = 104, photoX = M + leftW + 6, photoW = W - M - photoX;
    const rt = RULE_BY_ID[e.fields.bauteiltyp ?? ""];
    kv([[label(ef("bauteiltyp")), rt ? (en ? rt.en : rt.de) : e.fields.bauteiltyp ?? ""], erow(e, "ebkp"), [label(ef("ebkpText")), (en ? ebkpName(e.fields.ebkp ?? "", "en") : e.fields.ebkpText) ?? ""], [label(ef("ifc")), [e.fields.ifc, e.fields.ifcTyp].filter(Boolean).join(" · ")], erow(e, "verortung"), erow(e, "bestandteilVon"),
      [label(ef("menge")), [e.fields.menge, e.fields.einheit].filter(Boolean).join(" ")], [T("Abmessungen", "Dimensions"), dims(e)], erow(e, "weitereDimension"),
      erow(e, "herstellerin"), erow(e, "materialien"), erow(e, "einbaujahr"), erow(e, "farbe"), erow(e, "gewicht")], 36, M, leftW);
    const leftEnd = lastY();
    // photos on the right: the first one large, the others below as thumbnails
    let py = 36;
    const big = await pic(e.photoIds[0]);
    if (big) { const h = Math.min(70, (photoW * big.h) / big.w); doc.addImage(big.data, "JPEG", photoX, py, photoW, h); py += h + 3; }
    const tw = (photoW - 3) / 2;
    let rowH = 0;
    for (let i = 1; i < Math.min(e.photoIds.length, 5); i++) {
      const ph = await pic(e.photoIds[i]); if (!ph) continue;
      const col = (i - 1) % 2, h = Math.min(34, (tw * ph.h) / ph.w);
      doc.addImage(ph.data, "JPEG", photoX + col * (tw + 3), py, tw, h);
      rowH = Math.max(rowH, h);
      if (col === 1) { py += rowH + 3; rowH = 0; }
    }
    py += rowH;
    y = Math.max(leftEnd, py) + 6;
    y = block(T("Potenzial", "Potential"), [erow(e, "schadstoffbelastet"), erow(e, "schadstoffverdacht"), erow(e, "zustand"), erow(e, "zustandText"), erow(e, "verbindung"),
      erow(e, "potenzial"), erow(e, "potenzialBegruendung"), erow(e, "zielprojekt")], y);
    y = block(T("Anhänge und Status", "Attachments and status"), [erow(e, "dokumente"), erow(e, "dokumenteText"), [T("Fotos", "Photos"), e.photoIds.map((_, i) => photoName(e, i)).join(", ")],
      erow(e, "verfuegbarStart"), erow(e, "verfuegbarEnde"), erow(e, "status")], y);
    const more = STUFE2_SECTIONS.flatMap(s => s.fields).filter(d => !["einbaujahr", "farbe", "gewicht", "verfuegbarStart", "verfuegbarEnde", "status"].includes(d.key));
    block(T("Bauteil Stufe 2", "Element level 2"), more.map(d => [label(d), shown(d, e.fields[d.key])] as [string, string]), y);
  }
  footer();
  download(baseName(p) + ".pdf", new Blob([doc.output("arraybuffer")], { type: "application/pdf" }));
}
