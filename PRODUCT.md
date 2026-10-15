# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pokémon fans who want to discover species and look up reliable details. The user confirmed that the redesign should serve both casual discovery and collector research, with discovery first.

## Product Purpose

Let people find Pokémon by name or National Pokédex number and explore each species' facts, base stats, evolution chain, and moves. Success means finding an entry quickly and understanding the information it contains.

## Positioning

The current implementation brings species search and detailed reference data together in one single page catalog backed by PokeAPI. No distinct market position has been confirmed.

## Operating Context

People use the Pokédex in a web browser on desktop or mobile. The current experience is a single page with an incrementally loaded catalog and detail tabs.

## Capabilities and Constraints

- The current catalog loads Pokémon from PokeAPI and supports search by name and National Pokédex number.
- Each entry can show an overview, base stats, evolution chain, and moves.
- The list loads more entries as people scroll.
- Pokémon can be discovered by type route or saved to a personal field-notes list in browser storage.
- A species opens in an accessible detail view with overview, base stats, evolution, and move tabs.
- The app is built with React, Vite, and Tailwind CSS.
- No account, server side persistence, or verified offline mode is present.
- The user chose to prioritize discovery while keeping reference details easy to reach.

## Brand Commitments

The product is named Pokédex. No additional voice, identity, or visual constraints have been confirmed.

## Evidence on Hand

- Live species data and artwork are retrieved from PokeAPI.
- Existing product behavior is visible in `src/components/Context/Context.jsx`, `src/components/FetchPokemons.jsx`, and the running web app.
- No original brand assets, user research, or product analytics were found in the project.

## Product Principles

- Make the catalog easy to browse and search.
- Keep species information connected to its Pokémon entry.
- Let the PokeAPI data remain the source of truth.
