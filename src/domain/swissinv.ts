/**
 * Swiss-Inv data structure (Cirkla, Version 1.0-2024) – the single source of truth for
 * what SwissInv-Beta asks for and exports. Field names (German, `label`), order, "Muss/Kann",
 * value lists and explanations (`info`) follow the template
 * "41203_Cirkla_Datenstruktur_Swiss_Inv_2024_v1.0.xlsx". `labelEn` / `infoEn` / `hintEn` are
 * the English UI texts; stored values and export column names always stay German.
 *
 * Fields marked `extra: true` are NOT part of Swiss-Inv. They are app additions and are
 * exported to a separate "Zusatzfelder" sheet so the Swiss-Inv sheets stay conform.
 */

export type Req = "muss" | "kann";
export type Kind = "text" | "number" | "year" | "date" | "select" | "multi" | "textarea" | "email" | "tel";

export interface FieldDef {
  key: string;
  label: string; // official Swiss-Inv field name (German)
  labelEn: string;
  req: Req;
  kind: Kind;
  options?: string[];
  unit?: string;
  info?: string; // "Erläuterungen" from the template (German)
  infoEn?: string;
  hint?: string; // short app hint under the field
  hintEn?: string;
  placeholder?: string;
  extra?: boolean; // app field, not part of Swiss-Inv
}

export interface Section { id: string; title: string; titleEn: string; fields: FieldDef[] }

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
/** "Keine" is an app addition (not in the Swiss-Inv list) for elements without documents. */
export const DOKUMENTE_KEINE = "Keine";
export const DOKUMENTE = [DOKUMENTE_KEINE, "Gebäudebeschreibung", "Skizzen", "Pläne", "technischen Datenblätter", "Punktwolke", "3D Modell", "Andere"];
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

/** eBKP-H/T Elementgruppen (two-digit level) as listed in the template, with English names. */
export const EBKP: [string, string, string][] = [
  ["A01", "Grundstück, Baurecht", "Site, building rights"], ["B04", "Erschliessung durch Werkleitungen", "Utility connections"],
  ["C01", "Fundament, Bodenplatte", "Foundation, base slab"], ["C02", "Wandkonstruktion", "Wall structure"], ["C03", "Stützenkonstruktion", "Column structure"],
  ["C04", "Deckenkonstruktion, Dachkonstruktion", "Floor and roof structure"], ["C05", "Ergänzende Leistung zu Konstruktion", "Additional structural work"],
  ["D01", "Elektroanlagen", "Electrical systems"], ["D02", "Gebäudeautomation", "Building automation"], ["D03", "Sicherheitsanlage", "Security systems"],
  ["D04", "Technische Brandschutzanlage", "Fire protection systems"], ["D05", "Wärmetechnische Anlage", "Heating systems"], ["D06", "Kältetechnische Anlage", "Cooling systems"],
  ["D07", "Lufttechnische Anlage", "Ventilation systems"], ["D08", "Wassertechnische Anlage", "Water and sanitary systems"], ["D09", "Abwassertechnische Anlage", "Wastewater systems"],
  ["D10", "Gastechnische Anlage", "Gas systems"], ["D11", "Anlage für Spezialmedien", "Special media systems"], ["D12", "Beförderungsanlage", "Lifts and conveyors"],
  ["E01", "Äussere Wandbekleidung unter Terrain", "External wall cladding below ground"], ["E02", "Äussere Wandbekleidung über Terrain", "External wall cladding above ground"],
  ["E03", "Elemente in Aussenwand", "Elements in external walls"],
  ["F01", "Dachhaut", "Roof covering"], ["F02", "Element zu Dach", "Roof elements"],
  ["G01", "Trennwand, Innentür, Innentor", "Partitions, internal doors and gates"], ["G02", "Bodenbelag", "Floor finishes"], ["G03", "Wandbekleidung", "Wall finishes"],
  ["G04", "Deckenbekleidung", "Ceiling finishes"], ["G05", "Einbauten, Schutzeinrichtung zu Ausbau", "Built-in fittings, protective fixtures"], ["G06", "Ergänzende Leistung zu Ausbau", "Additional fit-out work"],
  ["H01", "Produktionsanlage", "Production plant"], ["H02", "Laboranlage", "Laboratory equipment"], ["H03", "Grossküche", "Commercial kitchen"],
  ["H04", "Wäscherei- Reinigungsanlage", "Laundry and cleaning equipment"], ["H05", "Anlage für Gesundheit", "Healthcare equipment"], ["H06", "Anlage für Bildung, Kultur", "Education and culture equipment"],
  ["H07", "Sportanlage, Freizeitanlage", "Sports and leisure equipment"], ["H08", "Anlage für Erholung", "Recreation equipment"], ["H09", "Weitere Nutzungsspezifische Anlage", "Other use-specific equipment"],
  ["I01", "Umgebungsgestaltung", "Landscaping"], ["I02", "Bauwerk in der Umgebung", "External structures"], ["I03", "Grünfläche", "Green areas"],
  ["I04", "Hartfläche", "Paved areas"], ["I05", "Technik Umgebung", "External services"], ["I06", "Austattung Umgebung", "External furnishings"],
  ["J01", "Mobiliar", "Furniture"], ["J02", "Kleininventar", "Small inventory"], ["J03", "Textilien", "Textiles"], ["J04", "Kunst am Bau", "Art in architecture"],
];
export const EBKP_TEXT: Record<string, string> = Object.fromEntries(EBKP.map(e => [e[0], e[1]]));
export const EBKP_TEXT_EN: Record<string, string> = Object.fromEntries(EBKP.map(e => [e[0], e[2]]));

