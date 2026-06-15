/**
 * Export the Agent City UI as a static site (for Vercel/any static host).
 *
 * The landing pitch is fully functional static; /app and /grant render the real
 * UI and degrade gracefully without a backend (the live on-chain run is in the
 * demo video + reproducible locally with `npm run dev`). Outputs to ./public.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

import { APP_HTML } from "../src/ui/app.js";
import { GRANT_HTML } from "../src/ui/grant.js";
import { LANDING_HTML } from "../src/ui/landing.js";
import { FAVICON_SVG } from "../src/ui/theme.js";

const out = new URL("../public/", import.meta.url);
const at = (rel: string): URL => new URL(rel, out);

rmSync(out, { recursive: true, force: true });
mkdirSync(at("app/"), { recursive: true });
mkdirSync(at("grant/"), { recursive: true });

writeFileSync(at("index.html"), LANDING_HTML); // /
writeFileSync(at("app/index.html"), APP_HTML); // /app
writeFileSync(at("grant/index.html"), GRANT_HTML); // /grant
writeFileSync(at("favicon.svg"), FAVICON_SVG); // /favicon.svg
writeFileSync(
  at("city-graph.js"),
  readFileSync(new URL("../src/ui/cityGraph.client.js", import.meta.url)),
); // /city-graph.js (React Flow island)

process.stdout.write("Static site exported to public/ (index, app/, grant/, city-graph.js, favicon.svg)\n");
