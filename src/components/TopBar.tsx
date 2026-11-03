import type { ReactNode } from "react";
import { t } from "../i18n";
import { Icon } from "./Icon";

interface Props { title: string; onBack?: () => void; onHome?: () => void; homeLabel?: string; children?: ReactNode }

/** Sticky top bar: back, title, optional extras, and a home button (project menu or main menu). */
export function TopBar({ title, onBack, onHome, homeLabel, children }: Props) {
  return (
    <header className="bar wrap">
      {onBack && <button className="iconbtn" onClick={onBack} aria-label={t("c.back")}><Icon name="back" /></button>}
      <h1>{title}</h1>
      {children}
      {onHome && <button className="iconbtn" onClick={onHome} aria-label={homeLabel ?? t("c.home")} title={homeLabel ?? t("c.home")}><Icon name="home" /></button>}
    </header>
  );
}
