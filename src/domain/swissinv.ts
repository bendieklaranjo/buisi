/**
 * Swiss-Inv data structure (Cirkla, Version 1.0-2024) – the single source of truth for
 * what SwissInv-Beta asks for and exports. Field names, order, "Muss/Kann", value lists and
 * explanations follow the template "41203_Cirkla_Datenstruktur_Swiss_Inv_2024_v1.0.xlsx".
 *
 * Fields marked `extra: true` are NOT part of Swiss-Inv. They are app additions and are
 * exported to a separate "Zusatzfelder" sheet so the Swiss-Inv sheets stay conform.
 */

export type Req = "muss" | "kann";
export type Kind = "text" | "number" | "year" | "date" | "select" | "multi" | "textarea" | "email" | "tel";

export interface FieldDef {
  key: string;
  label: string; // official Swiss-Inv field name (German)
  en?: string; // short English hint
  req: Req;
  kind: Kind;
  options?: string[];
  unit?: string;
  info?: string; // "Erläuterungen" from the template
  placeholder?: string;
  extra?: boolean; // app field, not part of Swiss-Inv
}

export interface Section { id: string; title: string; fields: FieldDef[] }

/* ---------------------------------------------------------------- lists */

export const BAUWERKSART = ["I Wohnen MFH", "II Wohnen EFH", "III Verwaltung", "IV Schule", "V Verkauf", "VI Restaurant", "VII Versammlungslokal", "VIII Spital", "IX Industrie", "X Lager", "XI Sportbaute", "XII Hallenbad"];
export const BAUWEISE = ["schwer", "mittel", "leicht", "sehr leicht"];
export const HAUPTMATERIAL = ["Stahlbeton", "Mauerwerk", "Holz", "Stahl", "Mischbauweise", "Andere"];
export const UMBAU_INFO = ["Modernisierung", "Dachsanierung", "Fensteraustausch", "Fassadensanierung", "Erneuerung der technischen Installationen", "Innenraumsanierung", "Austausch der Beleuchtung", "Andere"];
export const ERSCHLIESSUNG = [
  "Gut zugänglich (Zugang für Lieferwagen / Personen- o/u Warenlift vorhanden)",
  "Schlecht zugänglich (Kein Zugang für Lieferwagen / Personen- o/u Warenlift nicht vorhanden)",
];
export const EREIGNISSE = [
  "Keine aussergewöhnliche Einzelereignisse in der Bauwerksgeschichte", "Erdbeben", "Überschwemmungen/Wasserschäden", "Brandschäden",
  "Schneelastschäden (Einsturz durch schwere Schneelast)", "Sturmschäden (z.B. durch Orkane oder Tornados)",
  "Blitzschlag (z.B. Brandschaden oder strukturelle Beeinträchtigung)", "Bodenabsenkungen (z.B. durch Erdrutsche oder Setzungen)",
  "Vandalismus oder Sabotage", "Schäden durch Baumfall", "Ungewöhnliche Materialfehler (z.B. Betonrisse oder Stahlermüdung)",
  "Schädlingsbefall (z.B. Termiten oder Pilzbefall)", "Vibrationsschäden (z.B. durch nahegelegene Bauprojekte oder Verkehr)", "Andere",
];
export const EINHEIT = ["Stk.", "m1", "m2", "m3", "kg", "To"];
export const SCHADSTOFFBELASTET = ["ja", "nein", "Verdacht", "nicht getestet"];
export const GEBRAUCHSZUSTAND = ["neuwertig", "leichte Gebrauchsspuren", "starke Gebrauchsspuren", "beschädigt"];
export const VERBINDUNG = [
  "Verbindung unbekannt", "Geschraubt", "Genagelt", "Geklebt", "Geschweisst", "Genietet", "Verzahnt (z.B. bei Holzverbindungen)",
  "Gefalzt (z.B. bei Blechverbindungen)", "Gesteckt (Stecksysteme)", "Gepresst (z.B. Pressverbindungen bei Metall)", "Geklemmt",
  "Geclipst (z.B. bei Kunststoffelementen)", "Gebördelt (z.B. an Rohrverbindungen)", "Verzapft (z.B. traditionelle Holzverbindungen)",
  "Gesteckt und geklemmt (Kombinationstechniken)", "Verlötet (z.B. bei Metallrohren)", "Verschweisst und verschraubt (Kombinationsverbindung)", "Andere",
];
export const POTENZIAL = ["gut", "mittel", "schlecht", "unbekannt"];
export const DOKUMENTE = ["Gebäudebeschreibung", "Skizzen", "Pläne", "technischen Datenblätter", "Punktwolke", "3D Modell", "Andere"];
export const SCHADSTOFFART = [
  "Asbest", "CO2 (Kohlendioxid)", "CP", "FCKW / HFCKW / FKW", "Feinstaub", "Formaldehyd", "HBCD", "Holzschutzmittel", "Invasive Neophyten",
  "Ionisierende Strahlung", "Kohlenwasserstoffe", "Künstliche Mineralfasern", "Legionellen", "Nikotin", "Nutzungsbedingte Belastungen",
  "PAK", "PFOS", "PCB", "Radon", "Schimmel", "Schlacke", "Schwermetalle", "VOC", "Andere",
];
export const EXPOSITION = [
  "Innenraum (komplett vor Witterungseinflüssen geschützt)", "Überdacht (geschützt, aber nicht vollständig innen)",
  "Teilweise überdacht (teilweise Schutz, jedoch begrenzt der Witterung ausgesetzt)", "Bewittert (direkt der Witterung ausgesetzt, z.B. Regen, Schnee, Wind)",
  "Erdberührt (Material in direktem Kontakt mit dem Erdreich)", "Unterwasser (dauerhaft oder zeitweise im Wasser)",
  "Spritzwasserbereich (gelegentlich Spritzwasser ausgesetzt, z.B. bei Fassaden in Bodennähe)", "Frost-/Tauwetterbereich (Material dem Wechsel von Frost und Tauwetter ausgesetzt)",
  "UV-Belastung (starkem Sonnenlicht und UV-Strahlung ausgesetzt)", "Chemikalieneinfluss (Exposition gegenüber aggressiven Chemikalien oder Umgebungen, z.B. Industriegebiete)",
  "Kondensationsbelastung (Material regelmässig Kondensation ausgesetzt, z.B. in Feuchträumen)", "Windbelastung (besonders starken Winden ausgesetzt, z.B. bei hohen Gebäuden oder exponierten Lagen)", "Andere",
];
export const DEMONTIERBARKEIT = ["gering", "mittel", "hoch", "unbekannt"];
export const STATUS = ["eingebaut", "zwischengelagert", "wiedereingebaut"];
export const LAGERUNG = [
  "Zerbrechlich (vorsichtiger Umgang erforderlich)", "Zu verpacken (Schutz durch Verpackung notwendig)", "Trockenlagerung (Lagerung in trockenen, feuchtigkeitsgeschützten Räumen)",
  "Vertikallagerung (Bauteil muss aufrecht gelagert werden)", "Auf Paletten zu lagern (Lagerung auf Paletten für stabilen Transport und Lagerung)", "Stapelfähig (Bauteil kann gestapelt werden)",
  "Nicht stapelfähig (kein Stapeln zulässig)", "Klimatisierte Lagerung (Lagerung bei kontrollierter Temperatur und Feuchtigkeit)",
  "Lagerung im Innenbereich (muss vor Witterung geschützt im Innenbereich gelagert werden)", "Verschlossen zu lagern (Lagerung in gesicherten oder verschlossenen Räumen)",
  "Lagerung mit Polsterung (zusätzlicher Schutz durch Polstermaterial erforderlich)", "Waagerechte Lagerung (Bauteil muss liegend gelagert werden)",
  "Feuchtigkeitsgeschützt verpacken (Schutzverpackung gegen Feuchtigkeit notwendig)", "Frostfreie Lagerung (Lagerung muss in frostfreien Bereichen erfolgen)",
  "Korrosionsgeschützt lagern (besondere Massnahmen zum Schutz vor Korrosion erforderlich)", "Schwerlasttransport erforderlich (spezialisierter Transport für schwere Bauteile)",
];

