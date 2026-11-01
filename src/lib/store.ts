/**
 * App data store: projects and elements in IndexedDB on the device, photos as Blobs.
 * Components subscribe with `useData()`. To move to a backend (e.g. Supabase) later,
 * replace the four persistence functions at the bottom – the rest of the app stays the same.
 */
import { useSyncExternalStore, useEffect, useState } from "react";
import { createStore, get, set, del, entries } from "idb-keyval";
import type { Element, Project } from "../domain/types";

const dataDb = createStore("buisi-data", "records");
const photoDb = createStore("buisi-photos", "blobs");

interface Data {
  ready: boolean;
  projects: Record<string, Project>;
  elements: Record<string, Element>;
}

let data: Data = { ready: false, projects: {}, elements: {} };
const listeners = new Set<() => void>();
const emit = () => { data = { ...data }; listeners.forEach(l => l()); };

export function useData(): Data {
  return useSyncExternalStore(
    l => { listeners.add(l); return () => listeners.delete(l); },
    () => data,
  );
}
export const getData = () => data;

export const nid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export async function loadAll() {
  try {
    const all = await entries<string, Project | Element>(dataDb);
    for (const [k, v] of all) {
      if (k.startsWith("p:")) data.projects[(v as Project).id] = v as Project;
      else if (k.startsWith("e:")) data.elements[(v as Element).id] = v as Element;
    }
  } catch (e) {
    console.warn("Could not load saved data", e);
  }
  data.ready = true;
  emit();
}

export function saveProject(p: Project) {
  p.updatedAt = Date.now();
  data.projects[p.id] = p;
  emit();
  void persist("p:" + p.id, p);
}
export function saveElement(e: Element) {
  e.updatedAt = Date.now();
  data.elements[e.id] = e;
  const p = data.projects[e.pid];
  if (p) saveProject(p); else emit();
  void persist("e:" + e.id, e);
}
export function deleteElement(id: string) {
  delete data.elements[id];
  emit();
  void remove("e:" + id);
}
export function deleteProject(id: string) {
  for (const e of Object.values(data.elements)) if (e.pid === id) deleteElement(e.id);
  delete data.projects[id];
  emit();
  void remove("p:" + id);
}

export const elementsOf = (pid: string, roomId?: string) =>
  Object.values(data.elements)
    .filter(e => e.pid === pid && (!roomId || e.roomId === roomId))
    .sort((a, b) => a.createdAt - b.createdAt);

/* ---------- photos ---------- */
const urlCache = new Map<string, string>();

export async function putPhoto(blob: Blob): Promise<string> {
  const id = nid();
  urlCache.set(id, URL.createObjectURL(blob));
  await set(id, blob, photoDb);
  return id;
}
export const getPhoto = (id: string) => get<Blob>(id, photoDb);
export async function photoUrl(id: string): Promise<string | null> {
  if (urlCache.has(id)) return urlCache.get(id)!;
  const b = await getPhoto(id);
  if (!b) return null;
  const u = URL.createObjectURL(b);
  urlCache.set(id, u);
  return u;
}
export function usePhotoUrl(id?: string) {
  const [url, setUrl] = useState<string | null>(id ? urlCache.get(id) ?? null : null);
  useEffect(() => {
    let live = true;
    if (!id) { setUrl(null); return; }
    void photoUrl(id).then(u => live && setUrl(u));
    return () => { live = false; };
  }, [id]);
  return url;
}

/* ---------- persistence (swap these for a backend later) ---------- */
async function persist(key: string, value: unknown) {
  try { await set(key, JSON.parse(JSON.stringify(value)), dataDb); }
  catch (e) { console.warn("Save failed", e); window.dispatchEvent(new CustomEvent("buisi:toast", { detail: "Saving failed. Your device may be out of storage." })); }
}
async function remove(key: string) {
  try { await del(key, dataDb); } catch (e) { console.warn(e); }
}