/** eBKP main groups, shown first as "function in the building". */
export const EBKP_MAIN: { l: string; de: string; en: string }[] = [
  { l: "C", de: "Konstruktion", en: "Structure" },
  { l: "D", de: "Technik", en: "Services" },
  { l: "E", de: "Aussenwand", en: "External wall" },
  { l: "F", de: "Bedachung", en: "Roof" },
  { l: "G", de: "Ausbau", en: "Fit-out" },
  { l: "H", de: "Nutzungsspezifisch", en: "Use-specific" },
  { l: "J", de: "Ausstattung", en: "Furnishings" },
  { l: "I", de: "Umgebung", en: "Surroundings" },
];

/* Element types (generate eBKP + IFC) come from the CRB rule set – see crb.ts. */

/* ------------------------------------------------------------- GEBÄUDE */

export const BUILDING_SECTIONS: Section[] = [
  {
    id: "verortung", title: "Gebäude finden", titleEn: "Find the building", fields: [
      { key: "egrid", label: "Katasternummer Grundstück", labelEn: "Parcel number (EGRID)", req: "muss", kind: "text", placeholder: "CH579178879912",
        info: "Katasternummer (national), siehe map.geo.admin.ch, GWR: Gebäudestatus. z.B.: CH579178879912", infoEn: "National parcel number, see map.geo.admin.ch, GWR layer. e.g. CH579178879912" },
      { key: "egid", label: "Gebäudenummer", labelEn: "Building number (EGID)", req: "muss", kind: "text", placeholder: "302061460",
        info: "Gebäudenummer (national), siehe map.geo.admin.ch, GWR: Gebäudestatus. z.B.: 302061460", infoEn: "National building number, see map.geo.admin.ch, GWR layer. e.g. 302061460" },
      { key: "adresse", label: "Adresse", labelEn: "Street", req: "muss", kind: "text", info: "Strasse Quellobjekt, z.B.: Musterstrasse", infoEn: "Street of the source building, e.g. Musterstrasse" },
      { key: "hausnummer", label: "Hausnummer", labelEn: "House number", req: "muss", kind: "text", info: "Hausnummer Quellobjekt, z.B.: 12", infoEn: "House number of the source building, e.g. 12" },
      { key: "plz", label: "PLZ", labelEn: "Postcode", req: "muss", kind: "text", info: "PLZ Quellobjekt, z.B.: 8008", infoEn: "Postcode of the source building, e.g. 8008" },
      { key: "ort", label: "Ort", labelEn: "Town", req: "muss", kind: "text", info: "Ortsname Quellobjekt, z.B.: Basel", infoEn: "Town of the source building, e.g. Basel" },
      { key: "land", label: "Land", labelEn: "Country", req: "kann", kind: "text", info: "Landsname Quellobjekt, z.B.: Schweiz", infoEn: "Country of the source building, e.g. Schweiz" },
    ],
  },
  {
    id: "allgemein", title: "Allgemeine Gebäudedaten", titleEn: "General building data", fields: [
      { key: "bauwerksart", label: "Bauwerksart", labelEn: "Building type", req: "kann", kind: "multi", options: BAUWERKSART,
        hint: "Bei gemischter Nutzung mehrere wählen.", hintEn: "For mixed use, choose several.",
        info: "Gemäss Norm SIA 102.", infoEn: "According to SIA 102." },
      { key: "bauweise", label: "Bauweise", labelEn: "Construction weight", req: "kann", kind: "select", options: BAUWEISE,
        info: "Gemäss Norm SIA 180 (Wärmespeicherfähigkeit): schwer z.B. Massivbau mit Betondecken, leicht z.B. Holz- oder Stahlleichtbau.",
        infoEn: "According to SIA 180 (thermal mass): heavy e.g. solid construction with concrete slabs, light e.g. timber or light steel construction." },
      { key: "hauptmaterial", label: "Hauptmaterial", labelEn: "Main structural material", req: "kann", kind: "select", options: HAUPTMATERIAL, extra: true,
        info: "Zusatzfeld (nicht Teil von Swiss-Inv): Hauptmaterial der Tragstruktur.", infoEn: "App field (not part of Swiss-Inv): main material of the load-bearing structure." },
      { key: "baujahr", label: "Baujahr", labelEn: "Year built", req: "kann", kind: "year", info: "Jahreszahl vierstellig, z.B.: 1972", infoEn: "Four-digit year, e.g. 1972" },
      { key: "gebaeudevolumen", label: "Gebäudevolumen", labelEn: "Building volume", req: "kann", kind: "number", unit: "m3",
        info: "Gemäss Norm SIA 416, Ziffer 5: Das Gebäudevolumen GV wird aus der Geschossfläche GF und der dazugehörigen Höhe berechnet, ohne jegliche Zuschläge oder Abzüge.",
        infoEn: "According to SIA 416, section 5: calculated from the floor area and its height, without additions or deductions." },
      { key: "geschossflaeche", label: "Geschossfläche", labelEn: "Floor area", req: "kann", kind: "number", unit: "m2",
        info: "Gemäss Norm SIA 416: Die Geschossfläche GF ist die allseitig umschlossene und überdeckte Grundrissfläche der zugänglichen Geschosse einschliesslich der Konstruktionsflächen.",
        infoEn: "According to SIA 416: the enclosed and covered plan area of all accessible floors, including structural areas." },
      { key: "vollgeschosse", label: "Anzahl Vollgeschosse", labelEn: "Number of full storeys", req: "kann", kind: "number",
        info: "Zahl zweistellig: 01, 02, … 99. Vollgeschosse sind alle Geschosse von Gebäuden ausser Unter-, Dach- und Attikageschosse.",
        infoEn: "Two digits: 01, 02, … 99. Full storeys are all storeys except basements, attics and penthouse storeys." },
    ],
  },
  {
    id: "weitere", title: "Weitere Informationen", titleEn: "Further information", fields: [
      { key: "jahrUmbau", label: "Jahr der letzten Umbaumassnahmen", labelEn: "Year of last renovation", req: "kann", kind: "year", info: "Jahreszahl vierstellig, z.B.: 2004", infoEn: "Four-digit year, e.g. 2004" },
      { key: "umbauInfo", label: "Informationen über vergangene Umbaumassnahmen", labelEn: "Past renovations", req: "kann", kind: "multi", options: UMBAU_INFO, info: "Art der Arbeit / Renovierung", infoEn: "Type of work or renovation" },
      { key: "erschliessung", label: "Grobe Erschliessung", labelEn: "Access for dismantling", req: "muss", kind: "select", options: ERSCHLIESSUNG,
        info: "Wichtig, um den Aufwand der Logistik bei der Demontage bzw. bei der Ausbringung der Elemente zu ermitteln.",
        infoEn: "Needed to estimate the logistics effort for dismantling and removing the elements." },
      { key: "ereignisse", label: "Informationen über aussergewöhnliche Einzelereignisse in der Bauwerksgeschichte", labelEn: "Exceptional events in the building's history", req: "kann", kind: "multi", options: EREIGNISSE },
      { key: "weitereInfo", label: "Weitere Informationen", labelEn: "Further information", req: "kann", kind: "textarea",
        info: "Zusätzliche Beschreibung, falls wichtige Informationen für die Inventarisierung nicht in den vorhandenen Datenfeldern erfasst werden können.",
        infoEn: "Additional description if important information does not fit the other fields." },
    ],
  },
  {
    id: "kontakte", title: "Kontakte", titleEn: "Contacts", fields: [
      { key: "agName", label: "Name Auftraggeberin", labelEn: "Client name", req: "muss", kind: "text", placeholder: "Peter Muster" },
      { key: "agEmail", label: "Email Auftraggeberin", labelEn: "Client email", req: "muss", kind: "email", placeholder: "peter.muster@firma.ch" },
      { key: "agTelefon", label: "Telefon Auftraggeberin", labelEn: "Client phone", req: "muss", kind: "tel", placeholder: "+41 41 536 11 19" },
      { key: "exName", label: "Name der Expertin, die das Audit durchgeführt hat", labelEn: "Auditor name", req: "muss", kind: "text",
        hint: "Wird für neue Projekte auf diesem Gerät gespeichert.", hintEn: "Remembered for new projects on this device." },
      { key: "exEmail", label: "Email der Expertin, die das Audit durchgeführt hat", labelEn: "Auditor email", req: "muss", kind: "email" },
      { key: "exTelefon", label: "Telefon der Person, die die Bestandsaufnahme durchgeführt hat", labelEn: "Auditor phone", req: "muss", kind: "tel" },
      { key: "architektin", label: "Architektin Quellobjekt", labelEn: "Original architect", req: "kann", kind: "text",
        info: "Ursprüngliche Architektin vom Baujahr: Vorname Name Firma, z.B.: Peter Muster Cirkla", infoEn: "Original architect at the time of construction: first name, last name, firm" },
      { key: "ingenieurin", label: "Ingenieurin Quellobjekt", labelEn: "Original engineer", req: "kann", kind: "text",
        info: "Ursprüngliche Ingenieurin vom Baujahr: Vorname Name Firma", infoEn: "Original engineer at the time of construction: first name, last name, firm" },
    ],
  },
];
export const BUILDING_FIELDS = BUILDING_SECTIONS.flatMap(s => s.fields);
/** Auditor fields are remembered on this device and pre-filled in new projects. */
export const EXPERT_KEYS = ["exName", "exEmail", "exTelefon"];

