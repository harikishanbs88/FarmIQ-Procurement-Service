import fs from "node:fs";
import path from "node:path";

const srcDir = path.resolve("artifacts/farmiq/dist/public");
const destPublic = path.resolve("public");
const destDist = path.resolve("dist");

if (!fs.existsSync(srcDir)) {
  console.error(`[FarmIQ Build Sync Error] Source build directory does not exist: ${srcDir}`);
  process.exit(1);
}

// Synchronize to ./public
fs.mkdirSync(destPublic, { recursive: true });
fs.cpSync(srcDir, destPublic, { recursive: true });

// Synchronize to ./dist
fs.mkdirSync(destDist, { recursive: true });
fs.cpSync(srcDir, destDist, { recursive: true });

console.log(`[FarmIQ Vercel Sync] Successfully synchronized build artifacts to ./public and ./dist`);
