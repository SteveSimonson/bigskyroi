# AGENTS — bigskyroi.com

## Purpose

**Big Sky ROI** is a Wall Street–grade investment research desk for **Amazon product capital allocation**. Operators and investors come here for conviction scores, risk-adjusted ROI frameworks, position sizing, and desk notes — not generic seller tips.

## Positioning

- Domain: e-commerce / Amazon product **investment** research (private label, wholesale, brand acquisition proxies).
- Voice: institutional, precise, operator-first. Bloomberg desk energy without hype.
- Never claim to be a registered investment adviser for securities. Product research ≠ securities advice.
- Always include a clear research disclaimer on advice surfaces.

## Hard rules

1. **Network properties** (Parsimony, Catalyst88, HumanityNow, etc.): dofollow where linked.
2. **Third-party / competitor links**: `rel="noopener noreferrer nofollow"` + `target="_blank"`.
3. Never disclose ERPNext / Frappe / white-label internals when mentioning Parsimony.
4. Brand tokens:
   - Midnight `#070B14`
   - Panel `#0D1424`
   - Gold `#E8B84A`
   - Sky `#5AB0FF`
   - Long `#1ECB8C`
   - Risk `#F04343`
   - Canvas text `#E8EDF5`
5. Legal entity on site: **Big Sky ROI, LLC** · 30 N Gould St, Suite R, Sheridan, WY 82801.

## Structure

```
public/                 ← deploy root
  index.html            ← desk homepage
  methodology.html      ← research framework
  research/index.html   ← model book / ideas
  assets/               ← CSS, JS, favicon
workers/site.js
wrangler.jsonc
```

## Change protocol

1. Branch from `main` (`feature/…`, `content/…`).
2. Edit static files under `public/`.
3. Update `sitemap.xml` when adding URLs.
4. PR → independent review → merge → `npm run deploy`.
