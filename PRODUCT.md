# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static pre-rendered site (user-confirmed). A Node build script renders HTML/CSS/JS for four languages (kk, ru, en, ko) from JSON content files; no server or database in Phase 1. B2B applications are collected through Tally embeds; orders are sent through WhatsApp. Deploy target: GitHub Pages (repo `minaikhansaltanat-prog/BAYOUWELLNESS`). Database, admin panel, payments and B2B portal belong to later phases of the master specification.

## Users

- Retail shoppers in Kazakhstan (Kazakh- and Russian-speaking first; English and Korean secondary) who want hair and scalp care products and professional advice before they buy. Most arrive on a phone.
- Business owners (beauty salons, cosmetology centers, clinics, cosmetics shops, online sellers, distributors) who want wholesale terms and a place on the official partner map.
- Shoppers and visitors who want to find the nearest official partner by city or address.

## Product Purpose

BAYOU WELLNESS is a digital platform for health and beauty products that gives customers professional advice and builds a verified partner network across Kazakhstan. It combines three businesses: B2C retail (catalog, product pages, cart), B2B wholesale and partnership (application, later a partner portal), and a partner map. Success means more product sales, more B2B partner applications, and wider coverage of official sales points.

## Positioning

The site is a business system for retail, wholesale and a verified partner network, not only a storefront. Only verified partners cleared for publication appear on the map, and every product claim traces back to official product documents.

## Operating Context

- Currency KZT (₸). Contact and WhatsApp number: +7 700 386 6632.
- Payments and delivery providers are not integrated until business agreements exist; until then the cart hands the order to a manager over WhatsApp, who confirms price, availability and delivery.
- Product prices, discounts, stock and descriptions must come from data, never hard-coded in templates.
- Planned phases: 1 MVP (design system, 4 languages, home, catalog, product pages, B2B form, partner map and list, simple admin, SEO, analytics), 2 Commerce, 3 B2B portal, 4 Growth.

## Capabilities and Constraints

- Four languages with language-specific URLs and separate meta tags: Kazakh, Russian, English, Korean. All copy must be professionally translated; Kazakh-specific letters (Ә Ғ Қ Ң Ө Ұ Ү Һ І) must render in a font that has them.
- Mobile first. No horizontal scroll or rubber-band stretching, fixed header, hamburger at top right with a close button inside the opened menu, language switcher immediately left of the hamburger.
- No medical promises, diagnoses or treatment claims. No invented ingredients, usage directions, ratings, reviews, certificates or results; unknown facts stay marked as pending official documents.
- The map shows only verified partners cleared for publication, never random coordinates, and the list view keeps working if the map provider fails.
- Floating WhatsApp button at the bottom right (green and yellow ripple waves and a periodic shake).
- Undecided: product prices, stock, sale prices, real partner records, official ingredient and usage documents, delivery and return terms, production domain.

## Brand Commitments

- Logo: `logo.png` (glossy 3D red "Ba", green "YOU" with a leaf-and-person emblem, "WELLNESS" underneath).
- Palette from the master spec: Primary Red #F71920, Deep Red #C90012, Light Red #FF4848, Primary Green #58C900, Deep Green #237900, Light Green #8BEA28; neutrals #FFFFFF, #F7F9F6, #EEF1EC, text #202820, secondary text #667066, border #E2E8DF. Green leads (CTA, active, positive); red marks promotions and important notices; the two are never used in equal large areas.
- Typography from the spec: Manrope for body, Montserrat for headings. Manrope lacks Kazakh letters Ә Ғ Қ Ң Ұ, so Kazakh pages use Onest for body text.
- 3D is a small accent only (soft shadows, light volume on buttons, natural light on product photos).
- The user confirmed BAYOU WELLNESS is an official AROMATICA distributor/seller.

## Evidence on Hand

- `logo.png`, `Photo/` (28 product and mood photos; AROMATICA Rosemary products are legible on the packaging, other photos show third-party brands and are used only as label-free atmosphere crops).
- Seven AROMATICA Rosemary products with names and sizes legible on packaging: Root Enhancer 100 ml, PDRN Scalp Serum 100 ml, Scalp Scaling Shampoo 400 ml, Hair Thickening Conditioner 400 ml, Scalp Scrub 165 g, Root Volumizing Scalp Ampoule 20 ml, Dry Shampoo Powder 10 g.
- Absent, and not to be fabricated: prices, stock, official ingredient lists and directions, partner records, testimonials, customer counts, certificates, company address, e-mail, social links.

## Product Principles

1. Verified information over persuasion: show only what official documents and real records support.
2. A business system first, a pretty showcase second: every page should lead to an action (order, apply, find a partner, ask on WhatsApp).
3. Phone-first reliability: nothing shifts, stretches or clips on a small screen.
4. Four languages are equal citizens, not a translation afterthought.
5. Data lives in content files so prices, products and partners can change without code edits.

## Accessibility & Inclusion

- Keyboard operable forms and menus, visible focus, WCAG AA contrast, `prefers-reduced-motion` respected, empty and error states for forms, lists and the map.
