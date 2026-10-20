---
name: BAYOU WELLNESS
description: A botanical clean lab. The glossy red-and-green brand on a mineral-white ground, lit by real rosemary product photography.
colors:
  red-primary: "#F71920"
  red-deep: "#C90012"
  red-light: "#FF4848"
  green-primary: "#58C900"
  green-deep: "#237900"
  green-light: "#8BEA28"
  forest: "#153A08"
  forest-raised: "#1C4A0B"
  sage-tile: "#E8F3DB"
  sage-stage: "#D3E8BE"
  sage-line: "#BCD9A0"
  white: "#FFFFFF"
  ground: "#F7F9F6"
  soft-gray: "#EEF1EC"
  ink: "#202820"
  ink-secondary: "#667066"
  hairline: "#E2E8DF"
  field-border: "#84917F"
  ink-on-green: "#12240A"
  whatsapp-yellow: "#FFD21F"
typography:
  display:
    fontFamily: "Montserrat, Noto Sans KR, system-ui, sans-serif"
    fontSize: "clamp(2.125rem, 1.35rem + 2.9vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 1.07
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Montserrat, Noto Sans KR, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.35rem + 1.7vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Montserrat, Noto Sans KR, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, Noto Sans KR, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.95rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.7
  body-kazakh:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.95rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Manrope, Noto Sans KR, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.15
rounded:
  pill: "999px"
  card: "20px"
  control: "12px"
  arch: "999px 999px 28px 28px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "clamp(56px, 8vw, 120px)"
components:
  button-primary:
    backgroundColor: "{colors.green-primary}"
    textColor: "{colors.ink-on-green}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.green-light}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  chip-active:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
  product-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "52px"
  band-dark:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
---

# Design System: BAYOU WELLNESS

## Overview

**Creative North Star: "The Botanical Clean Lab"**

The brand's glossy red-and-green logo is the only loud object on the page. Everything else is a calm, mineral-white ground that real photography lights up: sage-toned rosemary packs, moss, stone, a rosemary sprig on oil. Green leads (the action, the active state, the good news); red punctuates (sale, alert) and never shares a large area with green. Dark forest bands carry the partner map, the B2B offer and the footer. The phone is the primary screen; every composition is designed at 375px first and then given room.

The system is warm without being sentimental and premium without being precious. Surfaces layer from ground to white to floating, shadows are tinted with the forest green, and the only 3D is a light bevel on the lime buttons and the WhatsApp float, echoing the logo's gloss.

**Key Characteristics:**
- Bright ground, sage tiles, forest bands; one saturated lime for action.
- Real product photography only; white-background packs multiply into sage tiles.
- Montserrat headings with tight tracking over a clean humanist body face.
- Pills for controls, 20px for cards, an arch frame for the hero product.
- One authored motion moment; everything else is still or reveals once.

## Colors

A saturated lime and a glossy red from the logo, held in check by quiet mineral neutrals and a derived forest green.

