import { build as esbuild } from "esbuild";
import path from "node:path";

await esbuild({
  entryPoints: [path.resolve("api/src-entry.ts")],
  platform: "node",
  target: "node20",
  bundle: true,
  format: "esm",
  outfile: path.resolve("api/index.js"),
  logLevel: "info",
  banner: {
    js: `import { createRequire as __crReq } from 'node:module';
import __path from 'node:path';
import __url from 'node:url';
globalThis.require = __crReq(import.meta.url);
globalThis.__filename = __url.fileURLToPath(import.meta.url);
globalThis.__dirname = __path.dirname(globalThis.__filename);
`,
  },
});

console.log("[FarmIQ Vercel] Successfully bundled api/index.js for serverless");
