import { t } from "../i18n";

interface Props { onBack?: () => void; onSkip?: () => void; onNext: () => void; nextLabel?: string; nextType?: "button" | "submit" }

/** Footer of every step page: back · skip · next. */
export function StepFooter({ onBack, onSkip, onNext, nextLabel, nextType = "button" }: Props) {
  return (
    <div className="footer step-footer">
      {onBack && <button type="button" className="btn ghost" onClick={onBack}>{t("c.back")}</button>}
      {onSkip && <button type="button" className="btn ghost" onClick={onSkip}>{t("c.skip")}</button>}
      <button type={nextType} className="btn primary" onClick={nextType === "button" ? onNext : undefined}>{nextLabel ?? t("c.next")}</button>
    </div>
  );
}