/** Values that are usually the same for all elements of a building; set once, copied into each element. */
export const PROJECT_DEFAULT_KEYS = ["verfuegbarStart", "verfuegbarEnde", "status", "dokumente", "dokumenteText"];

/* --------------------------------------------------------- BAUTEIL */

const F = (f: FieldDef) => f;
export const ELEMENT_FIELD_LIST: FieldDef[] = [
  // Identifikation
  F({ key: "bauteiltyp", label: "Bauteiltyp", labelEn: "Element type", req: "kann", kind: "text", extra: true,
    hint: "Aus dem CRB-Regelsatz eBKP-H – IFC; erzeugt eBKP-Nummer, eBKP-Bezeichnung und IFC-Entität.", hintEn: "From the CRB eBKP-H – IFC rule set; generates the eBKP number, eBKP name and IFC entity.",
    info: "Zusatzfeld (nicht Teil von Swiss-Inv): standardisiert eBKP und IFC.", infoEn: "App field (not part of Swiss-Inv): standardises eBKP and IFC." }),
  F({ key: "ifcTyp", label: "IFC PredefinedType", labelEn: "IFC predefined type", req: "kann", kind: "text", extra: true,
    info: "Zusatzfeld: vordefinierter Typ der IFC-Entität gemäss CRB-Regelsatz, z.B. DOOR.", infoEn: "App field: predefined type of the IFC entity from the CRB rule set, e.g. DOOR." }),
  F({ key: "bezeichnung", label: "Bezeichnung", labelEn: "Name", req: "muss", kind: "text",
    info: "Bezeichnung des Bauteils, z.B.: Innentür", infoEn: "Name of the element, e.g. internal door" }),
  F({ key: "bauteilId", label: "Bauteil ID", labelEn: "Element ID", req: "muss", kind: "text",
    hint: "Automatisch: Raum-Tag + laufende Nummer.", hintEn: "Automatic: room tag + running number.",
    info: "Eindeutige Identifikationsnummer des Bauteils. Swiss-Inv definiert keine harmonisierte ID.", infoEn: "Unique identifier of the element. Swiss-Inv does not define a harmonised ID." }),
  F({ key: "bestandteilVon", label: "Bestandteil von", labelEn: "Part of (parent element ID)", req: "kann", kind: "text",
    info: "Bezug zu einem grösseren Teilsystem, z.B. Stahlfachwerk Dach; verwiesen wird auf die übergeordnete Bauteil ID.",
    infoEn: "Reference to a larger system, e.g. a steel roof truss; enter the parent element ID." }),
  F({ key: "ebkp", label: "eBKP-H/T Nummer", labelEn: "eBKP number", req: "muss", kind: "select", options: EBKP.map(e => e[0]),
    info: "eBKP-H-Element, vollständige Nummer aus dem gewählten Bauteiltyp (CRB-Regelsatz), z.B. G01.05. Ohne Bauteiltyp: Elementgruppe, z.B. C01, D02, G03.",
    infoEn: "eBKP-H element, full code from the chosen element type (CRB rule set), e.g. G01.05. Without a type: element group, e.g. C01, D02, G03." }),
  F({ key: "ebkpText", label: "eBKP-H/T Bezeichnung", labelEn: "eBKP name", req: "muss", kind: "text",
    info: "Textbezeichnung, automatisch mit der eingetragenen eBKP-Nummer verknüpft, z.B. G01.05 Innentür.", infoEn: "Name linked automatically to the eBKP number, e.g. G01.05 internal door." }),
  F({ key: "ifc", label: "IFC Entität", labelEn: "IFC entity", req: "kann", kind: "text", placeholder: "IfcDoor",
    info: "ca. 760 Entitäten gemäss buildingSMART oder Verzeichnis Stadt Zürich, z.B. IfcStair", infoEn: "About 760 entities from buildingSMART or the City of Zurich list, e.g. IfcStair" }),
  // Verortung (filled automatically, not shown)
  F({ key: "verortung", label: "Verortung im Gebäude", labelEn: "Location in the building", req: "muss", kind: "text",
    info: "Text um Einzelelemente zu verorten: Raum XY_Geschoss, z.B.: Raum 114_2.OG", infoEn: "Room and floor, e.g. Raum 114_2.OG" }),
  F({ key: "koordinaten", label: "Koordinaten", labelEn: "Coordinates", req: "kann", kind: "text" }),
  // Menge + Abmessungen
  F({ key: "menge", label: "Menge", labelEn: "Quantity", req: "muss", kind: "number", placeholder: "30" }),
  F({ key: "einheit", label: "Einheit", labelEn: "Unit", req: "muss", kind: "select", options: EINHEIT }),
  F({ key: "hoehe", label: "Höhe", labelEn: "Height", req: "muss", kind: "number", unit: "cm" }),
  F({ key: "breite", label: "Breite", labelEn: "Width", req: "muss", kind: "number", unit: "cm" }),
  F({ key: "tiefe", label: "Tiefe", labelEn: "Depth", req: "muss", kind: "number", unit: "cm" }),
  F({ key: "laenge", label: "Länge", labelEn: "Length", req: "muss", kind: "number", unit: "cm" }),
  F({ key: "durchmesser", label: "Durchmesser", labelEn: "Diameter", req: "muss", kind: "number", unit: "cm" }),
  F({ key: "weitereDimension", label: "weitere Dimension", labelEn: "Other dimension", req: "kann", kind: "text" }),
  // Beschreibung
  F({ key: "herstellerin", label: "Herstellerin", labelEn: "Manufacturer", req: "kann", kind: "text" }),
  F({ key: "materialien", label: "Materialien", labelEn: "Materials", req: "kann", kind: "text",
    info: "Materialien und Besonderheiten, gemäss Liste SIG éco21", infoEn: "Materials and particularities, following the SIG éco21 list" }),
  // Potenzial
  F({ key: "schadstoffbelastet", label: "Schadstoffbelastet", labelEn: "Contains pollutants", req: "muss", kind: "select", options: SCHADSTOFFBELASTET }),
  F({ key: "schadstoffverdacht", label: "Offenkundiger Schadstoffverdacht", labelEn: "Obvious suspected pollutants", req: "kann", kind: "text",
    info: "Textverweis Schadstoffanalyse", infoEn: "Reference to the pollutant analysis" }),
  F({ key: "zustand", label: "Gebrauchszustand und Funktionstüchtigkeit", labelEn: "Condition", req: "kann", kind: "select", options: GEBRAUCHSZUSTAND }),
  F({ key: "zustandText", label: "Gebrauchszustand und Funktionstüchtigkeit (Text)", labelEn: "Condition – description", req: "kann", kind: "textarea",
    info: "Freier Text mit Beschrieb der Schäden, Zustand und Funktionstüchtigkeit (z.B. bei technischen Apparaten)", infoEn: "Free text describing damage, condition and function (e.g. for technical equipment)" }),
  F({ key: "verbindung", label: "Verbindungsarten (grobe Einschätzung)", labelEn: "Connection type (rough estimate)", req: "muss", kind: "select", options: VERBINDUNG,
    info: "Verbindung des Bauteils mit dem Bauwerk. Keine Schätzungen und keine falschen Verbindungen eintragen – besser «Verbindung unbekannt».",
    infoEn: "How the element is fixed to the building. Do not guess – choose “unknown” if unclear." }),
  F({ key: "potenzial", label: "Potential für hochwertige Anschlussnutzung", labelEn: "Potential for high-value reuse", req: "kann", kind: "select", options: POTENZIAL,
    hint: "Wird in einer späteren Version automatisch vorgeschlagen.", hintEn: "A later version will suggest this automatically." }),
  F({ key: "potenzialBegruendung", label: "Begründung der Einschätzung zum Potential für hochwertige Anschlussnutzung", labelEn: "Reasoning for the reuse potential", req: "kann", kind: "textarea" }),
  F({ key: "zielprojektBekannt", label: "Zielprojekt bekannt", labelEn: "Destination project known", req: "kann", kind: "select", options: ["ja", "nein"], extra: true }),
  F({ key: "zielprojekt", label: "Zielprojekt", labelEn: "Destination project", req: "kann", kind: "text", extra: true }),
  // Anhänge
  F({ key: "dokumente", label: "Liste der vorhandenen Dokumente", labelEn: "Available documents", req: "muss", kind: "multi", options: DOKUMENTE }),
  F({ key: "dokumenteText", label: "Liste der vorhandenen Dokumente (Text)", labelEn: "Document names", req: "muss", kind: "text", placeholder: "z.B.: Schadstoffbericht" }),
  // Stufe 2
  F({ key: "einbaujahr", label: "Einbaujahr", labelEn: "Year installed", req: "kann", kind: "text", info: "Jahreszahl oder Zeitraum, z.B.: 2004 oder 1990-1995", infoEn: "Year or period, e.g. 2004 or 1990-1995" }),
  F({ key: "produktionsjahr", label: "Produktionsjahr", labelEn: "Year produced", req: "kann", kind: "text", info: "Jahreszahl oder Zeitraum, z.B.: 2004", infoEn: "Year or period, e.g. 2004" }),
  F({ key: "farbe", label: "Farbe", labelEn: "Colour", req: "kann", kind: "text", info: "Mehrheitliche Oberflächenfarbe(n)", infoEn: "Main surface colour(s)" }),
  F({ key: "gewicht", label: "Gewicht", labelEn: "Weight", req: "kann", kind: "number", unit: "kg", info: "Schätzung für Transporte und Lagerung, z.B.: 12 kg", infoEn: "Estimate for transport and storage, e.g. 12 kg" }),
  F({ key: "weitereInfo2", label: "Weitere Informationen", labelEn: "Further information", req: "kann", kind: "textarea" }),
  F({ key: "schadstoffart", label: "Art von Schadstoff", labelEn: "Pollutant type", req: "kann", kind: "multi", options: SCHADSTOFFART,
    info: "Die Schadstoffe sind gemäss dem Schadstoffbericht auszuwählen und dürfen nicht anhand eigener Einschätzungen eingetragen werden.",
    infoEn: "Choose pollutants only according to the pollutant report, never from your own estimate." }),
  F({ key: "exposition", label: "Exposition/Bewitterung", labelEn: "Exposure", req: "kann", kind: "select", options: EXPOSITION,
    info: "Exposition von Bauteilen, die noch nicht demontiert wurden, oder von bereits demontierten und gelagerten Bauteilen.", infoEn: "Exposure of the element in place or in storage." }),
  F({ key: "demontierbarkeit", label: "Demontierbarkeit", labelEn: "Ease of dismantling", req: "kann", kind: "select", options: DEMONTIERBARKEIT,
    info: "Selbsteinschätzung, mit welchem Aufwand sich das Bauteil demontieren lässt", infoEn: "Your estimate of the effort to dismantle the element" }),
  F({ key: "demontageVoraussetzungen", label: "Voraussetzungen für die Demontage", labelEn: "Requirements for dismantling", req: "kann", kind: "textarea",
    info: "Was der Demonteur für die Demontage einplanen muss (Spezialwerkzeuge, Zugang, Transport)", infoEn: "What the dismantler must plan for (special tools, access, transport)" }),
  F({ key: "demontagePhase", label: "Phase der Demontage", labelEn: "Dismantling phase", req: "kann", kind: "text",
    info: "z.B. statikrelevantes Bauteil, Treppenelement mit Absturzsicherung", infoEn: "e.g. structural element, stair element with fall protection" }),
  F({ key: "verfuegbarStart", label: "Start Verfügbarkeit", labelEn: "Available from", req: "muss", kind: "date",
    info: "Startzeitpunkt der Verfügbarkeit, sofern noch im Quellobjekt eingebaut, z.B.: 01.03.2028", infoEn: "Date from which the element is available, if still installed, e.g. 01.03.2028" }),
  F({ key: "verfuegbarEnde", label: "Ende Verfügbarkeit", labelEn: "Available until", req: "muss", kind: "date",
    info: "Endzeitpunkt der Verfügbarkeit bzw. Start der Abbrucharbeiten, z.B.: 31.12.2035", infoEn: "End of availability, or start of demolition, e.g. 31.12.2035" }),
  F({ key: "status", label: "Status", labelEn: "Status", req: "kann", kind: "select", options: STATUS, info: "Aktueller Bauteilstatus", infoEn: "Current status of the element" }),
  F({ key: "lagerort", label: "Lagerort", labelEn: "Storage location (LV95)", req: "kann", kind: "text",
    info: "Falls die Bauteile anderswo gelagert sind, z.B.: E 2681474.519; N 1249160.809", infoEn: "If the elements are stored elsewhere, e.g. E 2681474.519; N 1249160.809" }),
  F({ key: "datumEinlagerung", label: "Datum Einlagerung", labelEn: "Date stored", req: "kann", kind: "date" }),
  F({ key: "datumAuslagerung", label: "Datum Auslagerung", labelEn: "Date removed from storage", req: "kann", kind: "date" }),
  F({ key: "lagerung", label: "Voraussetzungen für die Lagerung (Aufbereitung)", labelEn: "Storage requirements", req: "kann", kind: "multi", options: LAGERUNG }),
  F({ key: "thg", label: "THG Einsparungen", labelEn: "GHG savings", req: "kann", kind: "number", unit: "kg CO2 eq",
    info: "kg CO2 eq pro Einheit des Bauteils, gemäss KBOB-Liste, z.B.: 0.9", infoEn: "kg CO2 eq per unit, according to the KBOB list, e.g. 0.9" }),
  F({ key: "materialEinsparung", label: "Eingesparte Material- / Rohstoffmenge", labelEn: "Material saved", req: "kann", kind: "text" }),
  F({ key: "weitereMessgroesse", label: "weitere Messgrösse", labelEn: "Other metric", req: "kann", kind: "text" }),
];
export const ELEMENT_FIELD: Record<string, FieldDef> = Object.fromEntries(ELEMENT_FIELD_LIST.map(f => [f.key, f]));

