---
version: 1
slug: "src-components-mainpage-jsx"
primary_target: "src/components/MainPage.jsx"
related_targets: []
---

# Pokédex catalog surface

Scope: the main discovery catalog and its species-detail flow.
Visitor mode: Experience, with discovery first and reference information close at hand.
Audience: Pokémon fans browsing casually or checking trusted species details.
Job: find a species, understand its type and key facts, then save discoveries worth revisiting.
Proof and content: live species, artwork, descriptions, stats, evolutions, and moves from PokeAPI.
Constraints: React/Vite, responsive web, no account, and browser-local field notes.

## Direction contract

**THESIS:** A Pokédex should feel like a trail worth wandering, not a list that asks visitors to know what they want before they arrive.

**OWN-WORLD:** Warm paper, forest ink, fine route lines, specimen artwork, and type color used only as a useful wayfinding signal. Newsreader brings an editorial field-guide voice to names and display headings; DM Sans keeps controls and dense facts direct.

**STORY:** Visitors follow a type route or search a name or number, meet a species through its artwork, open its field notes for reliable facts, and save memorable finds to a personal collection.

**FIRST VIEWPORT:** On desktop, a spacious forest-green hero puts the search field and invitation on the left and a featured Pikachu card on the right. A slim type-route rail then guides the eye into an artwork-led species grid. On mobile the hero stacks, routes become horizontal chips, and the catalog stays two columns.

**FORM:** Trainer Route Atlas, assigned as candidate 7 by the experience direction roll (seed key `4d034d0d`). Build code-first as requested; keep route selection, saved state, search, and species details legible and keyboard accessible.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
