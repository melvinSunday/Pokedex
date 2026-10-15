---
name: Pokédex
description: A warm field-atlas system for discovering Pokémon and reading their species notes.
colors:
  forest: "#203b31"
  forest-deep: "#172e26"
  paper: "#f5f4ee"
  paper-bright: "#fdfcf8"
  ink: "#24332d"
  muted: "#626d63"
  rule: "#e5e5dc"
  leaf: "#c6db8b"
  focus: "#507b61"
typography:
  display:
    fontFamily: '"Newsreader", Georgia, serif'
    fontSize: "clamp(2.85rem, 4.35vw, 4.35rem)"
    fontWeight: 500
    lineHeight: 0.99
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Newsreader", Georgia, serif'
    fontSize: "31px"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.018em"
  title:
    fontFamily: '"Newsreader", Georgia, serif'
    fontSize: "25px"
    fontWeight: 500
    lineHeight: 1.1
  body:
    fontFamily: '"DM Sans", "Avenir Next", ui-sans-serif, system-ui, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: '"DM Sans", "Avenir Next", ui-sans-serif, system-ui, sans-serif'
    fontSize: "10px"
    fontWeight: 650
    letterSpacing: "0.07em"
rounded:
  soft: "9px"
  control: "12px"
  card: "15px"
  dialog: "25px"
  pill: "999px"
components:
  button-collection:
    backgroundColor: "rgba(255, 255, 255, 0.66)"
    textColor: "#33463c"
    rounded: "{rounded.pill}"
    padding: "0 10px 0 14px"
    height: "41px"
  button-collection-active:
    backgroundColor: "{colors.forest}"
    textColor: "#fff"
    rounded: "{rounded.pill}"
    height: "41px"
  button-route:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.soft}"
    padding: "4px 8px 4px 4px"
    height: "34px"
  chip-type:
    backgroundColor: "color-mix(in srgb, var(--type-accent) 8%, white)"
    textColor: "var(--type-ink)"
    rounded: "{rounded.pill}"
    padding: "2px 8px 2px 6px"
    height: "20px"
  input-search:
    backgroundColor: "#fbfaf5"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 11px 0 17px"
    height: "55px"
  card-species:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "15px 16px"
  dialog-details:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    width: "min(970px, calc(100% - 36px))"
    height: "min(690px, calc(100dvh - 36px))"
  nav-detail-tabs:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    height: "43px"
---

# Design System: Pokédex

## Overview

**Creative North Star: "The Trainer Route Atlas"**

The catalog treats discovery as a trail through a naturalist’s field guide. Warm paper and forest ink give the page a calm base; fine route marks, contour rings, and specimen artwork turn browsing into a journey between recorded species. Type color stays a practical signal in route markers, type labels, and the soft wash around each specimen.

Newsreader gives display headings and species names an editorial field-note voice. DM Sans keeps controls, labels, and dense facts direct. Artwork leads each species card, while the detail sheet opens into a clear record with an image, tabs, and structured facts. Short lifts and gentle artwork motion signal interaction; reduced-motion preferences collapse that movement.

**Key Characteristics:**
- Warm field-paper surfaces anchored by forest green.
- Pokémon artwork is the visual center of each species entry.
- Route lines and rings add quiet map-like orientation.
- Type colors identify a route or species and stay locally applied.
- Editorial names sit beside plain, compact facts and controls.

## Colors

The palette uses muted woodland greens and warm paper for structure, with one contained type accent per species or route. Exact primitive values live in the frontmatter; the source stylesheet also provides a separate mapping for the 18 Pokémon types.

### Primary
- **Forest ink** (`forest`): carries the hero surface, selected collection control, active detail-tab marker, and text caret.
- **Deep forest** (`forest-deep`): supplies deep contrast for selected text.

### Secondary
- **Type-route accents**: each Pokémon type receives an accent, pale wash, and readable ink from the centralized type-visual mapping. Use these to identify routes and species, not to recolor the page chrome.

### Tertiary
- **Leaf highlight** (`leaf`): makes the search field's focus ring visible against the forest hero.
- **Focus green** (`focus`): marks keyboard focus on controls over the paper surfaces.

### Neutral
- **Warm paper** (`paper`): the full-page canvas.
- **Bright paper** (`paper-bright`): the species-card and detail-sheet surface.
- **Field ink** (`ink`): primary text.
- **Muted green-gray** (`muted`): supporting labels, numbers, and explanatory copy.
- **Paper rule** (`rule`): quiet separators between catalog sections.

**The Type-as-Wayfinding Rule.** Keep type color on route markers, type labels, specimen washes, and related accents; forest ink and paper carry the surrounding interface.

**The Pokédex Wordmark Rule.** Keep the source logo's red “Poké” and blue “dex” lettering together in the wordmark; forest and paper carry the surrounding interface.

## Typography

**Display Font:** Newsreader (with Georgia, serif fallback)
**Body Font:** DM Sans (with Avenir Next and system sans-serif fallbacks)

