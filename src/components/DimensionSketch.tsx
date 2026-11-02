/** Small isometric block that shows which measure is height, width and depth. */
export function DimensionSketch() {
  return (
    <svg className="dim-sketch" viewBox="0 0 150 110" role="img" aria-label="Block showing height (Höhe), width (Breite) and depth (Tiefe)">
      <path d="M30 40 L90 40 L120 22 L60 22 Z" className="face top" />
      <path d="M30 40 L90 40 L90 95 L30 95 Z" className="face front" />
      <path d="M90 40 L120 22 L120 77 L90 95 Z" className="face side" />
      {/* height */}
      <path d="M20 40 V95 M16 40 H24 M16 95 H24" className="dim" />
      <text x="14" y="71" textAnchor="end">H</text>
      {/* width */}
      <path d="M30 103 H90 M30 99 V107 M90 99 V107" className="dim" />
      <text x="60" y="110" textAnchor="middle" dominantBaseline="text-after-edge">B</text>
      {/* depth */}
      <path d="M97 99 L127 81 M95 96 L99 102 M125 78 L129 84" className="dim" />
      <text x="118" y="102">T</text>
    </svg>
  );
}
