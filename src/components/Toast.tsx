import { useEffect, useState } from "react";

export function Toast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => { setMsg((e as CustomEvent<string>).detail); clearTimeout(t); t = setTimeout(() => setMsg(null), 2600); };
    window.addEventListener("buisi:toast", on);
    return () => { window.removeEventListener("buisi:toast", on); clearTimeout(t); };
  }, []);
  return <div id="toast" role="status" hidden={!msg}>{msg}</div>;
}