const pick = (keys: string[]) => keys.map(k => ELEMENT_FIELD[k]);

/** Export order = template order. Stufe 1 then photos, then Stufe 2. */
export const STUFE1_KEYS = ["bezeichnung", "bauteilId", "bestandteilVon", "ebkp", "ebkpText", "ifc", "verortung", "koordinaten", "menge", "einheit",
  "hoehe", "breite", "tiefe", "laenge", "durchmesser", "weitereDimension", "herstellerin", "materialien", "schadstoffbelastet", "schadstoffverdacht",
  "zustand", "zustandText", "verbindung", "potenzial", "potenzialBegruendung", "zielprojektBekannt", "zielprojekt", "dokumente", "dokumenteText"];
export const STUFE2_SECTIONS: Section[] = [
  { id: "beschreibung2", title: "Beschreibung", titleEn: "Description", fields: pick(["einbaujahr", "produktionsjahr", "farbe", "gewicht", "weitereInfo2"]) },
  { id: "potenzial2", title: "Potenzial", titleEn: "Potential", fields: pick(["schadstoffart", "exposition", "demontierbarkeit", "demontageVoraussetzungen", "demontagePhase"]) },
  { id: "status", title: "Status", titleEn: "Status", fields: pick(["verfuegbarStart", "verfuegbarEnde", "status", "lagerort", "datumEinlagerung", "datumAuslagerung", "lagerung"]) },
  { id: "auswertung", title: "Auswertung", titleEn: "Evaluation", fields: pick(["thg", "materialEinsparung", "weitereMessgroesse"]) },
];
export const STUFE2_KEYS = STUFE2_SECTIONS.flatMap(s => s.fields.map(f => f.key));

