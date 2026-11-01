import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function TopBar({ title, onBack, children }: { title: string; onBack?: () => void; children?: ReactNode }) {
  return (
    <header className="bar wrap">
      {onBack && <button className="iconbtn" onClick={onBack} aria-label="Back"><Icon name="back" /></button>}
      <h1>{title}</h1>
      {children}
    </header>
  );
}