/** eBKP-H/T Elementgruppen (two-digit level) as listed in the template. */
export const EBKP: [string, string][] = [
  ["A01", "Grundstück, Baurecht"], ["B04", "Erschliessung durch Werkleitungen"],
  ["C01", "Fundament, Bodenplatte"], ["C02", "Wandkonstruktion"], ["C03", "Stützenkonstruktion"], ["C04", "Deckenkonstruktion, Dachkonstruktion"], ["C05", "Ergänzende Leistung zu Konstruktion"],
  ["D01", "Elektroanlagen"], ["D02", "Gebäudeautomation"], ["D03", "Sicherheitsanlage"], ["D04", "Technische Brandschutzanlage"], ["D05", "Wärmetechnische Anlage"], ["D06", "Kältetechnische Anlage"],
  ["D07", "Lufttechnische Anlage"], ["D08", "Wassertechnische Anlage"], ["D09", "Abwassertechnische Anlage"], ["D10", "Gastechnische Anlage"], ["D11", "Anlage für Spezialmedien"], ["D12", "Beförderungsanlage"],
  ["E01", "Äussere Wandbekleidung unter Terrain"], ["E02", "Äussere Wandbekleidung über Terrain"], ["E03", "Elemente in Aussenwand"],
  ["F01", "Dachhaut"], ["F02", "Element zu Dach"],
  ["G01", "Trennwand, Innentür, Innentor"], ["G02", "Bodenbelag"], ["G03", "Wandbekleidung"], ["G04", "Deckenbekleidung"], ["G05", "Einbauten, Schutzeinrichtung zu Ausbau"], ["G06", "Ergänzende Leistung zu Ausbau"],
  ["H01", "Produktionsanlage"], ["H02", "Laboranlage"], ["H03", "Grossküche"], ["H04", "Wäscherei- Reinigungsanlage"], ["H05", "Anlage für Gesundheit"], ["H06", "Anlage für Bildung, Kultur"],
  ["H07", "Sportanlage, Freizeitanlage"], ["H08", "Anlage für Erholung"], ["H09", "Weitere Nutzungsspezifische Anlage"],
  ["I01", "Umgebungsgestaltung"], ["I02", "Bauwerk in der Umgebung"], ["I03", "Grünfläche"], ["I04", "Hartfläche"], ["I05", "Technik Umgebung"], ["I06", "Austattung Umgebung"],
  ["J01", "Mobiliar"], ["J02", "Kleininventar"], ["J03", "Textilien"], ["J04", "Kunst am Bau"],
];
export const EBKP_TEXT = Object.fromEntries(EBKP);