/** "Liste der vorhandenen Fotos" (Muss): at least 3 photos per element, max 1.5 MB each. */
export const PHOTO_SLOTS = [{ de: "Frontalansicht", en: "Front view" }, { de: "Seitenansicht", en: "Side view" }, { de: "Detail Fixierung", en: "Fixing detail" }];
export const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;

/* --------------------------------------------------------- completeness */

const DIM_KEYS = ["hoehe", "breite", "tiefe", "laenge", "durchmesser"];
const filled = (v: unknown) => String(v ?? "").trim() !== "";

/**
 * Missing Muss fields of an element (keys; "_dims" and "_photos" for the groups). The five
 * dimensions count as one group: complete with height + width + depth, or length, or diameter.
 */
export function missingElementMuss(f: Record<string, string>, photoCount: number): string[] {
  const out: string[] = [];
  for (const d of ELEMENT_FIELD_LIST) {
    if (d.req !== "muss" || DIM_KEYS.includes(d.key)) continue;
    if (d.key === "dokumenteText" && filled(f.dokumente)) continue; // one of the two document fields is enough
    if (d.key === "dokumente" && filled(f.dokumenteText)) continue;
    if (!filled(f[d.key])) out.push(d.key);
  }
  const dims = (filled(f.hoehe) && filled(f.breite) && filled(f.tiefe)) || filled(f.laenge) || filled(f.durchmesser);
  if (!dims) out.push("_dims");
  if (photoCount < 3) out.push("_photos");
  return out;
}

export function missingBuildingMuss(b: Record<string, string>): string[] {
  return BUILDING_FIELDS.filter(d => d.req === "muss" && !filled(b[d.key])).map(d => d.key);
}

/** Multi-select values are stored as one string joined with "; ". */
export const splitMulti = (v?: string) => (v ? v.split("; ").filter(Boolean) : []);
export const joinMulti = (a: string[]) => a.join("; ");