**Character:** Newsreader makes the atlas feel like an editorial field guide; DM Sans keeps controls and reference facts clear at compact sizes. Both local font files are bundled with the project.

### Hierarchy
- **Display** (500, responsive clamp from 2.85rem to 4.35rem, 0.99 line height): the catalog invitation.
- **Headline** (500, 31px, 1.02 line height): the species name in the detail hero; it steps down on smaller screens.
- **Title** (500, 25px, 1.1 line height): catalog and section headings. Species-card names use the same display face at a smaller size.
- **Body** (400, 14px, 1.7 line height): introductory and explanatory copy, with narrower measures in the hero and detail sheet.
- **Label** (650–700, generally 9–12px, lightly tracked): Pokédex numbers, type names, tabs, and other compact metadata.

**The Two-Voice Rule.** Use Newsreader for display headings and species names; use DM Sans for controls, navigation, labels, and dense reference facts.

## Layout

The desktop page sits in a centered frame up to 1480px wide. The hero balances copy and search against a featured specimen. Below it, a route rail sits beside an artwork-led catalog grid; the route rail stays available while browsing and the grid cards begin at a 230px minimum width. Cards use a 17px grid gap.

At 1120px the outer padding and route rail tighten. At 820px the route rail moves above the catalog and becomes a horizontal chip path. At 600px the hero stacks, the featured species card becomes a compact horizontal composition, and the species grid remains two columns. Below 390px the catalog becomes one column. The page retains a 320px minimum viewport width.

The species detail view is a bounded dialog with a specimen panel beside the facts and tabs. Opening it locks the page behind the dialog; the selected detail panel owns scrolling, and a close control stays at the dialog's top-right. At the 600px breakpoint it becomes a vertical sheet, with the artwork and identity above the detail content.

## Elevation & Depth

Depth is mostly tonal: paper surfaces, type-tinted artwork washes, fine outlines, and route rings do the structural work. Shadows are reserved for the search field, the Pokémon artwork, and the detail dialog. The search field uses a soft shadow (`0 9px 25px rgba(7, 23, 17, 0.14)`); card artwork uses a close drop shadow (`0 7px 5px rgba(35, 46, 35, 0.12)`); the detail dialog uses a broad backdrop shadow (`0 28px 100px rgba(15, 29, 21, 0.3), 0 2px 8px rgba(17, 27, 20, 0.12)`). Species cards lift on hover instead of gaining a box shadow.

## Shapes

Controls and content surfaces use a small set of soft corners, with larger rounding reserved for cards and the detail dialog. Collection controls and type labels use capsule silhouettes; route markers and artwork rings stay circular. The contour marks inside the hero and detail panel are deliberately irregular, like lines on a field map.

**The Route-Mark Rule.** Keep map geometry thin and low-contrast; it orients the eye around specimen artwork rather than competing with it.

## Components

### Buttons

Collection controls are compact capsules with a count; their active state becomes a forest-filled pill. Route choices are quiet, left-aligned controls whose selected state gains a pale type wash and a slightly stronger marker. Each species card is one keyboard-focusable field-notes action; the circular favorite control stays independent, so saving a Pokémon never opens the detail sheet.

### Chips

Type chips pair a small colored dot with a readable type name on a pale type-tinted surface. Keep both the type name and the color cue so route identity does not depend on color alone.

### Cards / Containers

Species cards use a fine border and a bright-paper surface. Artwork sits in a soft type wash with concentric route rings; the species number stays above it, and name, type labels, and the field-notes cue form a compact footer. The whole card opens its notes, while its heart remains a separate control. Hover raises the card slightly and lifts the artwork.

### Inputs / Fields

The search field is a bright, high-contrast horizontal control with a leading search symbol and an optional keyboard shortcut hint or clear action. Its wrapper uses the leaf highlight and a wider offset to stay visible over the dark hero; controls on paper use the shared focus green outline.

### Navigation

The type-route list uses connected markers on desktop and scrollable chips at narrower widths. Detail tabs remain a plain horizontal row with a short forest underline for the active section. Preserve the global visible keyboard-focus outline on these controls.

### Species Detail Sheet

The detail dialog pairs a type-tinted specimen panel with a fact area whose selected panel owns scrolling. The page behind it stays locked until the dialog closes, and the close button stays in the dialog's top-right corner. The image and name anchor the left side on desktop and move above the tabs on mobile; facts and the selected tab remain on a bright-paper surface.

## Do's and Don'ts

### Do:
- **Do** use Newsreader for display headings and species names, and DM Sans for controls and compact facts.
- **Do** keep type color close to the route or species it identifies.
- **Do** retain visible keyboard focus and honor reduced-motion preferences.
- **Do** keep species artwork centered and legible inside its type wash.

### Don't:
- **Don't** spread type colors across the page chrome or use them as unrelated decoration.
- **Don't** make route lines, contour rings, or shadows louder than the specimen artwork.
- **Don't** let compact labels replace readable species names or factual headings.