/** eBKP main groups, shown first as "function in the building". */
export const EBKP_MAIN: [string, string, string][] = [
  ["C", "Konstruktion", "Tragstruktur: Wände, Stützen, Decken, Dach"],
  ["D", "Technik", "Elektro, Heizung, Lüftung, Sanitär, Lifte"],
  ["E", "Aussenwand", "Fassade, Fenster, Aussentüren"],
  ["F", "Bedachung", "Dachhaut, Dachelemente"],
  ["G", "Ausbau", "Innentüren, Trennwände, Böden, Bekleidungen, Einbauten"],
  ["H", "Nutzungsspezifisch", "Labor, Grossküche, Sport, …"],
  ["I", "Umgebung", "Aussenanlagen"],
  ["J", "Ausstattung", "Mobiliar, Kunst am Bau"],
  ["A", "Grundstück", ""],
  ["B", "Vorbereitung", "Werkleitungen"],
];

/* ------------------------------------------------- catalogue for suggestions */

export interface CatalogItem { name: string; ebkp: string; ifc: string; unit: string; outdoor?: boolean }

/** Common reusable building elements. Picking one suggests eBKP, IFC entity, unit and exposure. */
export const CATALOG: CatalogItem[] = [
  { name: "Innentür", ebkp: "G01", ifc: "IfcDoor", unit: "Stk." },
  { name: "Systemtrennwand", ebkp: "G01", ifc: "IfcWall", unit: "m2" },
  { name: "Glastrennwand", ebkp: "G01", ifc: "IfcWall", unit: "m2" },
  { name: "Fenster", ebkp: "E03", ifc: "IfcWindow", unit: "Stk.", outdoor: true },
  { name: "Aussentür", ebkp: "E03", ifc: "IfcDoor", unit: "Stk.", outdoor: true },
  { name: "Fassadenplatte", ebkp: "E02", ifc: "IfcPlate", unit: "m2", outdoor: true },
  { name: "Sonnenschutz / Storen", ebkp: "E03", ifc: "IfcShadingDevice", unit: "Stk.", outdoor: true },
  { name: "Dachziegel", ebkp: "F01", ifc: "IfcCovering", unit: "m2", outdoor: true },
  { name: "Dachfenster", ebkp: "F02", ifc: "IfcWindow", unit: "Stk.", outdoor: true },
  { name: "Heizkörper", ebkp: "D05", ifc: "IfcSpaceHeater", unit: "Stk." },
  { name: "Leuchte", ebkp: "D01", ifc: "IfcLightFixture", unit: "Stk." },
  { name: "Lüftungsgerät", ebkp: "D07", ifc: "IfcUnitaryEquipment", unit: "Stk." },
  { name: "Lavabo", ebkp: "D08", ifc: "IfcSanitaryTerminal", unit: "Stk." },
  { name: "WC", ebkp: "D08", ifc: "IfcSanitaryTerminal", unit: "Stk." },
  { name: "Armatur", ebkp: "D08", ifc: "IfcValve", unit: "Stk." },
  { name: "Parkett", ebkp: "G02", ifc: "IfcCovering", unit: "m2" },
  { name: "Bodenplatten", ebkp: "G02", ifc: "IfcCovering", unit: "m2" },
  { name: "Wandbekleidung", ebkp: "G03", ifc: "IfcCovering", unit: "m2" },
  { name: "Akustikdecke / Deckenplatten", ebkp: "G04", ifc: "IfcCovering", unit: "m2" },
  { name: "Einbauschrank", ebkp: "G05", ifc: "IfcFurniture", unit: "Stk." },
  { name: "Kücheneinrichtung", ebkp: "G05", ifc: "IfcFurniture", unit: "Stk." },
  { name: "Geländer / Handlauf", ebkp: "G05", ifc: "IfcRailing", unit: "m1" },
  { name: "Stahlträger", ebkp: "C04", ifc: "IfcBeam", unit: "Stk." },
  { name: "Holzbalken", ebkp: "C04", ifc: "IfcBeam", unit: "Stk." },
  { name: "Stütze", ebkp: "C03", ifc: "IfcColumn", unit: "Stk." },
  { name: "Mobiliar", ebkp: "J01", ifc: "IfcFurniture", unit: "Stk." },
];
export const CATALOG_BY_NAME = Object.fromEntries(CATALOG.map(c => [c.name, c]));

