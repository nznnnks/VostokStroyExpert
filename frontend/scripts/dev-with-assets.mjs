import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { platform } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const syncScript = resolve(__dirname, "sync-stayse-assets.mjs");
const targetFile = resolve(root, "dist/assets/stayse/logos/regent.svg");
const astroBin = resolve(
  root,
  platform() === "win32" ? "node_modules/.bin/astro.cmd" : "node_modules/.bin/astro",
);
const isWindows = platform() === "win32";
const args = process.argv.slice(2);

async function syncAssets() {
  const moduleUrl = new URL(`file://${syncScript}`);
  const imported = await import(`${moduleUrl.href}?t=${Date.now()}`);
  return imported;
}

await syncAssets();

const child = spawn(astroBin, args, {
  cwd: root,
  stdio: "inherit",
  shell: isWindows,
});

const interval = setInterval(async () => {
  if (!existsSync(targetFile)) {
    try {
      await syncAssets();
    } catch (error) {
      console.error("[dev-with-assets] sync failed", error);
    }
  }
}, 750);

function shutdown(code = 0) {
  clearInterval(interval);
  if (!child.killed) {
    child.kill("SIGTERM");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

child.on("exit", (code) => {
  clearInterval(interval);
  process.exit(code ?? 0);
});
