const PATHS: Record<string, string> = {
  home: "M4 11l8-7 8 7 M6 9.5V20h12V9.5 M10 20v-6h4v6",
  globe: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M3 12h18 M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z",
  next: "M9 5l7 7-7 7",
  back: "M15 5l-7 7 7 7",
  save: "M5 4h11l3 3v13H5z M8 4v5h7V4 M8 20v-6h8v6",
  check: "M4 12.5l5 5L20 6.5",
  plus: "M12 5v14M5 12h14",
  cam: "M4 8h3l2-3h6l2 3h3v11H4z M15.5 13a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  info: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 11v6M12 7.5v.5",
  export: "M12 4v11M7 9l5-5 5 5M5 20h14",
};
export function Icon({ name, size }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={size ? { stroke: "currentColor", fill: "none", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } : undefined} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
export const Tick = () => (
  <svg className="tick" viewBox="0 0 24 24" aria-label="Inventoried"><path d={PATHS.check} /></svg>
);