/* ------------------------------------------------------------- GEBÄUDE */

export const BUILDING_SECTIONS: Section[] = [
  {
    id: "verortung", title: "Verortung", fields: [
      { key: "egrid", label: "Katasternummer Grundstück", en: "Parcel number (EGRID)", req: "muss", kind: "text", placeholder: "CH579178879912", info: "Katasternummer (national), siehe map.geo.admin.ch, GWR: Gebäudestatus. z.B.: CH579178879912" },
      { key: "egid", label: "Gebäudenummer", en: "Building number (EGID)", req: "muss", kind: "text", placeholder: "302061460", info: "Gebäudenummer (national), siehe map.geo.admin.ch, GWR: Gebäudestatus. z.B.: 302061460" },
      { key: "adresse", label: "Adresse", en: "Street", req: "muss", kind: "text", info: "Strasse Quellobjekt, z.B.: Musterstrasse" },
      { key: "hausnummer", label: "Hausnummer", en: "No.", req: "muss", kind: "text", info: "Hausnummer Quellobjekt, z.B.: 12" },
      { key: "plz", label: "PLZ", en: "Postcode", req: "muss", kind: "text", info: "PLZ Quellobjekt, z.B.: 8008" },
      { key: "ort", label: "Ort", en: "Town", req: "muss", kind: "text", info: "Ortsname Quellobjekt, z.B.: Basel" },
      { key: "land", label: "Land", en: "Country", req: "kann", kind: "text", info: "Landsname Quellobjekt, z.B.: Schweiz" },
    ],
  },
  {
    id: "allgemein", title: "Allgemeine Gebäudedaten", fields: [
      { key: "bauwerksart", label: "Bauwerksart", en: "Building type – several possible for mixed use", req: "kann", kind: "multi", options: BAUWERKSART, info: "Gemäss Norm SIA 102. Bei gemischter Nutzung mehrere Arten wählen." },
      { key: "bauweise", label: "Bauweise", en: "Construction weight", req: "kann", kind: "select", options: BAUWEISE, info: "Gemäss Norm SIA 180 (Wärmespeicherfähigkeit): schwer z.B. Massivbau mit Betondecken, leicht z.B. Holz- oder Stahlleichtbau." },
      { key: "hauptmaterial", label: "Hauptmaterial", en: "Main structural material", req: "kann", kind: "select", options: HAUPTMATERIAL, extra: true, info: "Zusatzfeld (nicht Teil von Swiss-Inv): Hauptmaterial der Tragstruktur." },
      { key: "baujahr", label: "Baujahr", en: "Year built", req: "kann", kind: "year", info: "Jahreszahl vierstellig, z.B.: 1972" },
      { key: "gebaeudevolumen", label: "Gebäudevolumen", en: "Building volume", req: "kann", kind: "number", unit: "m3", info: "Gemäss Norm SIA 416, Ziffer 5: Das Gebäudevolumen GV wird aus der Geschossfläche GF und der dazugehörigen Höhe berechnet, ohne jegliche Zuschläge oder Abzüge." },
      { key: "geschossflaeche", label: "Geschossfläche", en: "Floor area", req: "kann", kind: "number", unit: "m2", info: "Gemäss Norm SIA 416: Die Geschossfläche GF ist die allseitig umschlossene und überdeckte Grundrissfläche der zugänglichen Geschosse einschliesslich der Konstruktionsflächen." },
      { key: "vollgeschosse", label: "Anzahl Vollgeschosse", en: "Full storeys", req: "kann", kind: "number", info: "Zahl zweistellig: 01, 02, … 99. Vollgeschosse sind alle Geschosse von Gebäuden ausser Unter-, Dach- und Attikageschosse." },
    ],
  },
  {
    id: "weitere", title: "Weitere Informationen", fields: [
      { key: "jahrUmbau", label: "Jahr der letzten Umbaumassnahmen", en: "Year of last renovation", req: "kann", kind: "year", info: "Jahreszahl vierstellig, z.B.: 2004" },
      { key: "umbauInfo", label: "Informationen über vergangene Umbaumassnahmen", en: "Past renovations", req: "kann", kind: "multi", options: UMBAU_INFO, info: "Art der Arbeit / Renovierung" },
      { key: "erschliessung", label: "Grobe Erschliessung", en: "Access for dismantling", req: "muss", kind: "select", options: ERSCHLIESSUNG, info: "Wichtig, um den Aufwand der Logistik bei der Demontage bzw. bei der Ausbringung der Elemente zu ermitteln." },
      { key: "ereignisse", label: "Informationen über aussergewöhnliche Einzelereignisse in der Bauwerksgeschichte", en: "Exceptional events", req: "kann", kind: "multi", options: EREIGNISSE },
      { key: "weitereInfo", label: "Weitere Informationen", en: "Further information", req: "kann", kind: "textarea", info: "Zusätzliche Beschreibung, falls wichtige Informationen für die Inventarisierung nicht in den vorhandenen Datenfeldern erfasst werden können." },
    ],
  },
  {
    id: "kontakte", title: "Kontakte", fields: [
      { key: "agName", label: "Name Auftraggeberin", en: "Client name", req: "muss", kind: "text", placeholder: "Peter Muster" },
      { key: "agEmail", label: "Email Auftraggeberin", en: "Client email", req: "muss", kind: "email", placeholder: "peter.muster@firma.ch" },
      { key: "agTelefon", label: "Telefon Auftraggeberin", en: "Client phone", req: "muss", kind: "tel", placeholder: "+41 41 536 11 19" },
      { key: "exName", label: "Name der Expertin, die das Audit durchgeführt hat", en: "Auditor name – remembered for new projects", req: "muss", kind: "text" },
      { key: "exEmail", label: "Email der Expertin, die das Audit durchgeführt hat", en: "Auditor email", req: "muss", kind: "email" },
      { key: "exTelefon", label: "Telefon der Person, die die Bestandsaufnahme durchgeführt hat", en: "Auditor phone", req: "muss", kind: "tel" },
      { key: "architektin", label: "Architektin Quellobjekt", en: "Original architect", req: "kann", kind: "text", info: "Ursprüngliche Architektin vom Baujahr: Vorname Name Firma, z.B.: Peter Muster Cirkla" },
      { key: "ingenieurin", label: "Ingenieurin Quellobjekt", en: "Original engineer", req: "kann", kind: "text", info: "Ursprüngliche Ingenieurin vom Baujahr: Vorname Name Firma" },
    ],
  },
];
export const BUILDING_FIELDS = BUILDING_SECTIONS.flatMap(s => s.fields);
/** Auditor fields are remembered on this device and pre-filled in new projects. */
export const EXPERT_KEYS = ["exName", "exEmail", "exTelefon"];

