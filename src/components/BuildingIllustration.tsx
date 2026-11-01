/** Line drawing after the BUISI deck illustration. */
export function BuildingIllustration({ width }: { width?: number }) {
  const win = Array.from({ length: 6 }, (_, r) => {
    const y = 58 + r * 22;
    return <g key={r}><path className="ln" d={`M28 ${y + 2} l20 -4 v14 l-20 4z`} /><path className="ln" d={`M54 ${y - 3} l22 -5 v14 l-22 5z`} /></g>;
  });
  const bands = Array.from({ length: 6 }, (_, r) => {
    const y = 70 + r * 20;
    return <g key={r}><path className="ln" d={`M102 ${y - 16} L190 ${y + 2}`} /><path className="ln" d={`M102 ${y - 8} L190 ${y + 9}`} /></g>;
  });
  return (
    <svg className="bld" viewBox="0 0 260 200" role="img" aria-label="Line drawing of a multi-storey building" style={width ? { width, flex: "none" } : undefined}>
      <path fill="#E0B22E" d="M54 59 l22 -5 v14 l-22 5z" />
      <path fill="#D68AA6" d="M104 80 L190 97 V106 L104 89z" />
      <path fill="#9883C3" d="M28 168 l20 -4 v14 l-20 4z" />
      <path fill="#7A9BC8" d="M226 152 h7 v20 h-7z" />
      <path className="ln" d="M20 52 L84 30 L84 188 L20 184z" />
      <path className="ln" d="M84 30 L198 54 L198 186 L84 188" />
      <path className="ln" d="M198 60 h16 v128 h-16" />
      <path className="ln" d="M214 76 L244 84 V186 H214" />
      {win}{bands}
      <path className="ln" d="M100 150 h22 v36 M128 150 h22 v36 M156 150 h22 v36 M204 66 v120 M209 66 v120 M218 92 l22 6 M218 108 l22 6 M218 124 l22 6 M218 140 l22 6" />
      <path className="ln" d="M2 186 H258" />
    </svg>
  );
}
