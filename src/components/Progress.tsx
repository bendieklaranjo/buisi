/** Progress bar under the top bar. `value` of `max`, with a short label on the left. */
export function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((Math.min(value, max) / max) * 100) : 0;
  return (
    <div className="progress wrap" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className="progress-row"><span>{label}</span><span className="timer">{pct}%</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: pct + "%" }} /></div>
    </div>
  );
}
