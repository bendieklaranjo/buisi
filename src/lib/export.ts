/** Exports: inventory (CSV, Excel, PDF) and time-study data. Heavy libraries load on demand. */
import { MUSS_KEYS, floorLabel } from "../domain/fields";
import type { Project } from "../domain/types";
import { elementsOf } from "./store";

export function inventoryRows(p: Project) {
  return elementsOf(p.id).filter(e => e.status === "saved").map(e => {
    const r = p.rooms.find(x => x.id === e.roomId); const f = e.fields;
    return {
      "Element ID": e.id, "Floor": floorLabel(r?.floor ?? 0), "Room tag": r?.tag ?? "", "Room name": r?.name ?? "", "Main use": r?.useLabel ?? "",
      "Element type": f.elementType ?? "", "e-BKP-H": f.ebkp ?? "", "Material": f.material ?? "", "Funktion": f.funktion ?? "",
      "Menge": f.menge ?? "", "Einheit": f.einheit ?? "", "Höhe (mm)": f.hoehe ?? "", "Breite (mm)": f.breite ?? "", "Länge (mm)": f.laenge ?? "",
      "Hersteller": f.hersteller ?? "", "Verbindungsarten": f.verbindung ?? "", "Gebrauchszustand – visuell": f.zustand ?? "",
      "Schadstoffverdacht": f.schadstoff ?? "", "Reusability": f.reuse ?? "", "Weitere Informationen": f.weitere ?? "", "Photos": e.photoIds.length,
    };
  });
}

export function studyRows(projects: Project[]) {
  const out: Record<string, string | number>[] = [];
  for (const p of projects) for (const e of elementsOf(p.id)) {
    if (e.status !== "saved") continue;
    const r = p.rooms.find(x => x.id === e.roomId); const t = e.timing;
    out.push({
      element_id: e.id, project: p.name, room_tag: r?.tag ?? "", element_type: e.fields.elementType ?? "", mode: t.mode,
      created_at: new Date(e.createdAt).toISOString(), saved_at: e.savedAt ? new Date(e.savedAt).toISOString() : "",
      active_s_first_save: +((t.firstSavedMs ?? t.activeMs) / 1000).toFixed(1), active_s_total: +(t.activeMs / 1000).toFixed(1),
      from_ai_detection: t.fromDetection ? 1 : 0, segmentation_taps: t.segTaps, ai_fill_used: t.aiUsed ? 1 : 0, ai_fill_count: t.aiCount,
      ai_wait_s: +(t.aiMs / 1000).toFixed(1), ai_fields_filled: t.aiFieldsFilled ?? 0, ai_fields_kept: t.aiFieldsKept ?? 0,
      human_corrections: t.corrections ?? 0, muss_filled: t.mussFilled ?? "", muss_total: MUSS_KEYS.length, photos: e.photoIds.length,
    });
  }
  return out;
}

export function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const q = (v: unknown) => { const s = String(v ?? ""); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return "﻿" + [cols.map(q).join(","), ...rows.map(r => cols.map(k => q(r[k])).join(","))].join("\r\n");
}

export function download(filename: string, data: Blob) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const slug = (s: string) => (s || "project").normalize("NFKD").replace(/[^\w]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "project";
const stamp = () => new Date().toISOString().slice(0, 10);
export const baseName = (p: Project) => `BUISI_${slug(p.name)}_${stamp()}`;

export function exportCSV(p: Project) {
  download(baseName(p) + ".csv", new Blob([toCSV(inventoryRows(p))], { type: "text/csv" }));
}

export function exportStudyCSV(projects: Project[]) {
  download(`BUISI_time_study_${stamp()}.csv`, new Blob([toCSV(studyRows(projects))], { type: "text/csv" }));
}

export async function exportXLSX(p: Project) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inventoryRows(p)), "Inventory");
  const i = p.info;
  const info: [string, unknown][] = [["Project", p.name], ["Client", p.client], ["Project type", p.type], ["Bauwerkskategorie", i.kat], ["Ort", i.ort],
    ["Bauweise/-art", i.bauweise], ["Baujahr", i.baujahr], ["Gebäudeklasse", i.gk], ["BRI (m³)", i.bri], ["BGF (m²)", i.bgf], ["Nutzungsart", i.nutzung],
    ["Umbaumaßnahmen", i.umbau], ["Floors above ground", i.floorsAbove], ["Basement floors", i.basements]];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Field", "Value"], ...info.map(([k, v]) => [k, v ?? ""])]), "Building");
  const sr = studyRows([p]);
  if (sr.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sr), "Time study");
  const arr = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  download(baseName(p) + ".xlsx", new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
}

export async function exportPDF(p: Project) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const i = p.info;
  doc.setFontSize(20); doc.text("BUISI building inventory", 14, 18);
  doc.setFontSize(11);
  doc.text(`${p.name}${p.client ? " · " + p.client : ""} · ${i.ort || ""}`, 14, 26);
  doc.text(`Exported ${new Date().toLocaleString()}`, 14, 32);
  autoTable(doc, {
    startY: 38, theme: "grid", headStyles: { fillColor: [67, 75, 38] }, styles: { fontSize: 9 },
    head: [["Bauwerkskategorie", "Bauweise", "Baujahr", "Gebäudeklasse", "BRI m³", "BGF m²", "Nutzungsart", "Floors"]],
    body: [[i.kat || "", i.bauweise || "", i.baujahr || "", i.gk || "", i.bri || "", i.bgf || "", i.nutzung || "", `${i.floorsAbove || ""} + ${i.basements || 0} UG`]],
  });
  const cols = ["Room tag", "Element type", "e-BKP-H", "Material", "Funktion", "Menge", "Einheit", "Höhe (mm)", "Breite (mm)", "Länge (mm)", "Gebrauchszustand – visuell", "Schadstoffverdacht", "Reusability"] as const;
  const rows = inventoryRows(p);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastY = (doc as any).lastAutoTable?.finalY ?? 50;
  autoTable(doc, {
    startY: lastY + 8, theme: "striped", headStyles: { fillColor: [127, 142, 105] }, styles: { fontSize: 8, cellPadding: 1.6 },
    head: [cols as unknown as string[]], body: rows.map(r => cols.map(k => String(r[k] ?? ""))),
  });
  download(baseName(p) + ".pdf", new Blob([doc.output("arraybuffer")], { type: "application/pdf" }));
}
