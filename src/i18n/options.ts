/** English display texts for Swiss-Inv option values. Stored values stay German. */
export const OPTION_EN: Record<string, string> = {
  // Bauwerksart (SIA 102)
  "I Wohnen MFH": "I Residential, multi-family", "II Wohnen EFH": "II Residential, single-family", "III Verwaltung": "III Administration",
  "IV Schule": "IV School", "V Verkauf": "V Retail", "VI Restaurant": "VI Restaurant", "VII Versammlungslokal": "VII Assembly building",
  "VIII Spital": "VIII Hospital", "IX Industrie": "IX Industry", "X Lager": "X Storage", "XI Sportbaute": "XI Sports building", "XII Hallenbad": "XII Indoor pool",
  // Bauweise (SIA 180)
  "schwer": "heavy", "mittel": "medium", "leicht": "light", "sehr leicht": "very light",
  // Hauptmaterial
  "Stahlbeton": "Reinforced concrete", "Mauerwerk": "Masonry", "Holz": "Timber", "Stahl": "Steel", "Mischbauweise": "Mixed construction", "Andere": "Other",
  // Umbau
  "Modernisierung": "Modernisation", "Dachsanierung": "Roof renovation", "Fensteraustausch": "Window replacement", "Fassadensanierung": "Facade renovation",
  "Erneuerung der technischen Installationen": "Renewal of building services", "Innenraumsanierung": "Interior renovation", "Austausch der Beleuchtung": "Lighting replacement",
  // Erschliessung
  "Gut zugänglich (Zugang für Lieferwagen / Personen- o/u Warenlift vorhanden)": "Good access (van access / passenger or goods lift available)",
  "Schlecht zugänglich (Kein Zugang für Lieferwagen / Personen- o/u Warenlift nicht vorhanden)": "Poor access (no van access / no passenger or goods lift)",
  // Ereignisse
  "Keine aussergewöhnliche Einzelereignisse in der Bauwerksgeschichte": "No exceptional events", "Erdbeben": "Earthquake",
  "Überschwemmungen/Wasserschäden": "Flooding / water damage", "Brandschäden": "Fire damage", "Schneelastschäden (Einsturz durch schwere Schneelast)": "Snow load damage",
  "Sturmschäden (z.B. durch Orkane oder Tornados)": "Storm damage", "Blitzschlag (z.B. Brandschaden oder strukturelle Beeinträchtigung)": "Lightning strike",
  "Bodenabsenkungen (z.B. durch Erdrutsche oder Setzungen)": "Ground subsidence", "Vandalismus oder Sabotage": "Vandalism or sabotage",
  "Schäden durch Baumfall": "Damage from falling trees", "Ungewöhnliche Materialfehler (z.B. Betonrisse oder Stahlermüdung)": "Unusual material defects (e.g. concrete cracks, steel fatigue)",
  "Schädlingsbefall (z.B. Termiten oder Pilzbefall)": "Pest infestation (e.g. termites, fungi)", "Vibrationsschäden (z.B. durch nahegelegene Bauprojekte oder Verkehr)": "Vibration damage (e.g. from nearby works or traffic)",
  // Schadstoffbelastet, Zustand, Potenzial, ja/nein
  "ja": "yes", "nein": "no", "Verdacht": "suspected", "nicht getestet": "not tested",
  "neuwertig": "as new", "leichte Gebrauchsspuren": "light signs of use", "starke Gebrauchsspuren": "heavy signs of use", "beschädigt": "damaged",
  "gut": "good", "schlecht": "poor", "unbekannt": "unknown", "gering": "low", "hoch": "high",
  // Verbindung
  "Verbindung unbekannt": "Connection unknown", "Geschraubt": "Screwed", "Genagelt": "Nailed", "Geklebt": "Glued", "Geschweisst": "Welded", "Genietet": "Riveted",
  "Verzahnt (z.B. bei Holzverbindungen)": "Interlocked (e.g. timber joints)", "Gefalzt (z.B. bei Blechverbindungen)": "Folded (e.g. sheet metal seams)",
  "Gesteckt (Stecksysteme)": "Plugged (plug-in systems)", "Gepresst (z.B. Pressverbindungen bei Metall)": "Pressed (e.g. metal press fittings)", "Geklemmt": "Clamped",
  "Geclipst (z.B. bei Kunststoffelementen)": "Clipped (e.g. plastic elements)", "Gebördelt (z.B. an Rohrverbindungen)": "Flared (e.g. pipe joints)",
  "Verzapft (z.B. traditionelle Holzverbindungen)": "Mortise and tenon (traditional timber joints)", "Gesteckt und geklemmt (Kombinationstechniken)": "Plugged and clamped",
  "Verlötet (z.B. bei Metallrohren)": "Soldered (e.g. metal pipes)", "Verschweisst und verschraubt (Kombinationsverbindung)": "Welded and screwed",
  // Dokumente
  "Keine": "None", "Gebäudebeschreibung": "Building description", "Skizzen": "Sketches", "Pläne": "Plans", "technischen Datenblätter": "Technical data sheets",
  "Punktwolke": "Point cloud", "3D Modell": "3D model",
  // Schadstoffart (names that differ in English)
  "CO2 (Kohlendioxid)": "CO2 (carbon dioxide)", "Feinstaub": "Fine dust", "Holzschutzmittel": "Wood preservatives", "Invasive Neophyten": "Invasive plants",
  "Ionisierende Strahlung": "Ionising radiation", "Kohlenwasserstoffe": "Hydrocarbons", "Künstliche Mineralfasern": "Man-made mineral fibres", "Legionellen": "Legionella",
  "Nikotin": "Nicotine", "Nutzungsbedingte Belastungen": "Use-related contamination", "PAK": "PAH", "Schimmel": "Mould", "Schlacke": "Slag", "Schwermetalle": "Heavy metals",
  "Asbest": "Asbestos", "Formaldehyd": "Formaldehyde",
  // Exposition
  "Innenraum (komplett vor Witterungseinflüssen geschützt)": "Indoors (fully protected from weather)", "Überdacht (geschützt, aber nicht vollständig innen)": "Covered (protected, not fully indoors)",
  "Teilweise überdacht (teilweise Schutz, jedoch begrenzt der Witterung ausgesetzt)": "Partly covered", "Bewittert (direkt der Witterung ausgesetzt, z.B. Regen, Schnee, Wind)": "Exposed to weather",
  "Erdberührt (Material in direktem Kontakt mit dem Erdreich)": "In contact with ground", "Unterwasser (dauerhaft oder zeitweise im Wasser)": "Under water",
  "Spritzwasserbereich (gelegentlich Spritzwasser ausgesetzt, z.B. bei Fassaden in Bodennähe)": "Splash zone", "Frost-/Tauwetterbereich (Material dem Wechsel von Frost und Tauwetter ausgesetzt)": "Freeze-thaw zone",
  "UV-Belastung (starkem Sonnenlicht und UV-Strahlung ausgesetzt)": "UV exposure", "Chemikalieneinfluss (Exposition gegenüber aggressiven Chemikalien oder Umgebungen, z.B. Industriegebiete)": "Chemical exposure",
  "Kondensationsbelastung (Material regelmässig Kondensation ausgesetzt, z.B. in Feuchträumen)": "Condensation", "Windbelastung (besonders starken Winden ausgesetzt, z.B. bei hohen Gebäuden oder exponierten Lagen)": "Wind exposure",
  // Status
  "eingebaut": "installed", "zwischengelagert": "in interim storage", "wiedereingebaut": "reinstalled",
  // Lagerung
  "Zerbrechlich (vorsichtiger Umgang erforderlich)": "Fragile", "Zu verpacken (Schutz durch Verpackung notwendig)": "Needs packaging",
  "Trockenlagerung (Lagerung in trockenen, feuchtigkeitsgeschützten Räumen)": "Dry storage", "Vertikallagerung (Bauteil muss aufrecht gelagert werden)": "Store upright",
  "Auf Paletten zu lagern (Lagerung auf Paletten für stabilen Transport und Lagerung)": "Store on pallets", "Stapelfähig (Bauteil kann gestapelt werden)": "Stackable",
  "Nicht stapelfähig (kein Stapeln zulässig)": "Not stackable", "Klimatisierte Lagerung (Lagerung bei kontrollierter Temperatur und Feuchtigkeit)": "Climate-controlled storage",
  "Lagerung im Innenbereich (muss vor Witterung geschützt im Innenbereich gelagert werden)": "Indoor storage", "Verschlossen zu lagern (Lagerung in gesicherten oder verschlossenen Räumen)": "Locked storage",
  "Lagerung mit Polsterung (zusätzlicher Schutz durch Polstermaterial erforderlich)": "Store with padding", "Waagerechte Lagerung (Bauteil muss liegend gelagert werden)": "Store flat",
  "Feuchtigkeitsgeschützt verpacken (Schutzverpackung gegen Feuchtigkeit notwendig)": "Moisture-proof packaging", "Frostfreie Lagerung (Lagerung muss in frostfreien Bereichen erfolgen)": "Frost-free storage",
  "Korrosionsgeschützt lagern (besondere Massnahmen zum Schutz vor Korrosion erforderlich)": "Corrosion protection", "Schwerlasttransport erforderlich (spezialisierter Transport für schwere Bauteile)": "Heavy transport needed",
  // Project types (app)
  "Wiederverwendungs-Inventar": "Reuse inventory", "Schadstoffermittlung": "Pollutant survey", "Rückbaukonzept": "Deconstruction plan", "Materialpass": "Material passport",
};
