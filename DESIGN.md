# Dining Out NYC — Landmark-first travel data story

## 1. Product intent

This is a cinematic, single-page travel planning story for visitors who know a New York landmark before they know a neighborhood restaurant. It uses real Dining Out NYC licenses to answer: “What outdoor dining is genuinely near the place I want to visit?” It must never imply ratings, hours, price, menu, travel time or a restaurant view that the public sources do not support.

## 2. Narrative

`01 Hero → DINE WITH A VIEW → 02 Landmark Selection → 03 Nearby Outdoor Dining → 04 Restaurant Detail → 05 Plan Your Day → 06 Data Source`

- The existing Hero remains the atmospheric opening.
- The 3D text reveal is a short reversible bridge, not a chapter.
- Landmarks are the primary choice; borough is secondary context.
- Nearby dining uses adaptive radii of 0.8, 1.2, 1.5 and 2 km, stops when eight records are available, and shows at most 24.
- Detail is a physical ticket overlay with a neutral Real View media slot.
- Plan Your Day is a manual three-stop ticket, not an automatic recommendation engine.

## 3. Typography

DM Sans is the only family. Display headings use 800 with tight negative tracking. Body uses 400–500; controls use 600–700. Numeric distance and license values use tabular numerals. No Archivo Black and no novelty monospace receipt type.

## 4. Color and material

- Background: `#F3F4F2`
- Light miniature surface: `#FBFBF8`
- Secondary surface: `#E7EAE8`
- Primary ink: `#151717`
- Secondary ink: `#606768`
- Identification red: `#C45145`
- Water: quiet blue-gray; parks: muted sage; structures: neutral steel and brick.

The world should feel like a clean museum model under neutral daylight. Texture is extremely light; glassmorphism, gradients-as-decoration and neon are excluded.

## 5. 3D system

The application owns exactly one React Three Fiber Canvas. Hero, landmark stage and nearby scene are mutually exclusive roots. CameraRig alone updates the camera. Twelve landmark miniatures are assembled from reusable trees, water, structures, paths, bridge pieces and street furniture. All landmarks render simplified silhouettes; hover/focus raises medium detail; only the selected landmark renders full detail.

Nearby locations use two InstancedMeshes:

- Sidewalk: open white umbrella, thin dark pole and circular table.
- Roadway: red rectangular shed with roof, walls and an open face.

Every visible restaurant object maps to one real data record.

## 6. Motion

The Hero retains taxi, pigeons, pointer parallax, hover lift and three pickable props. The text bridge is driven by GSAP ScrollTrigger scrub and reverses on upward scroll. Landmark hover uses a restrained lift/tilt; selection focuses the camera before scrolling to nearby dining. Reduced-motion renders the words statically and uses direct scene changes.

## 7. Data integrity

Dining Out NYC (`fpeh-f7ci`) is loaded live with a bundled snapshot fallback. Cuisine enrichment comes only from DOHMH inspection results (`43nn-pn8j`). A cuisine match is accepted only for normalized name + address, or normalized name + borough + coordinates within 80 m; conflicting candidates remain null. Haversine distance is labeled as straight-line distance.

## 8. Accessibility and responsive behavior

All landmark and restaurant choices have real HTML buttons and visible focus states. Touch uses tap rather than hover. WebGL failure exposes the same landmark index and data journey. At 390 px the Canvas becomes a bounded middle viewport and indexes move below it; no element may force horizontal overflow. Session itinerary state persists only for the browser session.

## 9. Licensed component boundary

The checked-in `ThreeDTextReveal` is a clearly labeled local compatibility implementation because the private React Bits Pro registry cannot be read without the owner’s local license key. After `REACTBITS_LICENSE_KEY` is added to `.env.local`, install `@reactbits-starter/3d-text-reveal-css` and replace the compatibility file without changing its public props. The key must never be exposed through a `VITE_` variable or committed.