/** Values that are usually the same for all elements of a building; set once, copied into each element. */
export const PROJECT_DEFAULT_KEYS = ["verfuegbarStart", "verfuegbarEnde", "dokumente", "dokumenteText", "status"];

/* --------------------------------------------------------- BAUTEIL */

export const ELEMENT_STUFE1: Section[] = [
  {
    id: "identifikation", title: "Identifikation", fields: [
      { key: "bezeichnung", label: "Bezeichnung", en: "Name of the element", req: "muss", kind: "text", info: "Bezeichnung des Bauteils, z.B.: Innentür" },
      { key: "bauteilId", label: "Bauteil ID", en: "Element ID – created automatically", req: "muss", kind: "text", info: "Eindeutige Identifikationsnummer des Bauteils. Swiss-Inv definiert keine harmonisierte ID; die App vergibt Raum-Tag + laufende Nummer." },
      { key: "bestandteilVon", label: "Bestandteil von", en: "Part of (parent element ID)", req: "kann", kind: "text", info: "Bezug zu einem grösseren Teilsystem, z.B. Stahlfachwerk Dach; verwiesen wird auf die übergeordnete Bauteil ID." },
      { key: "ebkp", label: "eBKP-H/T Nummer", en: "eBKP element group", req: "muss", kind: "select", options: EBKP.map(e => e[0]), info: "eBKP-Elementgruppe, Detaillierungsgrad zweistellig, z.B.: C01, D02, G03" },
      { key: "ebkpText", label: "eBKP-H/T Bezeichnung", en: "filled automatically", req: "muss", kind: "text", info: "Textbezeichnung, automatisch mit der eingetragenen eBKP-Nummer verknüpft." },
      { key: "ifc", label: "IFC Entität", en: "IFC entity", req: "kann", kind: "text", placeholder: "IfcDoor", info: "ca. 760 Entitäten gemäss buildingSMART oder Verzeichnis Stadt Zürich, z.B. IfcStair" },
    ],
  },
  {
    id: "verortung", title: "Verortung", fields: [
      { key: "verortung", label: "Verortung im Gebäude", en: "Location – from the room", req: "muss", kind: "text", info: "Text um Einzelelemente zu verorten: Raum XY_Geschoss, z.B.: Raum 114_2.OG" },
      { key: "koordinaten", label: "Koordinaten", en: "Coordinates", req: "kann", kind: "text", info: "3D-Modellbezug (BIM-Schnittstelle), GIS, Zeichnungsviewer, 2D-Zeichnung mit Koordinatenbezug" },
    ],
  },
  {
    id: "menge", title: "Menge", fields: [
      { key: "menge", label: "Menge", en: "Quantity", req: "muss", kind: "number", placeholder: "30" },
      { key: "einheit", label: "Einheit", en: "Unit", req: "muss", kind: "select", options: EINHEIT },
    ],
  },
  {
    id: "abmessungen", title: "Abmessungen", fields: [
      { key: "hoehe", label: "Höhe", en: "Height", req: "muss", kind: "number", unit: "cm" },
      { key: "breite", label: "Breite", en: "Width", req: "muss", kind: "number", unit: "cm" },
      { key: "tiefe", label: "Tiefe", en: "Depth", req: "muss", kind: "number", unit: "cm" },
      { key: "laenge", label: "Länge", en: "Length – for linear elements", req: "muss", kind: "number", unit: "cm" },
      { key: "durchmesser", label: "Durchmesser", en: "Diameter – for round elements", req: "muss", kind: "number", unit: "cm" },
      { key: "weitereDimension", label: "weitere Dimension", en: "Other dimension", req: "kann", kind: "text" },
    ],
  },
  {
    id: "beschreibung", title: "Beschreibung", fields: [
      { key: "herstellerin", label: "Herstellerin", en: "Manufacturer – optional", req: "kann", kind: "text" },
      { key: "materialien", label: "Materialien", en: "Materials", req: "kann", kind: "text", info: "Materialien und Besonderheiten, gemäss Liste SIG éco21" },
    ],
  },
  {
    id: "potenzial", title: "Potenzial", fields: [
      { key: "schadstoffbelastet", label: "Schadstoffbelastet", en: "Contains pollutants", req: "muss", kind: "select", options: SCHADSTOFFBELASTET },
      { key: "schadstoffverdacht", label: "Offenkundiger Schadstoffverdacht", en: "Suspected pollutants", req: "kann", kind: "text", info: "Textverweis Schadstoffanalyse" },
      { key: "zustand", label: "Gebrauchszustand und Funktionstüchtigkeit", en: "Condition", req: "kann", kind: "select", options: GEBRAUCHSZUSTAND },
      { key: "zustandText", label: "Gebrauchszustand und Funktionstüchtigkeit (Text)", en: "Condition – description", req: "kann", kind: "textarea", info: "Freier Text mit Beschrieb der Schäden, Zustand und Funktionstüchtigkeit (z.B. bei technischen Apparaten)" },
      { key: "verbindung", label: "Verbindungsarten (grobe Einschätzung)", en: "Connection type", req: "muss", kind: "select", options: VERBINDUNG, info: "Verbindung des Bauteils mit dem Bauwerk. Keine Schätzungen und keine falschen Verbindungen eintragen – besser «Verbindung unbekannt»." },
      { key: "potenzial", label: "Potential für hochwertige Anschlussnutzung", en: "Reuse potential – will be suggested automatically in a later version", req: "kann", kind: "select", options: POTENZIAL },
      { key: "potenzialBegruendung", label: "Begründung der Einschätzung zum Potential für hochwertige Anschlussnutzung", en: "Reasoning", req: "kann", kind: "textarea" },
      { key: "zielprojektBekannt", label: "Zielprojekt bekannt", en: "Destination project known", req: "kann", kind: "select", options: ["ja", "nein"], extra: true, info: "Zusatzfeld (nicht Teil von Swiss-Inv)." },
      { key: "zielprojekt", label: "Zielprojekt", en: "Destination project", req: "kann", kind: "text", extra: true, info: "Zusatzfeld (nicht Teil von Swiss-Inv)." },
    ],
  },
  {
    id: "anhaenge", title: "Anhänge", fields: [
      { key: "dokumente", label: "Liste der vorhandenen Dokumente", en: "Available documents – default from the building", req: "muss", kind: "multi", options: DOKUMENTE },
      { key: "dokumenteText", label: "Liste der vorhandenen Dokumente (Text)", en: "Documents – names", req: "muss", kind: "text", placeholder: "z.B.: Schadstoffbericht" },
    ],
  },
];

