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
  methodology/          ← research framework
  research/             ← model book / ideas
  founder-os/           ← Founder OS hub (living business plan → Catalyst88)
  assets/               ← CSS, JS, favicon
workers/site.js
wrangler.jsonc
```

### Founder OS page

`/founder-os/` promotes **Catalyst88 Founder OS** as the go-to living business-plan system for founders, bridged from Big Sky ROI’s capital-allocation desk. SEO/AEO: FAQPage + HowTo + SoftwareApplication JSON-LD; dofollow to `https://catalyst88.com/founder-os`.

## Change protocol

1. Branch from `main` (`feature/…`, `content/…`).
2. Edit static files under `public/`.
3. Update `sitemap.xml` when adding URLs.
4. PR → independent review → merge → `npm run deploy`.

## Design system (mandatory for UI)

**Source of truth:** [`DESIGN.md`](./DESIGN.md) at the repo root (tokens + prose + do's/don'ts).

### Before any UI / CSS / component / layout work

1. **Read `DESIGN.md`** (full file, or at least Overview, Colors, Components, Do's and Don'ts).
2. **Do not invent** colors, fonts, radii, shadows, or button styles outside that contract.
3. Prefer existing theme tokens and shared button/card/field classes over one-off hex in markup.
4. If the brand must change: **update `DESIGN.md` first**, then mirror into the site CSS, then components.

### Adversarial review — UI PRs

When the diff touches styles, layout, or visual components:

- Flag any hex, font-family, or radius **not** listed in `DESIGN.md`.
- Flag new CTA patterns that violate Do's and Don'ts.
- Confirm the PR checklist includes the DESIGN.md item when UI-related.

### Runtime mapping

| DESIGN.md | Code |
|-----------|------|
| Color / type tokens | Primary stylesheet (see DESIGN.md → Components / CSS path) |
| Components | Existing button, card, field, nav classes in that stylesheet |
