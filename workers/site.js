/**
 * Edge Worker for bigskyroi.com
 * - www → apex 301
 * - force HTTPS
 * - HSTS on every response (including 301s and sitemap)
 * - sitemap.xml correct Content-Type
 * - legal pages (/privacy, /privacy-policy, /terms, /about) return 200
 * - static assets for everything else
 */

const CANONICAL_HOST = "bigskyroi.com";
const HSTS = "max-age=31536000";

function withHsts(res) {
  const out = new Response(res.body, res);
  out.headers.set("Strict-Transport-Security", HSTS);
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

  if (url.pathname === "/sitemap.xml") {
    const assetReq = new Request(new URL("/sitemap.xml", url.origin), request);
    const res = await env.ASSETS.fetch(assetReq);
    if (res.status !== 200) return res;
    const headers = new Headers(res.headers);
    headers.set("Content-Type", "application/xml; charset=UTF-8");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cache-Control", "public, max-age=300, must-revalidate");
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  }

  // Legal pages: serve HTML at slash and no-slash paths (AdSense / crawler 200s).
  const legalAssets = {
    "/privacy": "/privacy.html",
    "/privacy/": "/privacy.html",
    "/privacy-policy": "/privacy-policy.html",
    "/privacy-policy/": "/privacy-policy.html",
    "/terms": "/terms.html",
    "/terms/": "/terms.html",
    "/about": "/about.html",
    "/about/": "/about.html",
  };
  const legalAsset = legalAssets[url.pathname];
  if (legalAsset) {
    const assetReq = new Request(new URL(legalAsset, url.origin), request);
    const res = await env.ASSETS.fetch(assetReq);
    if (res.status !== 200) return res;
    const headers = new Headers(res.headers);
    headers.set("Content-Type", "text/html; charset=UTF-8");
    headers.set("Cache-Control", "public, max-age=300, must-revalidate");
    return new Response(res.body, {
      status: 200,
      statusText: "OK",
      headers,
    });
  }

  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    const res = await handleRequest(request, env);
    return withHsts(res);
  },
};