export const ELEMENT_STUFE2: Section[] = [
  {
    id: "beschreibung2", title: "Beschreibung", fields: [
      { key: "einbaujahr", label: "Einbaujahr", en: "Year installed", req: "kann", kind: "text", info: "Jahreszahl oder Zeitraum, z.B.: 2004 oder 1990-1995" },
      { key: "produktionsjahr", label: "Produktionsjahr", en: "Year produced", req: "kann", kind: "text", info: "Jahreszahl oder Zeitraum, z.B.: 2004" },
      { key: "farbe", label: "Farbe", en: "Colour", req: "kann", kind: "text", info: "Mehrheitliche Oberflächenfarbe(n)" },
      { key: "gewicht", label: "Gewicht", en: "Weight", req: "kann", kind: "number", unit: "kg", info: "Schätzung für Transporte und Lagerung, z.B.: 12 kg" },
      { key: "weitereInfo2", label: "Weitere Informationen", en: "Further information", req: "kann", kind: "textarea" },
    ],
  },
  {
    id: "potenzial2", title: "Potenzial", fields: [
      { key: "schadstoffart", label: "Art von Schadstoff", en: "Pollutant type – only from a pollutant report", req: "kann", kind: "multi", options: SCHADSTOFFART, info: "Die Schadstoffe sind gemäss dem Schadstoffbericht auszuwählen und dürfen nicht anhand eigener Einschätzungen eingetragen werden." },
      { key: "exposition", label: "Exposition/Bewitterung", en: "Exposure", req: "kann", kind: "select", options: EXPOSITION, info: "Exposition von Bauteilen, die noch nicht demontiert wurden, oder von bereits demontierten und gelagerten Bauteilen." },
      { key: "demontierbarkeit", label: "Demontierbarkeit", en: "Ease of dismantling", req: "kann", kind: "select", options: DEMONTIERBARKEIT, info: "Selbsteinschätzung, mit welchem Aufwand sich das Bauteil demontieren lässt" },
      { key: "demontageVoraussetzungen", label: "Voraussetzungen für die Demontage", en: "Requirements for dismantling", req: "kann", kind: "textarea", info: "Was der Demonteur für die Demontage einplanen muss (Spezialwerkzeuge, Zugang, Transport)" },
      { key: "demontagePhase", label: "Phase der Demontage", en: "Dismantling phase", req: "kann", kind: "text", info: "z.B. statikrelevantes Bauteil, Treppenelement mit Absturzsicherung" },
    ],
  },
  {
    id: "status", title: "Status", fields: [
      { key: "verfuegbarStart", label: "Start Verfügbarkeit", en: "Available from – default from the building", req: "muss", kind: "date", info: "Startzeitpunkt der Verfügbarkeit, sofern noch im Quellobjekt eingebaut, z.B.: 01.03.2028" },
      { key: "verfuegbarEnde", label: "Ende Verfügbarkeit", en: "Available until", req: "muss", kind: "date", info: "Endzeitpunkt der Verfügbarkeit bzw. Start der Abbrucharbeiten, z.B.: 31.12.2035" },
      { key: "status", label: "Status", en: "Status", req: "kann", kind: "select", options: STATUS, info: "Aktueller Bauteilstatus" },
      { key: "lagerort", label: "Lagerort", en: "Storage location (LV95 coordinates)", req: "kann", kind: "text", info: "Falls die Bauteile anderswo gelagert sind, z.B.: E 2681474.519; N 1249160.809" },
      { key: "datumEinlagerung", label: "Datum Einlagerung", en: "Stored on", req: "kann", kind: "date" },
      { key: "datumAuslagerung", label: "Datum Auslagerung", en: "Removed from storage on", req: "kann", kind: "date" },
      { key: "lagerung", label: "Voraussetzungen für die Lagerung (Aufbereitung)", en: "Storage requirements", req: "kann", kind: "multi", options: LAGERUNG },
    ],
  },
  {
    id: "auswertung", title: "Auswertung", fields: [
      { key: "thg", label: "THG Einsparungen", en: "GHG savings", req: "kann", kind: "number", unit: "kg CO2 eq", info: "kg CO2 eq pro Einheit des Bauteils, gemäss KBOB-Liste, z.B.: 0.9" },
      { key: "materialEinsparung", label: "Eingesparte Material- / Rohstoffmenge", en: "Material saved", req: "kann", kind: "text" },
      { key: "weitereMessgroesse", label: "weitere Messgrösse", en: "Other metric", req: "kann", kind: "text" },
    ],
  },
];