### Primary
- **Brand Lime** (#58C900): the call-to-action fill and active states. Always carries ink text (#12240A, 7.6:1), never white. The button gradient runs from #7FDE17 to #4DB300 for the glossy bevel.
- **Deep Green** (#237900): links and icons on light grounds (5.2:1 on the page ground), hover and focus outline.
- **Light Green** (#8BEA28): highlights, text on forest bands, button hover.

### Secondary
- **Brand Red** (#F71920): cart count and errors in small areas. Sale badges use **Deep Red** (#C90012) so white text clears 4.5:1; **Light Red** (#FF4848) is reserved for red hovers.
- **Forest** (#153A08, derived from Deep Green): the footer, the map teaser, the B2B band and active chips. **Forest Raised** (#1C4A0B) lifts surfaces inside it.

### Neutral
- **Ground** (#F7F9F6): the page. **White** (#FFFFFF): elevated cards, fields, the menu panel. **Soft Gray** (#EEF1EC): quiet panels and the application section.
- **Sage Tile** (#E8F3DB), **Sage Stage** (#D3E8BE), **Sage Line** (#BCD9A0): the ground for pack shots and the hero arch (derived).
- **Ink** (#202820): all body text and headings (14.3:1). **Secondary Ink** (#667066): supporting text (4.9:1 on the ground). **Hairline** (#E2E8DF): dividers and card borders. **Field Border** (#84917F): form-control outlines, 3.3:1 on white (WCAG 1.4.11).
- **WhatsApp Yellow** (#FFD21F): only in the floating button's ripple rings.

### Named Rules
**The Lime-Needs-Ink Rule.** Text on the brand lime is ink, never white. White text appears only on Deep Green, Forest and darker, or on Deep Red.
**The Never-Equal Rule.** Red and green never share a large area at similar weight. Green is the system; red is a punctuation mark.

## Typography

**Display Font:** Montserrat (with Noto Sans KR for Hangul, then the system sans)
**Body Font:** Manrope (with Noto Sans KR). Kazakh pages use **Onest** because Manrope has no glyphs for Ә Ғ Қ Ң Ұ (verified with fontTools); Onest covers Ә Ғ Қ Ң Ө Ұ Ү Һ І.

**Character:** A wide, confident geometric display over a clean, readable text face. Headings are heavy and tight; body copy is airy.

### Hierarchy
- **Display** (800, clamp 34 to 52px, 1.07, -0.035em): the hero heading only.
- **Headline** (800, clamp 28 to 40px, 1.12, -0.03em): section and page headings.
- **Title** (700, clamp 20 to 26px, 1.25, -0.02em): card titles, step titles, guide titles.
- **Body** (400, clamp 16 to 18px, 1.7): paragraphs at 60 to 68ch. Korean uses `word-break: keep-all` and 1.75 line height.
- **Label** (700, 14px, 1.15): buttons and chips. Footer column titles use 13px, 800 weight and 0.1em tracking.

### Named Rules
**The Four-Script Rule.** Every string must render in all four languages without a fallback glyph. The check is part of the build: `npm run check` and the font-coverage test.
**The No-Eyebrow Rule.** Headings carry their own weight; no small uppercase label sits above a heading.

## Layout

A 1240px container (1400px for the header bar) with a fluid gutter of `clamp(16px, 4vw, 40px)`. Section rhythm is `clamp(56px, 8vw, 120px)`. Mobile first: the base is one column; two-column compositions begin at 900px, the desktop navigation at 1180px, the header CTA at 1360px.

The page never scrolls sideways and never stretches. `overflow-x: clip` and `overscroll-behavior: none` on the root, no 100vw widths, horizontal carousels are their own scroll containers with `overscroll-behavior-x: contain`, and the header is `position: fixed` with a matching body offset. Compositions vary by section: asymmetric split hero, service ribbon, four-cell bento (cell count equals category count), card rail, split story, dark band, split offer, guide cards, accordion, closing band.

## Elevation & Depth

Layered and tinted. Three shadow levels, all carrying an offset and a blur and tinted with the forest ink (`rgb(21 40 8)`): resting cards (`--shadow-1`), hovered and floating elements (`--shadow-2`), hero stage and menu (`--shadow-3`). Depth also comes from layering: ground, white card, floating chip. Frosted glass appears only on the fixed header (a functional blur so content passes under it legibly).

### Named Rules
**The Light-Bevel Rule.** The only skeuomorphism is an inner top highlight plus a soft lower shadow on lime buttons and the WhatsApp float. Cards stay flat.

## Shapes

One radius system: pills (999px) for buttons, chips, fields and badges; 20px for cards, tiles and images; 28px for large feature images; the arch (`999px 999px 28px 28px`) is reserved for the hero product. Small icon buttons are circles. Images are never masked to approximate a subject's contour.

## Components

### Buttons
- **Shape:** pill, 48px tall (44px small, 56px large), 700 weight.
- **Primary:** lime gradient, ink text, inner highlight; hover lifts 2px and brightens; active sinks to a flat inset.
- **Secondary:** white with a 1px ink-tinted outline; hover turns the border Deep Green.
- **Ghost / link-arrow:** Deep Green text, arrow slides 4px on hover.
- **Focus:** a 3px Deep Green outline with 3px offset on every interactive element.

### Chips
- Pill, 44px tall, white with a hairline; the active chip is Forest with white text. Filter chips scroll horizontally inside their own container.

### Product card
- White, 20px radius, 1px hairline, shadow-1. A 4:5 sage tile holds the photo (multiplied when it is a white-background pack shot). Name, type and size, a two-line description, price or "price on request", an availability note, then Details and Add to cart. Hover lifts 4px and slowly scales the photo (not on touch devices).

### Inputs / Fields
- Pill fields, 52px tall, white, 1.5px Field Border; focus swaps to Deep Green with a soft 4px lime halo. Labels sit above the control; errors sit below in Deep Red with the field outlined red. Selects use a custom caret; text areas use the 20px card radius.

### Navigation
- A fixed frosted header. Desktop shows one line of links with the active page in a sage pill. Below 1180px a hamburger sits top right, the language switcher immediately to its left and the cart before that. The opened menu is a right-hand panel with its own close button in the same top-right spot, large link rows, a language grid, two actions and the phone number. Body scroll locks while it is open.

### WhatsApp float
- A 60px glossy green disc bottom right (safe-area aware). Two ripple rings, one yellow and one green, expand and fade 1.5s apart; every six seconds the disc shakes for under a second. A speech bubble appears once per session. All of it stops under `prefers-reduced-motion`.

### Partner map
- Leaflet on OpenStreetMap tiles tinted toward the palette, teardrop pins (red when selected), a list that mirrors the map, and a bottom sheet on phones. The list works alone if the map or its tiles fail.

## Do's and Don'ts

### Do:
- **Do** put ink text on lime and white text only on Deep Green, Forest or Deep Red.
- **Do** multiply white-background pack shots into the sage tile and use a scrim plus a green multiply layer on lifestyle photography.
- **Do** keep every control at least 44px and give each one hover, focus-visible and active states.
- **Do** animate only transform and opacity, with an exponential ease-out, from an already visible default.
- **Do** keep prices, stock, partners and product facts in the content files, never in templates.

### Don't:
- **Don't** use gradient text, decorative glass, glow, or hard offset shadows.
- **Don't** place a small label above a heading or number the sections.
- **Don't** use `transition: all`, a 100vw width, or `touch-action` that blocks vertical scrolling.
- **Don't** show unverified partners on the map, invent ingredients or directions, or make medical promises.
- **Don't** use red and green at equal weight in the same large area.
