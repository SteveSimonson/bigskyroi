/**
 * Edge Worker for bigskyroi.com
 * - www → apex 301
 * - force HTTPS
 * - HSTS on every response (including 301s and sitemap)
 * - HEAD never subfetches ASSETS with the incoming HEAD method
 * - Cache: hashed /assets + fonts immutable 1y; unhashed JS/CSS 1d;
 *   brand ~7d; HTML max-age=0
 * - WebP rewrite only when a real image/webp file exists
 * - sitemap.xml correct Content-Type
 * - legal pages (/privacy, /privacy-policy, /terms, /about) return 200
 * - static assets for everything else
 */

const CANONICAL_HOST = "bigskyroi.com";
const HSTS = "max-age=31536000";
const HTML_CACHE = "public, max-age=0, must-revalidate";
const FONT_CACHE = "public, max-age=31536000, immutable";
const HASHED_CACHE = "public, max-age=31536000, immutable";
const UNHASHED_SCRIPT_CACHE = "public, max-age=86400, must-revalidate";
const BRAND_CACHE = "public, max-age=604800";
const SITEMAP_CACHE = "public, max-age=300, must-revalidate";

const HASHED_ASSET = /\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.[A-Za-z0-9]+$/;
const LEGAL_PATHS = new Set(["/privacy", "/privacy-policy", "/terms", "/about"]);

export function cacheControlForPath(path) {
  const lower = path.toLowerCase();
  if (lower.startsWith("/assets/fonts/") || lower.endsWith(".woff2")) {
    return FONT_CACHE;
  }
  if (path.startsWith("/assets/")) {
    if (HASHED_ASSET.test(path)) return HASHED_CACHE;
    if (/\.(js|css)$/.test(lower)) return UNHASHED_SCRIPT_CACHE;
    return BRAND_CACHE;
  }
  if (/\.(svg|png|jpe?g|webp|gif|ico)$/.test(lower)) return BRAND_CACHE;
  return null;
}

function withHsts(res) {
  const out = new Response(res.body, res);
  out.headers.set("Strict-Transport-Security", HSTS);
  out.headers.set("X-Content-Type-Options", "nosniff");
  return out;
}

/**
 * Proxy ASSETS with an explicit GET. Passing the incoming HEAD method
 * yields an empty body and can 500 a cold isolate.
 */
async function fetchAssets(env, assetUrl, incoming) {
  const headers = new Headers(incoming.headers);
  headers.delete("host");
  const res = await env.ASSETS.fetch(
    new Request(assetUrl, { method: "GET", headers, redirect: "manual" }),
  );
  if (incoming.method === "HEAD") {
    return new Response(null, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  }
  return new Response(res.body, res);
}

function withCache(res, cacheControl) {
  const out = new Response(res.body, res);
  out.headers.set("Cache-Control", cacheControl);
  return out;
}

async function maybeWebpRewrite(request, env, url) {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  if (!/\.(jpe?g|png)$/i.test(url.pathname)) return null;
  const accept = request.headers.get("Accept") || "";
  if (!accept.includes("image/webp")) return null;

  const webpPath = url.pathname.replace(/\.(jpe?g|png)$/i, ".webp");
  const webpUrl = new URL(webpPath + url.search, url.origin);
  const probe = await env.ASSETS.fetch(
    new Request(webpUrl, { method: "GET" }),
  );
  if (probe.status !== 200) return null;
  const ct = (probe.headers.get("Content-Type") || "").toLowerCase();
  if (!ct.includes("image/webp")) return null;

  const cache = cacheControlForPath(webpPath) || BRAND_CACHE;
  if (request.method === "HEAD") {
    const headers = new Headers(probe.headers);
    headers.set("Cache-Control", cache);
    headers.set("Content-Type", "image/webp");
    return new Response(null, { status: 200, headers });
  }
  const out = new Response(probe.body, probe);
  out.headers.set("Cache-Control", cache);
  out.headers.set("Content-Type", "image/webp");
  return out;
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (url.hostname === "www.bigskyroi.com") {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }

  if (url.protocol === "http:") {
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }

  const webp = await maybeWebpRewrite(request, env, url);
  if (webp) return webp;

  if (url.pathname === "/sitemap.xml") {
    const res = await fetchAssets(
      env,
      new URL("/sitemap.xml", url.origin),
      request,
    );
    if (res.status !== 200) return res;
    const headers = new Headers(res.headers);
    headers.set("Content-Type", "application/xml; charset=UTF-8");
    headers.set("Cache-Control", SITEMAP_CACHE);
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  }

  const legalPath =
    url.pathname !== "/" && url.pathname.endsWith("/")
      ? url.pathname.slice(0, -1)
      : url.pathname;
  if (LEGAL_PATHS.has(legalPath)) {
    const assetUrl = new URL(legalPath, url.origin);
    assetUrl.search = url.search;
    const res = await fetchAssets(env, assetUrl, request);
    if (res.status !== 200) return res;
    const headers = new Headers(res.headers);
    headers.set("Content-Type", "text/html; charset=UTF-8");
    headers.set("Cache-Control", HTML_CACHE);
    return new Response(res.body, {
      status: 200,
      statusText: "OK",
      headers,
    });
  }

  const res = await fetchAssets(env, url, request);
  const ct = (res.headers.get("Content-Type") || "").toLowerCase();
  if (ct.includes("text/html")) return withCache(res, HTML_CACHE);
  const cc = cacheControlForPath(url.pathname);
  return cc ? withCache(res, cc) : res;
}

export default {
  async fetch(request, env) {
    const res = await handleRequest(request, env);
    return withHsts(res);
  },
};
