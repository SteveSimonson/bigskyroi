/**
 * Edge Worker for bigskyroi.com
 * - www → apex 301
 * - force HTTPS
 * - sitemap.xml correct Content-Type
 * - static assets for everything else
 */

const CANONICAL_HOST = "bigskyroi.com";

export default {
  async fetch(request, env) {
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

    return env.ASSETS.fetch(request);
  },
};
