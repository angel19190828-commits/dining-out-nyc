# Dining Out NYC

**Live site:** [angel19190828-commits.github.io/dining-out-nyc](https://angel19190828-commits.github.io/dining-out-nyc/)

An interactive, landmark-first 3D guide to licensed outdoor dining across New York City. Visitors move from a scroll-directed film into a single continuous miniature world, choose a landmark, inspect nearby Sidewalk and Roadway restaurants, and assemble a simple day itinerary.

## Experience

- **Cinematic Hero** — reversible scroll-scrubbed film with five readable chapter holds.
- **Landmark Exhibition** — twelve recognizable destinations across all five boroughs in one interactive 3D scene.
- **Nearby Dining** — up to 24 real licensed locations around the selected landmark, represented as distinct Sidewalk tables and Roadway sheds.
- **Connected Detail Layer** — click any restaurant to open its receipt; click another visible model to replace the receipt without leaving or blocking the 3D scene.
- **Plan Your Day** — save restaurants into Morning, Afternoon, and Evening slots with a clearly labelled straight-line spatial overview.

## Interaction model

The exploration intentionally has one simple state chain:

```text
All Landmarks
  → select a landmark
Nearby Dining
  → select Restaurant A
Receipt A
  → select Restaurant B without closing
Receipt B
```

The receipt is a detail layer connected to `selectedRestaurantId`, not a separate page or full-screen modal. All visible restaurant objects outside the receipt remain interactive.

## Tech stack

- Vite 7 + React 19
- Three.js + React Three Fiber + Drei
- GSAP + ScrollTrigger
- Vitest
- NYC Open Data snapshots with live API fallback

The application uses one WebGL canvas and shared instanced geometry for restaurant objects.

## Local development

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Create `.env.local` only if installing licensed React Bits Pro assets:

```env
REACTBITS_LICENSE_KEY=your_local_key
```

Never expose this value through a `VITE_` variable or commit it.

## Commands

```bash
npm run dev        # start the Vite development server
npm test           # run the Vitest suite
npm run build      # create the production bundle
npm run preview    # preview the production bundle
npm run data:sync  # refresh official data snapshots
```

## Data methodology

- Outdoor dining licenses: NYC Open Data, **Dining Out NYC Locations**.
- Cuisine: attached only for high-confidence matches from the official DOHMH Restaurant Inspection dataset.
- Nearby distance: Haversine straight-line distance, starting at 0.8 km and expanding to at most 2 km.
- Results: nearest 24 eligible records maximum.
- Price, menu, opening hours, suitability, and travel time are not inferred.

Generated snapshots live in `public/data/` so the experience remains functional when the live API is unavailable.

## Accessibility and performance

- Keyboard-accessible landmark and restaurant alternatives.
- Reduced-motion behavior for cinematic and spatial transitions.
- Touch-safe interaction without hover-only requirements.
- One canvas, instanced restaurant geometry, shared hit proxies, and capped device pixel ratio.

## Project notes

- [`DESIGN.md`](./DESIGN.md) — visual and interaction specification.
- [`PROGRESS.md`](./PROGRESS.md) — current implementation state and validated behavior.
- [`CHANGELOG.md`](./CHANGELOG.md) — chronological development record.

## Credits and licensing

Restaurant and license data is provided by NYC Open Data under its applicable terms. `StickerPeel` is adapted from React Bits and credited in the product footer. Any React Bits Pro source requires the repository owner's valid local license.

The Hero film and other project-specific visual assets remain subject to their respective owner-provided usage rights and are not granted a separate license by this repository.
