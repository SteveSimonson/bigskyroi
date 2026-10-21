import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const CARD_URL = "https://bigskyroi.com/assets/og-card.png";
const CARD_PATH = "/assets/og-card.png";

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...htmlFiles(path));
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}

function meta(html, attr, key) {
  const re = new RegExp(
    `<meta\\s+${attr}=["']${key}["']\\s+content=["']([^"']+)["']`,
    "i",
  );
  const match = html.match(re);
  return match ? match[1] : null;
}

function pngSize(buf) {
  assert.equal(buf.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(buf.subarray(12, 16).toString("ascii"), "IHDR");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test("every page head advertises an absolute social image", () => {
  const files = htmlFiles(PUBLIC);
  assert.ok(files.length >= 8);
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const og = meta(html, "property", "og:image");
    const card = meta(html, "name", "twitter:card");
    const image = meta(html, "name", "twitter:image");
    assert.equal(card, "summary_large_image", file);
    assert.match(og, /^https:\/\//, file);
    assert.match(image, /^https:\/\//, file);
    if (!file.endsWith("/founder-os/index.html")) {
      assert.equal(og, CARD_URL, file);
      assert.equal(image, CARD_URL, file);
      assert.equal(meta(html, "property", "og:image:width"), "1200", file);
      assert.equal(meta(html, "property", "og:image:height"), "630", file);
    }
  }
});

test("social card is a 1200x630 PNG at the advertised path", () => {
  const buf = readFileSync(join(PUBLIC, CARD_PATH));
  assert.deepEqual(pngSize(buf), { width: 1200, height: 630 });
});
