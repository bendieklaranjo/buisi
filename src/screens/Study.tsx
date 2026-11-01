import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { exportStudyCSV, studyRows } from "../lib/export";
import { back } from "../lib/nav";
import { useData } from "../lib/store";

const median = (a: number[]) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const fmt = (s: number | null) => (s == null ? "–" : s >= 90 ? `${(s / 60).toFixed(1)} min` : `${Math.round(s)} s`);
const num = (v: unknown) => Number(v) || 0;

export function Study() {
  const { projects } = useData();
  const all = Object.values(projects);
  const rows = studyRows(all);
  const A = rows.filter(r => r.mode === "assisted"), M = rows.filter(r => r.mode === "manual");
  const t = (r: typeof rows[number]) => num(r.active_s_first_save);
  const mA = median(A.map(t)), mM = median(M.map(t));
  const gain = mA != null && mM != null && mM > 0 ? Math.round((1 - mA / mM) * 100) : null;

  const types = [...new Set(rows.map(r => String(r.element_type || "Other")))];
  const stats = types.map(ty => ({
    ty, n: rows.filter(r => (r.element_type || "Other") === ty).length,
    a: median(A.filter(r => (r.element_type || "Other") === ty).map(t)),
    m: median(M.filter(r => (r.element_type || "Other") === ty).map(t)),
  })).sort((x, y) => y.n - x.n).slice(0, 8);
  const maxV = Math.max(1, ...stats.flatMap(s => [s.a ?? 0, s.m ?? 0]));
  const niceMax = Math.ceil(maxV / 30) * 30, w = 340, left = 120, plotW = w - left - 50, rowH = 34, h = stats.length * rowH + 30;
  const x = (v: number) => left + (v / niceMax) * plotW;

  return (
    <>
      <TopBar title="Time study" onBack={back} />
      <main className="wrap">
        <div className="stack" style={{ gap: 4 }}>
          <span className="eyebrow">Active time per element, until first save</span>
          <h2>{gain == null ? "Capture elements in both modes to compare." : gain >= 0 ? `Assisted is ${gain}% faster per element` : `Assisted is ${-gain}% slower per element`}</h2>
        </div>
        <div className="stat-row">
          <div className="stat"><div className="k">Assisted · median</div><div className="v">{fmt(mA)}</div><div className="d">{A.length} elements · {A.reduce((s, r) => s + num(r.human_corrections), 0)} corrections to AI</div></div>
          <div className="stat"><div className="k">Manual · median</div><div className="v">{fmt(mM)}</div><div className="d">{M.length} elements</div></div>
        </div>
        {stats.length ? (
          <div className="card stack">
            <div className="row small"><span className="swatch" style={{ background: "var(--c4)" }} />Assisted<span className="swatch" style={{ background: "var(--sage-deep)", marginLeft: 10 }} />Manual<span className="muted" style={{ marginLeft: "auto" }}>median seconds</span></div>
            <svg className="chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Median seconds per element by type and mode">
              {[0, niceMax / 2, niceMax].map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={0} y2={h - 22} stroke="var(--line)" /><text x={x(v)} y={h - 6} textAnchor="middle">{Math.round(v)} s</text></g>)}
              {stats.map((s, k) => {
                const y = k * rowH + 4;
                return (
                  <g key={s.ty}>
                    <text x={left - 8} y={y + 17} textAnchor="end">{s.ty.length > 18 ? s.ty.slice(0, 17) + "…" : s.ty}</text>
                    {s.a != null && <><rect x={left} y={y + 2} width={Math.max(2, x(s.a) - left)} height={11} rx={2} fill="var(--c4)" /><text x={x(s.a) + 4} y={y + 12}>{Math.round(s.a)}</text></>}
                    {s.m != null && <><rect x={left} y={y + 15} width={Math.max(2, x(s.m) - left)} height={11} rx={2} fill="var(--sage-deep)" /><text x={x(s.m) + 4} y={y + 25}>{Math.round(s.m)}</text></>}
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="list"><div className="empty">No saved elements yet. Time starts when you tap a component (assisted) or choose “Add component manually”, pauses while the app is in the background, and stops when you save.</div></div>
        )}
        {rows.length > 0 && (
          <>
            <div className="tablewrap"><table><thead><tr><th>Element</th><th>Room</th><th>Mode</th><th className="num">Time</th><th className="num">Taps</th><th className="num">AI wait</th><th className="num">Fixes</th></tr></thead>
              <tbody>{rows.slice(-40).reverse().map(r => (
                <tr key={String(r.element_id)}><td>{r.element_type}</td><td className="tag">{r.room_tag}</td><td>{r.mode}</td><td className="num">{fmt(t(r))}</td>
                  <td className="num">{r.segmentation_taps}</td><td className="num">{num(r.ai_wait_s) ? `${r.ai_wait_s} s` : "–"}</td><td className="num">{r.mode === "assisted" ? r.human_corrections : "–"}</td></tr>
              ))}</tbody></table></div>
            <button className="btn" onClick={() => exportStudyCSV(all)}><Icon name="export" /> Export time study (.csv)</button>
          </>
        )}
        <p className="note">AI waiting time is included in the active time, because the surveyor waits on site. The export lists it separately so you can also analyse time without it.</p>
      </main>
    </>
  );
}
