---
version: alpha
name: bigskyroi
description: ROI / big-sky marketing site — match live style tokens.
colors:
  primary: "#e8edf5"
  secondary: "#8b9bb4"
  tertiary: "#3366cc"
  neutral: "#070b14"
  amber: "#f59f00"
  bg: "#070b14"
  bg-elev: "#0a101c"
  faint: "#5c6b86"
  gold: "#e8b84a"
  gold-dim: "rgba(232, 184, 74, 0.14)"
  line: "#1a2744"
  line-hot: "#2a3d66"
  long: "#1ecb8c"
  long-dim: "rgba(30, 203, 140, 0.12)"
  muted: "#8b9bb4"
  panel: "#0d1424"
  panel-2: "#111a2e"
  risk: "#f04343"
  risk-dim: "rgba(240, 67, 67, 0.12)"
  sky: "#5ab0ff"
  sky-dim: "rgba(90, 176, 255, 0.12)"
  text: "#e8edf5"
typography:
  h1:
    fontFamily: IBM Plex Sans
    fontSize: 2.5rem
    fontWeight: 600
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 1rem
    fontWeight: 400
  button:
    fontFamily: IBM Plex Sans
    fontSize: 0.875rem
    fontWeight: 600
rounded:
  md: 12px
  sm: 8px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
---

## Overview

ROI / big-sky marketing site — match live style tokens.

**Domain:** bigskyroi.com
**Primary conversion:** Primary conversion CTA
**CSS path:** `public/assets/style.css`

**This file is the normative brand contract.** Change tokens here first, then mirror into CSS, then components.

## Colors

Extracted from live CSS. Prefer these names in new work:

| Token | Value |
|-------|-------|
| **primary** | `#e8edf5` |
| **secondary** | `#8b9bb4` |
| **tertiary** | `#3366cc` |
| **neutral** | `#070b14` |
| **amber** | `#f59f00` |
| **bg** | `#070b14` |
| **bg-elev** | `#0a101c` |
| **faint** | `#5c6b86` |
| **gold** | `#e8b84a` |
| **gold-dim** | `rgba(232, 184, 74, 0.14)` |
| **line** | `#1a2744` |
| **line-hot** | `#2a3d66` |
| **long** | `#1ecb8c` |
| **long-dim** | `rgba(30, 203, 140, 0.12)` |
| **muted** | `#8b9bb4` |
| **panel** | `#0d1424` |
| **panel-2** | `#111a2e` |
| **risk** | `#f04343` |
| **risk-dim** | `rgba(240, 67, 67, 0.12)` |
| **sky** | `#5ab0ff` |
| **sky-dim** | `rgba(90, 176, 255, 0.12)` |
| **text** | `#e8edf5` |

- Use **tertiary** (or the brand accent listed above) for interaction — not arbitrary new hues.
- Keep product image wells pure white when this is an Amazon-affiliate surface.

## Typography

- **Display:** IBM Plex Sans
- **Body/UI:** IBM Plex Sans
- Do not add a third family without updating this file.

## Layout

- Follow existing container max-widths and section padding in the live CSS.
- Sticky headers must leave scroll-margin for in-page anchors.
- Prefer one primary CTA per view.

## Elevation & Depth

- Match existing shadow/glow language in the stylesheet; do not add Material-style heavy elevation unless already present.
- Respect `prefers-reduced-motion` for hover transforms.

## Shapes

Radii from CSS:
- **md:** 12px
- **sm:** 8px

## Components

Map to existing classes in the primary stylesheet (names vary by site):

| Role | Look for |
|------|----------|
| Primary button | `.btn-primary`, `.btn.primary`, brand CTA class |
| Secondary button | `.btn-secondary`, `.btn-ghost`, outline CTA |
| Card | `.card`, `.card-soft`, product card |
| Field | `.field`, form inputs |
| Nav | header/nav link styles |

Reuse these; do not invent a parallel component set.

## Do's and Don'ts

**Do**

- Read this file before UI work on **bigskyroi**.
- Keep brand accent usage consistent with live pages.
- Update this file in the same PR when brand tokens change.

**Don't**

- Don't invent off-palette accents.
- Ship one-off hex in components when a token exists.
- Copy another brand’s palette into this site without an intentional redesign + DESIGN.md rewrite.