export const ELEMENT_FIELDS = [...ELEMENT_STUFE1, ...ELEMENT_STUFE2].flatMap(s => s.fields);
export const ELEMENT_FIELD = Object.fromEntries(ELEMENT_FIELDS.map(f => [f.key, f]));
export const BUILDING_FIELD = Object.fromEntries(BUILDING_FIELDS.map(f => [f.key, f]));

/** "Liste der vorhandenen Fotos" (Muss): at least 3 photos per element, max 1.5 MB each. */
export const PHOTO_SLOTS = ["Frontalansicht", "Seitenansicht", "Detail Fixierung"];
export const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;

/* --------------------------------------------------------- completeness */

const DIM_KEYS = ["hoehe", "breite", "tiefe", "laenge", "durchmesser"];
const filled = (v: unknown) => String(v ?? "").trim() !== "";

/**
 * Missing Muss fields of an element. The five dimensions count as one group: it is complete
 * with height + width + depth, or with length, or with diameter (only the relevant ones apply).
 */
export function missingElementMuss(f: Record<string, string>, photoCount: number): string[] {
  const out: string[] = [];
  for (const d of ELEMENT_FIELDS) {
    if (d.req !== "muss" || DIM_KEYS.includes(d.key)) continue;
    if (d.key === "dokumenteText" && filled(f.dokumente)) continue; // one of the two document fields is enough
    if (d.key === "dokumente" && filled(f.dokumenteText)) continue;
    if (!filled(f[d.key])) out.push(d.label);
  }
  const dims = (filled(f.hoehe) && filled(f.breite) && filled(f.tiefe)) || filled(f.laenge) || filled(f.durchmesser);
  if (!dims) out.push("Abmessungen");
  if (photoCount < 3) out.push("Fotos (mind. 3)");
  return out;
}

export function missingBuildingMuss(b: Record<string, string>): string[] {
  return BUILDING_FIELDS.filter(d => d.req === "muss" && !filled(b[d.key])).map(d => d.label);
}

/** Multi-select values are stored as one string joined with "; ". */
export const splitMulti = (v?: string) => (v ? v.split("; ").filter(Boolean) : []);
export const joinMulti = (a: string[]) => a.join("; ");
