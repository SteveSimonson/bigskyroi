import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const html = readFileSync(join(PUBLIC, "index.html"), "utf8");
const css = readFileSync(join(PUBLIC, "assets/style.css"), "utf8");
const design = readFileSync(join(ROOT, "DESIGN.md"), "utf8");

const { default: worker, cacheControlForPath } = await import(
  pathToFileURL(join(ROOT, "workers/site.js")).href
);

test("homepage self-hosts latin fonts and does not call Google Fonts", () => {
  assert.equal(html.includes("fonts.googleapis.com"), false);
  assert.equal(html.includes("fonts.gstatic.com"), false);
  assert.ok(css.includes("@font-face"));
  assert.ok(css.includes("font-display: swap"));
  assert.ok(css.includes("/assets/fonts/ibm-plex-sans-latin-wght-normal.woff2"));
  assert.ok(css.includes("/assets/fonts/newsreader-latin-wght-normal.woff2"));
  assert.ok(
    html.includes(
      'rel="preload" href="/assets/fonts/newsreader-latin-wght-normal.woff2"',
    ),
  );
  assert.ok(
    html.includes(
      'rel="preload" href="/assets/fonts/ibm-plex-sans-latin-wght-normal.woff2"',
    ),
  );
  for (const file of [
    "ibm-plex-sans-latin-wght-normal.woff2",
    "ibm-plex-mono-latin-400-normal.woff2",
    "ibm-plex-mono-latin-500-normal.woff2",
    "ibm-plex-mono-latin-600-normal.woff2",
    "newsreader-latin-wght-normal.woff2",
    "newsreader-latin-wght-italic.woff2",
  ]) {
    assert.ok(existsSync(join(PUBLIC, "assets/fonts", file)), file);
  }
});

test("ATF is never hidden with opacity:0; LCP img is not decoding=async", () => {
  assert.equal(/opacity\s*:\s*0(?:\s|;|!|$)/.test(css), false);
  assert.equal(html.includes("decoding=\"async\""), false);
  assert.equal(html.includes('id="lcp-hero-wrap"'), false);
});

test("a11y: skip-link, main landmark, associated labels, heading order, contrast token", () => {
  assert.ok(html.includes('class="skip-link" href="#main"'));
  assert.ok(html.includes('<main id="main">'));
  assert.ok(html.includes('for="unit-cost"'));
  assert.ok(html.includes('for="sell-price"'));
  assert.ok(html.includes("<h3>Desk</h3>"));
  assert.equal(html.includes("<h4>"), false);
  assert.ok(css.includes("--faint: #7a8ba6"));
  assert.ok(design.includes("#7a8ba6"));
  assert.ok(css.includes("min-height: 44px"));
});

test("cacheControlForPath matches the pagespeed playbook", () => {
  assert.equal(
    cacheControlForPath("/assets/fonts/ibm-plex-sans-latin-wght-normal.woff2"),
    "public, max-age=31536000, immutable",
  );
  assert.equal(
    cacheControlForPath("/assets/index-AbCdEfGh.js"),
    "public, max-age=31536000, immutable",
  );
  assert.equal(
    cacheControlForPath("/assets/style.css"),
    "public, max-age=86400, must-revalidate",
  );
  assert.equal(
    cacheControlForPath("/assets/desk.js"),
    "public, max-age=86400, must-revalidate",
  );
  assert.equal(
    cacheControlForPath("/assets/favicon.svg"),
    "public, max-age=604800",
  );
});

function mockEnv(files) {
  const methods = [];
  return {
    methods,
    env: {
      ASSETS: {
        async fetch(req) {
          methods.push(req.method);
          const path = new URL(req.url).pathname;
          const rec = files[path];
          if (!rec) {
            return new Response("<!doctype html>missing", {
              status: 404,
              headers: { "content-type": "text/html; charset=utf-8" },
            });
          }
          return new Response(rec.body, {
            status: rec.status ?? 200,
            headers: rec.headers,
          });
        },
      },
    },
  };
}

test("HEAD never subfetches ASSETS with incoming HEAD", async () => {
  const { methods, env } = mockEnv({
    "/": {
      body: "<!doctype html><title>x</title>",
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  });
  const res = await worker.fetch(
    new Request("https://bigskyroi.com/", { method: "HEAD" }),
    env,
  );
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "");
  assert.deepEqual(methods, ["GET"]);
  assert.equal(res.headers.get("cache-control"), "public, max-age=0, must-revalidate");
  assert.ok(res.headers.get("strict-transport-security"));
});

test("HTML cache is max-age=0; fonts immutable; unhashed CSS not immutable", async () => {
  const { env } = mockEnv({
    "/": {
      body: "<!doctype html>",
      headers: { "content-type": "text/html; charset=utf-8" },
    },
    "/assets/style.css": {
      body: "body{}",
      headers: { "content-type": "text/css" },
    },
    "/assets/fonts/ibm-plex-sans-latin-wght-normal.woff2": {
      body: "woff",
      headers: { "content-type": "font/woff2" },
    },
  });
  const htmlRes = await worker.fetch(
    new Request("https://bigskyroi.com/"),
    env,
  );
  assert.equal(
    htmlRes.headers.get("cache-control"),
    "public, max-age=0, must-revalidate",
  );
  const cssRes = await worker.fetch(
    new Request("https://bigskyroi.com/assets/style.css"),
    env,
  );
  assert.equal(
    cssRes.headers.get("cache-control"),
    "public, max-age=86400, must-revalidate",
  );
  assert.equal(cssRes.headers.get("cache-control").includes("immutable"), false);
  const fontRes = await worker.fetch(
    new Request(
      "https://bigskyroi.com/assets/fonts/ibm-plex-sans-latin-wght-normal.woff2",
    ),
    env,
  );
  assert.equal(
    fontRes.headers.get("cache-control"),
    "public, max-age=31536000, immutable",
  );
});

test("WebP rewrite only when a real image/webp file exists", async () => {
  const { env } = mockEnv({
    "/brand/hero.jpg": {
      body: "jpeg-bytes",
      headers: { "content-type": "image/jpeg" },
    },
    "/brand/hero.webp": {
      body: "webp-bytes",
      headers: { "content-type": "image/webp" },
    },
    "/brand/only.jpg": {
      body: "jpeg-bytes",
      headers: { "content-type": "image/jpeg" },
    },
    "/brand/only.webp": {
      body: "<!doctype html>404",
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  });

  const rewritten = await worker.fetch(
    new Request("https://bigskyroi.com/brand/hero.jpg", {
      headers: { Accept: "image/webp,image/jpeg" },
    }),
    env,
  );
  assert.equal(rewritten.status, 200);
  assert.equal(rewritten.headers.get("content-type"), "image/webp");
  assert.equal(await rewritten.text(), "webp-bytes");

  const missing = await worker.fetch(
    new Request("https://bigskyroi.com/brand/only.jpg", {
      headers: { Accept: "image/webp,image/jpeg" },
    }),
    env,
  );
  assert.equal(missing.status, 200);
  assert.equal(missing.headers.get("content-type"), "image/jpeg");
  assert.equal(await missing.text(), "jpeg-bytes");
});

test("legal pages stay 200 with HTML max-age=0", async () => {
  const { env } = mockEnv({
    "/privacy": {
      body: "<!doctype html><title>Privacy</title>",
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  });
  const res = await worker.fetch(
    new Request("https://bigskyroi.com/privacy/"),
    env,
  );
  assert.equal(res.status, 200);
  assert.equal(
    res.headers.get("cache-control"),
    "public, max-age=0, must-revalidate",
  );
});
