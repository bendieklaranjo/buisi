import { useState, type FormEvent } from "react";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { preparePhoto } from "../lib/images";
import { back, navigate } from "../lib/nav";
import { putPhoto, saveProject, usePhotoUrl, useData } from "../lib/store";

export function Address({ pid }: { pid: string }) {
  const p = useData().projects[pid];
  const [f, setF] = useState({ street: p?.street ?? "", nr: p?.nr ?? "", zip: p?.zip ?? "", city: p?.city ?? "" });
  const img = usePhotoUrl(p?.imageId);
  if (!p) return null;
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const onPhoto = async (file?: File) => {
    if (!file) return;
    const ph = await preparePhoto(file, 1400);
    p.imageId = await putPhoto(ph.blob);
    saveProject(p);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    Object.assign(p, { street: f.street.trim(), nr: f.nr.trim(), zip: f.zip.trim(), city: f.city.trim() });
    if (!p.info.ort) p.info.ort = [[p.street, p.nr].filter(Boolean).join(" "), [p.zip, p.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    saveProject(p);
    navigate({ name: "building", pid });
  };

  return (
    <>
      <TopBar title={p.name} onBack={back} />
      <main className="wrap">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">Step 2 of 3</span><h2>Location</h2></div>
        <form className="stack" onSubmit={submit}>
          <label className="photo-slot">
            {img ? <img src={img} alt="Project photo" /> : <span><Icon name="cam" size={28} /><br />Add a photo of the building</span>}
            <input type="file" accept="image/*" capture="environment" aria-label="Project photo" onChange={e => onPhoto(e.target.files?.[0])} />
          </label>
          <div className="grid-addr">
            <div className="field"><label htmlFor="street">Street</label><input id="street" type="text" value={f.street} onChange={set("street")} /></div>
            <div className="field"><label htmlFor="nr">Nr.</label><input id="nr" type="text" value={f.nr} onChange={set("nr")} /></div>
          </div>
          <div className="grid-addr" style={{ gridTemplateColumns: "110px 1fr" }}>
            <div className="field"><label htmlFor="zip">ZIP</label><input id="zip" type="text" inputMode="numeric" value={f.zip} onChange={set("zip")} /></div>
            <div className="field"><label htmlFor="city">City</label><input id="city" type="text" value={f.city} onChange={set("city")} /></div>
          </div>
          {/* TODO: fetch building data from the Swiss GWR / Zürich open data by address, and a Street View image */}
          <p className="note">Planned: fetch building data from the Swiss building register (GWR) and Zürich open data by address, and a Street View image.</p>
          <div className="footer"><button className="btn primary" type="submit">Continue</button></div>
        </form>
      </main>
    </>
  );
}
