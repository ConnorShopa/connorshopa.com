// Encrypts a project's private pages so they can sit in the public repo and only open with the password.
//
//   LOCK_PASSWORD='your password' node tools/lock.mjs touchtunes
//
// Reads  private/<slug>/pages.json   [{ "layout": "two", "html": "<div>…</div>" }, …]   (same shape as js/projects.js pages)
//        private/<slug>/media/*      images / video the pages use; refer to them in the html as private:<file name>
// Writes js/locked/<slug>.json       the encrypted bundle (AES-256-GCM, key from PBKDF2-SHA256)
//
// private/ is git-ignored, so the plain text never gets committed. Only js/locked/<slug>.json is committed.
import { webcrypto as crypto } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";

const slug = process.argv[2];
const password = process.env.LOCK_PASSWORD;
if (!slug || !password) {
  console.error("Usage: LOCK_PASSWORD='…' node tools/lock.mjs <slug>");
  process.exit(1);
}

const dir = join("private", slug);
const pages = JSON.parse(readFileSync(join(dir, "pages.json"), "utf8"));
const TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webm": "video/webm", ".pdf": "application/pdf" };

const b64 = (buf) => Buffer.from(buf).toString("base64");
const ITER = 250000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);

async function seal(bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes);
  return { iv: b64(iv), data: b64(data) };
}

const out = { v: 1, iter: ITER, salt: b64(salt), main: await seal(new TextEncoder().encode(JSON.stringify(pages))), files: {} };

const mediaDir = join(dir, "media");
if (existsSync(mediaDir)) {
  for (const name of readdirSync(mediaDir)) {
    const type = TYPES[extname(name).toLowerCase()];
    if (!type) { console.warn("skipping (unknown type):", name); continue; }
    out.files[name] = { type, ...(await seal(readFileSync(join(mediaDir, name)))) };
  }
}

mkdirSync("js/locked", { recursive: true });
writeFileSync(join("js/locked", slug + ".json"), JSON.stringify(out));
console.log("locked", slug + ":", pages.length, "page(s),", Object.keys(out.files).length, "file(s) -> js/locked/" + slug + ".json");
