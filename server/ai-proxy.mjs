// Minimal local proxy for Claude vision requests. Keeps your API key out of the browser.
// Start with:  npm run ai   (reads ANTHROPIC_API_KEY from .env or the environment)
// Vite forwards /api/* to this server during development (see vite.config.ts).
import http from "node:http";
import fs from "node:fs";

// tiny .env loader (no dependency)
try {
  for (const line of fs.readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* no .env file */ }

const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const PORT = Number(process.env.AI_PORT || 8787);

const send = (res, code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };

http.createServer(async (req, res) => {
  if (req.url === "/api/health") return send(res, 200, { ok: !!KEY, model: MODEL });
  if (req.url !== "/api/ai" || req.method !== "POST") return send(res, 404, { error: "Not found" });
  if (!KEY) return send(res, 503, { error: "No ANTHROPIC_API_KEY set. Add it to .env and restart `npm run ai`." });
  let body = "";
  for await (const chunk of req) { body += chunk; if (body.length > 25e6) return send(res, 413, { error: "Images too large." }); }
  let input;
  try { input = JSON.parse(body); } catch { return send(res, 400, { error: "Bad request." }); }
  const content = [
    ...(input.images || []).slice(0, 5).map(img => ({ type: "image", source: { type: "base64", media_type: img.media_type, data: img.data } })),
    { type: "text", text: String(input.prompt || "") },
  ];
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 2000, messages: [{ role: "user", content }] }),
    });
    const j = await r.json();
    if (!r.ok) return send(res, r.status, { error: j?.error?.message || "Claude API error." });
    const text = (j.content || []).filter(c => c.type === "text").map(c => c.text).join("");
    send(res, 200, { text });
  } catch (e) {
    send(res, 502, { error: "Could not reach the Claude API: " + e.message });
  }
}).listen(PORT, () => console.log(`BUISI AI proxy on http://localhost:${PORT} · model ${MODEL} · key ${KEY ? "found" : "MISSING"}`));
