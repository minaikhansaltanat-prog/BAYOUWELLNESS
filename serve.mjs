// Dev server: builds the site, serves dist/ at http://localhost:3000 and rebuilds when sources change.
//   node serve.mjs            (PORT=4000 node serve.mjs to change the port)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT || 3000);
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon"
};

const build = () => {
  const r = spawnSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "inherit", env: process.env });
  return r.status === 0;
};
if (!fs.existsSync(path.join(DIST, "index.html"))) build();

let timer;
for (const dir of ["src", "content", "public"]) {
  fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 300);
  });
}

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(DIST, p);
    if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      const nf = path.join(DIST, "404.html");
      res.writeHead(404, { "Content-Type": MIME[".html"] });
      res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : "Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`BAYOU WELLNESS dev server: http://localhost:${PORT}/`));
