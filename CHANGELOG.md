# Changelog

## 2026-09-17 — Reliable 3D selection and scroll-scrubbed Hero chapters

### What changed
- Made the enlarged invisible restaurant proxy the sole pointer target and select immediately on left-button `pointerdown`. This removes the fragile pointer-up/click re-hit that allowed hover but intermittently dropped real clicks.
- Removed the invisible interaction wall created by the Nearby copy panel. Non-control text now lets pointer input pass through to the Canvas, while Previous/Next, Browse and Plan controls remain operable.
- Stabilized the Canvas click gesture across hover-driven React re-renders. The receipt stays a narrow detail layer, and the rest of the 3D scene remains clickable.
- Kept all Sidewalk and Roadway proxies interactive while a Receipt is open, so selecting another model replaces the displayed restaurant without leaving the 3D scene.
- Rebuilt Hero around scroll-scrubbed chapter targets with continuous video catch-up: native forward playback, eased reverse correction, frozen frames when scrolling stops and corrective seeking only for large drift.
- Added approach, settle, caption entrance, long hold and exit distances around all five unchanged time markers. One continuous wheel/trackpad burst is limited to `720px`, preventing a single fling from crossing an entire chapter.
- Restored the final dimensional portal at the held 19.43-second frame, followed by the opening title and Landmark handoff.

### Validation
- Real-browser DUMBO test passed: a Roadway model opened SWEETGREEN DUMBO, then a Sidewalk model replaced it with TOMMY'S BAR & BURGER while the first Receipt was still open.
- Final real-browser sequence passed without closing: LOS TACOS AL PASTOR → LOVE & DOUGH → TOMMY'S BAR & BURGER. Each click replaced the single active Receipt in place.
- Real-browser Hero test passed: first-frame hold at `3.279559s`, readable caption, reverse to `2.592617s`, and final portal/title sequence at `19.398333s`.
- `npm test`: 14/14 passed.
- `npm run build`: passed; the existing Three.js chunk warning remains.

## 2026-09-17 — Native Hero playback and interruptible Receipt replacement

### What changed
- Replaced frame-by-frame Hero seeking and scroll correction with native forward video playback. A scroll gesture starts one chapter; playback decelerates over the final 0.6 seconds, settles, reveals the existing caption, and requires fresh intent after a 1.6-second reading hold.
- Added `requestVideoFrameCallback` synchronization, chapter-gated wheel/touch/keyboard input and a reversible short seek for upward navigation. Reduced motion keeps the film and captions but removes the extra dolly/pan movement.
- Consolidated restaurant selection into one pointer gesture with a 6px drag threshold and a deduplicated pointer-up/click fallback, keeping both visual instances and 1.6× hit proxies reliable.
- Added a stable Receipt shell with `entering / visible / exiting` phases. Selecting another 3D restaurant moves the scene selection immediately, fades the old ticket, and reveals only the latest pending restaurant.
- Made the enlarged restaurant proxies the sole raycast targets so every Sidewalk table and Roadway shed gets the same hover/click behavior without competing visual-mesh events.
- Added an initial `Scroll to play the film` cue and replaced the institutional Hero deck with a visitor-facing invitation.

### Validation
- Real-browser checks passed for direct Roadway selection, Sidewalk selection while a Receipt was open, and rapid three-restaurant replacement with only the final record displayed.
- In the real reduced-motion browser, the Hero visibly played from 0 seconds, remained at scrollY 0 during playback, then paused exactly at 3.28 seconds with the complete first caption.
- `npm test`: 14/14 passed.
- `npm run build`: passed; the existing Three.js chunk warning remains.

## 2026-09-17 — Collapse 02–04 into one reversible three-state 3D flow

### What changed
- Deleted the intermediate `landmark-focus` mode. A single Landmark selection now moves the existing miniature to the center, dollies the camera and reveals nearby restaurants without a page change.
- Standardized the interaction model to `all-landmarks → nearby → restaurant-detail`. Upward wheel/trackpad input reverses exactly one state per gesture; continued upward scrolling reverses the next state.
- Removed competing Back controls from Nearby and Receipt. Receipt × and Escape still provide accessible one-layer exits, but camera movement and scroll are the primary spatial navigation.
- Added a constrained two-axis exhibition drag for an orbit-like view of all 12 Landmarks while keeping the page wheel native.
- Kept Landmark and restaurant objects mounted through transitions. Detail lifts the selected instance and dims the surrounding instances with per-instance color rather than replacing the scene.
- Simplified hash/history restoration to the same three states and removed the retired `landmark-focus` phase from visibility tests and JSDoc.

### Validation
- Real-browser flow passed: All Landmarks → select DUMBO → Nearby → select LOVE & DOUGH → Receipt → scroll up to Nearby → scroll up to All Landmarks.
- `npm test`: 14/14 passed.
- `npm run build`: passed; the existing Three.js chunk warning remains.

## 2026-09-17 — Fix restaurant reselection, Nearby overlap and missing 02 context

### What changed
- Removed the state guard that discarded restaurant selections once a receipt was open. A second restaurant now replaces the current receipt and uses `replaceState`, avoiding a useless history entry for every switch.
- Made visible instanced models and their enlarged invisible proxies share hover and selection handlers. The selected restaurant keeps its double-ring indicator even after the pointer leaves.
- Replaced the crowded distance spiral with three deterministic rings and a higher, wider nearby camera. Sidewalk tables and Roadway sheds remain large enough to identify but no longer stack on top of one another.
- Fresh Hero journeys no longer restore a stale landmark unless the initial URL is explicitly `#landmarks`, `#nearby` or `#detail`; 02 therefore opens as the complete Landmark Selection exhibition.
- Added a dedicated `1800px` hold for the `NEW YORK EATS OUTSIDE` explanation before its paper dissolve into 02.

### Validation
- Real-browser checks passed for 02 All Landmarks restoration, separated 24-object Nearby layout, persistent hover/selection rings, in-detail restaurant replacement and the extended Hero title hold.
- `npm test`: 14/14 passed.
- `npm run build`: passed; the existing Three.js chunk warning remains.

## 2026-09-17 — Cinematic Hero pacing verified in the real browser

### What changed
- Replaced the compressed Hero timing with explicit cinematic phases: `260px/video-second`, `520px` approach, `320px` settle, `220px` caption entrance, `2200px` hold, `300px` exit and `scrub: 1.35`.
- Gave video seeking one GSAP playhead and made ScrollTrigger use the exact calculated pixel end. This fixes the previous mismatch where a taller DOM section still mapped onto a much shorter animation range.
- Added per-chapter dolly/pan transforms and eased deceleration into each important frame. Caption holds freeze the video before text enters, then accelerate away only after text exits.
- Added protection for large wheel/trackpad bursts without intercepting ordinary page scrolling. Reduced-motion keeps the same content order but bypasses active scroll correction.
- Extended the Hero-to-Landmark handoff to `1500px`: paper wash now establishes contrast before the visitor explanation appears, while the final video frame subtly dollies and dissolves into the already-mounted Landmark exhibition.

### Browser measurements
- At the 898px browser scroll increment, the first gesture reached 3.19s without flashing text; the second reached the frozen 3.28s frame with the full first caption.
- A 3592px fast scroll still landed on the first caption at 3.28s. The next 3592px landed on `CENTRAL PARK` at 7.29s. Reversing restored the previous caption and frame.
- The final-frame wash, Sidewalk/Roadway explanation, Canvas cross-dissolve and 02 exhibition were visually inspected with no black frame or empty transition.

### Validation
- `npm test`: 14/14 passed.
- `npm run build`: passed; the existing Three.js chunk-size warning remains.

## 2026-09-17 — Smooth Hero dissolve and Landmark-first continuous ExploreStage

### What changed
- Removed Hero scroll settling and every active scroll-position correction. Hero now uses `210px` per video second, `420px` caption dwell and `scrub: 0.65`; captions hold video time without scroll-jacking.
- Added `hero-scroll.mp4`, a 30fps H.264 faststart encode with roughly 0.25-second keyframes, while retaining the original video as an automatic fallback.
- Deleted the portal/window transition. The last frame now desaturates into a temporary paper wash that fades away as the existing Landmark Canvas enters behind it. The handoff also explains Sidewalk versus Roadway dining before exploration.
- Replaced the CTA-gated 02/03 structure with one ExploreStage: first landmark activation focuses the persistent object; activating it again enters Nearby; blank-space selection exits focus; selecting another landmark changes focus.
- Fixed the landmark-to-Hero jump by making initial hash restoration one-shot and independent from landmark selection. Exploration state changes update history without scrolling the page.
- Enlarged and tightened Nearby restaurant objects, retained 1.6× proxy hit areas, and added a shared animated focus ring, lift, scale and tooltip. The first restaurant selection opens its receipt directly.
- Removed the always-visible restaurant list. Added Previous/Next controls and a collapsed Browse-all disclosure for keyboard and name-based access.
- Added the compact `Save places as you explore` Plan cue to Nearby, with a live saved count and direct Plan entry.
- Improved focused-landmark composition by moving the selected miniature away from the left copy, plus a dedicated hit area. Mobile focus and Nearby layouts were checked at 390px.

### Validation
- `npm test`: 14/14 passed.
- `npm run build`: passed.
- Browser walkthrough passed: Hero scrub → dissolve → focus landmark → activate again → select a 3D restaurant → receipt → back → Plan cue.
- Verified stale `#intro` landmark activation keeps the same `scrollY`, direct 3D restaurant selection opens the matching record, and the page still contains one Canvas.

## 2026-09-17 — Continuous spatial flow, Hero pixel pacing, and 02–05 interaction closure

### What changed
- Rebuilt Hero pacing around explicit pixel constants (`180px/video-second`, `280px` caption dwell, `150px` soft-settle radius) and a dynamically calculated section height. Video, caption timestamps and portal design are unchanged.
- Landmark selection now uses a collapsed side drawer. Selecting a landmark only focuses it; the explicit `Explore dining around…` CTA unlocks 03. Direct or manual entry without confirmation shows a useful locked state.
- Kept the selected landmark mounted across 02 and 03 and morphs that same object into the nearby scene. Camera, object reveal and HTML copy are sequenced instead of appearing together.
- Rebuilt nearby object language as pale open sidewalk tables/umbrellas versus terracotta enclosed roadway sheds. Added 1.6× invisible instanced hit proxies and shared deterministic layout data for visuals, hit testing and tooltips.
- Reordered restaurant detail for visitor needs, added Save/Unsave, consistent Close/Back cleanup and keyed receipt lifecycle.
- Added an independent saved-restaurant candidate rail, itinerary slot badges, auto-save on assignment, landmark snapshots, empty state and a clearly labelled straight-line SVG overview.
- Persisted landmark, explored landmark, saved restaurants and itinerary context in session storage. A direct `#nearby` link without landmark context now returns to `#landmarks`; restaurant detail is intentionally not restored.

### Validation
- `npm test`: 14/14 passed.
- `npm run build`: passed.
- Browser walkthrough passed: locked 03 → landmark focus → CTA → nearby → detail → save/add → back → Plan.
- Verified one Canvas and computed Hero height of 6811px for the 19.435s video at a 720px viewport.

## 2026-09-16 — 01 Hero: diagnosed "video never plays" — no code bug found

User reported the video never played at all. Investigated all 7 items they listed (metadata/duration, ScrollTrigger creation, trigger start/end, whether the browser blocks the `currentTime` tween, reducedMotion misdetection, video load success, `hero.mp4` path) using an isolated standalone GSAP+video test page (same `hero.mp4`, no React/no reducedMotion gate) — confirmed the core mechanism works exactly as intended (scroll progress 0.464 → `currentTime` 9.02/19.44, matching the linear mapping precisely). Root cause: the browser being used to review reports `prefers-reduced-motion: reduce`, which `VideoHero` correctly (per the original spec, which explicitly asked for a reduced-motion poster fallback) uses to skip the entire GSAP/video setup and show a static poster instead — this is the fallback working as designed, not a playback failure. No code was changed as a result of this investigation (a temporary diagnostic override of the reducedMotion prop was used to confirm the real component too, then fully reverted).

## 2026-09-16 — 01 Hero: chaptered scroll-pause captions (replaces flash-in/out)

### What changed
Replaced the caption mechanism with a scroll-distance-based chapter/dwell model, and updated the actual caption content/timing:

- `src/data/heroCaptions.js`: retimed to `{7.29 CENTRAL PARK}`, `{11.30 DINING MOVES OUTSIDE}`, `{14.42 TIMES SQUARE}`, `{18.43 BROOKLYN WATERFRONT}`. **A 5th chapter at 03.28s was requested but no title/subtitle text was given for it** — left a `TODO` comment in the file; adding it later is a one-line array entry, nothing else changes.
- `src/components/VideoHero.jsx`: the GSAP timeline is now built as a sequence of `[advance video to chapter.time] → [dwell: no tween touches currentTime for a fixed scroll-distance slice (`DWELL_UNIT = .06`), caption fades in/out within that slice] → next chapter`, repeated per chapter, computed from the sorted `HERO_CAPTIONS` array. This is scroll-distance-based, not timed: stop scrolling mid-dwell and the video and caption just stay exactly where they are — no auto-advance, no setTimeout.
- After the last chapter's dwell, one final advance segment takes the video from that chapter's time to its true end (19.43s) with **no caption attached** — a clean, silent gap before the portal sequence starts (previously the last caption's fade-out overlapped almost directly with the portal beginning).
- Advance-segment lengths are computed proportionally to real video-seconds elapsed (not fixed), so pacing stays even regardless of how unevenly the chapters are spaced in the source video.

### Why
Previous version tied each caption to a single instant (fade in/out around one point) while the video kept advancing continuously through it — user wants discrete "chapters": scroll into a chapter's time and the video holds there for a beat (caption readable, own scroll distance) before continuing, and wants the final video-to-portal handoff caption-free so the last chapter doesn't visually blur into the title stage.

### Files changed
- `src/data/heroCaptions.js`, `src/components/VideoHero.jsx`. Portal/reveal visuals (previous entry) untouched.

### Validation performed
Temporarily forced `reducedMotion={false}` on the `<VideoHero>` call site and exposed the GSAP timeline on `window` for direct inspection — **both fully reverted after testing, zero net diff from this**. Confirmed on the real component (not just in isolation):
- `scrollY=400` (inside chapter 1's dwell window) → `video.currentTime` pinned at exactly `7.29`, "CENTRAL PARK" caption visible.
- `scrollY=530` (past that dwell, mid-advance toward chapter 2) → `currentTime=8.68`, matches the proportional-advance formula to three decimal places, no caption visible.
- `scrollY=1470` (past the last chapter's dwell, in the tail advance toward true end) → `currentTime=19.435` (true duration), **no caption visible**, portal already starting to grow (63px wide) — confirms the clean gap.
`npm run build` / `npm test` — pass, 13/13.

## 2026-09-16 — 01 Hero: replace shrink-to-card portal with grow-through-window portal

### What changed
User reviewed the first Hero pass and rejected the ending transition: it read as "shrink the video into a card," not "walk through a window." Replaced it.

- The video (`.video-hero__video-layer`) no longer scales or moves at all — it stays a normal full-bleed, static background the whole time, exactly as before the portal starts.
- New `.video-hero__portal`: a separate element with a visible border ("frame edges", 26px, plus an inset highlight and a heavy drop shadow for depth) and a `--paper`-colored interior — i.e. a window whose far side is the space the story is about to arrive in, not a copy of the video. It appears small and centered right as the video's last frame freezes, then its `width`/`height` grow (via GSAP, still inside the same scrubbed timeline) from `4vw × 3vw` to `260vw × 220vh` — well past the viewport in every direction — so the frame's own edges scroll out of view rather than the window shrinking away. That reads as moving toward and through an opening.
- Once the portal has grown past the viewport, both the (now fully hidden-behind-it) video layer and the portal itself are set `visibility: hidden` — nothing left to paint — and only then does the `NEW YORK EATS OUTSIDE` headline block fade in, on its own layer, at its normal readable size (it was never a child of the scaling portal, so it never inherits the portal's oversized scale).
- Segment boundaries (fractions of the section's total scroll): video scrub 0→.6, portal grow .6→.85, headline fade .88→1 (holds to the end of the section as the "breathing" beat before handing off to `02`).

### Why
Same brief as before, corrected: "dimensional window/portal, camera moves forward through it until frame edges leave the viewport" is a different motion than "shrink into a frame" — the fix is a different pair of animated elements (growing portal + independent headline fade), not a retune of the old one.

### Files changed
- `src/components/VideoHero.jsx` — replaced the single scaling `.video-hero__frame` (which wrapped the video and shrank) with `.video-hero__video-layer` (static, never animated) + `.video-hero__portal` (new, grows).
- `src/styles.css` — replaced `.video-hero__frame` with `.video-hero__video-layer` and added `.video-hero__portal`.

### Still not changed
`02`–`05`, all data logic, `03 Nearby`/`04 Detail` — untouched, per instruction.

### Known issues
- Same as the previous entry: this session's browser tool forces `prefers-reduced-motion: reduce`, so the animated portal-grow sequence still hasn't been machine-verified end to end — only build/tests/reduced-motion-path/no-console-errors were checked here. The user is reviewing the animated result directly in their own browser.
- Section structure (one sticky container, `02` only appears once its scroll budget is exhausted) is unchanged from the previous pass, so the "Hero and 02 never simultaneously visible" guarantee still holds structurally — it was not a separate DOM-overlap bug, and nothing in this fix touches that mechanism.

### Validation performed
- `npm run build` / `npm test` — pass, 13/13.
- Browser: reduced-motion path (poster + immediate headline) still renders with zero console errors after the swap.

## 2026-09-16 — 01 Hero: scroll-scrubbed video replaces 3D diorama + DINE WITH A VIEW

### What changed
- New `01 Hero`: a single `<video>` (`public/assets/hero/hero.mp4`, copied from the user-supplied `Clip 1.mp4`) whose `currentTime` is driven directly by scroll position via a GSAP `ScrollTrigger` (`scrub: true`) — down scrolls forward, up reverses, stopping holds the frame. No autoplay, no Lenis, native scroll only.
- Three captions (`CENTRAL PARK` / `TIMES SQUARE` / `BROOKLYN WATERFRONT`) fade in/out in lockstep with the same scrubbed timeline, at scroll-mapped points derived from each caption's configured video-time.
- After the last caption, a portal/window transition (the video frame scales down with growing corner radius against the page's paper background) leads into a static reveal: `NEW YORK EATS OUTSIDE` / deck / `Scroll to explore ↓`. Only past that point does native scroll continue into `02 Landmark Selection` — never simultaneously full-screen with it.
- `DINE WITH A VIEW` (`ThreeDTextReveal`/`#text-reveal`) is disabled, not deleted — per the user's "temporarily" framing, `ThreeDTextReveal.jsx` and `resolveRevealPhase` (in `sceneState.js`) are left in place but unused, so re-adding it later is a small JSX/import change, not a rewrite.
- `prefers-reduced-motion: reduce` skips all GSAP/ScrollTrigger setup entirely: shows a static poster frame (`hero-poster.jpg`, extracted from the video) with the headline visible immediately, section height collapses to `100dvh`.
- The old 3D Hero (`HeroDiorama`, taxi/pigeons/pointer-parallax) and its now-pointless `CameraRig` phase branches (`intro`/`intro-exit`/`text-reveal`) are removed. `src/scene/CityScene.jsx` — which after an earlier cleanup round contained nothing but `HeroDiorama` and its helpers — is deleted outright, only after confirming zero remaining references and a green build/test.

### Why
User provided a finished cinematic video and wants it to replace the procedural 3D Hero and the `DINE WITH A VIEW` text reveal, with a specific scroll-scrubbed + portal-transition interaction model, while leaving `02–05` and all data logic untouched.

### Files changed
- `src/App.jsx` — swapped the old `#intro` hero-section + `#text-reveal` block for `<VideoHero />`; removed `'text-reveal'` from `STORY_SECTIONS` and the now-dead `resolveRevealPhase`/`ThreeDTextReveal`/`ArrowDown` imports.
- `src/scene/TravelScene.jsx` — removed `HeroDiorama` import/call and the dead intro-phase `CameraRig` branches; `02`/`03` camera and interaction logic untouched.
- `src/scene/sceneState.js` — dropped the now-unused `hero` key from `sceneVisibility`; `resolveRevealPhase` left in place, unused.
- `src/scene/sceneState.test.js` — updated the "scene roots mutually exclusive" assertion to drop the removed `hero` key (was `Number(visibility.hero) + ...`, now just `landmarks`/`nearby`).
- `src/styles.css` — added `.video-hero*` rules and a reduced-motion rule for `.video-hero__reveal`; old `.hero-section`/`.hero-copy`/`.hero-deck`/`.hero-stat`/`.scroll-cue` rules left in place (reused by the new reveal block, not orphaned).

### Files added
- `src/components/VideoHero.jsx`, `src/data/heroCaptions.js` (the editable `{ time, title, subtitle }` caption config — this is the only file to touch to retime/retitle/add captions), `public/assets/hero/hero.mp4`, `public/assets/hero/hero-poster.jpg`.

### Files deleted
- `src/scene/CityScene.jsx` (zero remaining references, confirmed by grep before deleting).

### Data changes
None. `dining.js`, `nearby.js`, `cuisine.js`, `landmarks.js`, `scripts/sync-data.mjs` untouched.

### Known issues
- Could not visually verify the animated scroll-scrub/caption/portal sequence inside this session's browser tool — its environment forces `prefers-reduced-motion: reduce` at the OS level, which this feature explicitly (and correctly) treats as "show the static fallback," so every automated check exercised the reduced-motion path, not the animated one. Confirmed instead: build/tests green, reduced-motion path renders correctly with zero console errors, `hero.mp4`/`hero-poster.jpg` serve correctly (200, correct byte size), no new horizontal overflow at 375px, and `02 Landmark Selection` still functions after the shared-file edits. **The animated path needs a real-browser check** (with reduced-motion off) before considering this fully done — scroll distance (currently 340vh) and the exact portal-transition feel are explicitly tuning targets, not finished values.
- Chunk-size build warning (`App-*.js` >500kB) is pre-existing, unrelated to this change.

### Validation performed
- `npm run build` — passes.
- `npm test` — 13/13 pass (one test file updated for the `hero` key removal, no data-layer tests touched).
- `grep` confirmed zero references to `CityScene`/`HeroDiorama` before deleting the file, then re-ran build+test green after deleting.
- Browser: reduced-motion path renders poster + headline immediately, no console errors, `hero.mp4`/poster both return 200; clicked into `02 Landmark Selection` post-Hero and confirmed it still works (Central Park selection, "← Back to all landmarks" appears) — no regression from the shared `TravelScene.jsx`/`sceneState.js` edits.

## 2026-09-16 — Fix 02/03/04 navigation state (Back/Close, Receipt lifecycle, label overlap)

### What changed
- `Receipt` (Restaurant Detail) is no longer a permanent global overlay. It now only renders when a restaurant is selected **and** the current scroll phase is `nearby-enter`/`nearby`/`detail`. A `useEffect` also force-clears `selectedRestaurant` the instant the phase leaves that set, as a second safety net against stale detail views.
- Added two explicit navigation actions and their UI entry points:
  - **← Back to landmark** (shown in the `03 · Nearby` copy panel whenever a landmark is selected): clears the selected restaurant, scrolls to `#landmarks`, keeps the landmark selected (lands on the landmark-focus view).
  - **← Back to all landmarks** (shown in the `02 · Landmark selection` copy panel whenever a landmark is selected): clears selected restaurant, restaurant/landmark hover, and the selected landmark; scrolls to `#landmarks` (lands on the 12-landmark browse view).
- Landmark 3D name labels (`<Html>` tags floating over each miniature) now only render for the hovered/keyboard-focused/selected landmark, instead of all 12 simultaneously. `hoveredLandmarkId` already unifies mouse hover and keyboard focus (the HTML sidebar buttons call the same setter from `onMouseEnter` and `onFocus`), so no new state was needed.
- `hoveredRestaurant` (local state inside `TravelScene`, previously never reset) is now cleared via a `useEffect` whenever the nearby 3D group unmounts (`visibility.nearby` goes false), preventing a stale hover tooltip from reappearing on remount.
- `.landmark-index` (the HTML landmark list) now has an opaque background at all widths, fixing a visual overlap with the 3D landmark labels that was previously only patched for ≤699px and left uncovered in the 700–1099px tablet range.

### Why
User's Master Plan flagged that once a restaurant or landmark was selected, there was no way to close/return without leaving stale UI on screen: the Restaurant Detail card was a `position: fixed` overlay controlled only by `selectedRestaurant` truthiness (not tied to scroll phase at all), so scrolling away from it left it floating on top of Hero/Landmark content. Separately, once a landmark was selected there was no code path to ever clear `selectedLandmarkId`, so the "browse all 12 landmarks" view became permanently unreachable for the rest of the session. All 12 landmark labels rendering at once, plus a transparent `.landmark-index` at tablet widths, compounded into unreadable overlapping text on narrower screens.

### Files changed
- `src/App.jsx` — Receipt render condition + phase-cleanup effect, `backToLandmark`/`backToAllLandmarks` actions, two new Back buttons.
- `src/scene/TravelScene.jsx` — landmark label visibility condition, `hoveredRestaurant` cleanup effect.
- `src/styles.css` — `.landmark-index` background.

### Interaction/state changes
- `selectedLandmarkId` can now be cleared (previously write-once for the session).
- `selectedRestaurant` clearing is now driven by phase, not only by the Receipt's own close button.
- No new state variables were introduced; every fix reuses `selectedLandmarkId`, `selectedRestaurant`, `hoveredLandmarkId`, `hoveredRestaurant` (local), and the existing scroll-derived `phase`.

### Data changes
None. `dining.js`, `nearby.js`, `cuisine.js`, `landmarks.js`, `scripts/sync-data.mjs` were not touched.

### What was intentionally NOT changed
Hero visuals/content, the nearby radius algorithm, cuisine matching, data fetching, restaurant data, 3D asset styling/colors, `sceneState.js` (its `resolveLandmarkPhase`/`sceneVisibility` already handled everything correctly once `selectedLandmarkId` could actually become `null` again — no changes needed there).

### Known issues
- The scroll-driven `phase` is recomputed only on native `scroll`/`resize` events. When a Back action's `scrollIntoView({behavior:'smooth'})` finishes animating, the very last position update can occasionally need one more real scroll tick before `phase` catches up (observed in automated testing with JS-triggered scrolling; real user scroll input did not reproduce a stuck state in manual testing). This is a pre-existing trait of `useStoryPosition` (also present in the original `chooseLandmark` flow), not something introduced by this change, and was left alone per the "don't rewrite the scroll architecture" constraint.

### Validation performed
- `npm run build` — passes, no errors.
- `npm test` — 13/13 pass (data-layer tests untouched by this change).
- Manual browser walkthrough of the full loop: All Landmarks → Landmark → Nearby → Detail → Close → Nearby → (reopened Detail, scrolled away without clicking Close, confirmed it auto-cleared) → Back to Landmark → Back to All Landmarks. Verified at each step: no residual Receipt, no residual hover/labels, `selectedLandmarkId`/`selectedRestaurant`/`hoveredLandmarkId` correctly null where expected, phase/camera state correct.
- Verified tablet (768px) and mobile (375px): `.landmark-index` list is now fully legible with an opaque background, and no more than one landmark label is ever visible at once (zero, when nothing is hovered/selected).
# 2026-09-16 — Fix Hero video being replaced by poster in reduced-motion browsers

- Root cause confirmed in the actual localhost tab: `matchMedia('(prefers-reduced-motion: reduce)').matches` was `true`, so `VideoHero` returned before creating ScrollTrigger and did not render a video element at all.
- The Hero now always renders and scrubs the video. Reduced motion keeps the same user-controlled timeline but removes caption translation and turns the portal zoom into a full-frame crossfade.
- Added defensive one-time metadata initialization, explicit `pause()`/zero seek, and a ScrollTrigger refresh after the video duration becomes available.
- Hero scroll budget is now `500vh`, giving five chapter dwells readable physical scroll distance.
- Added the missing 03.28s aerial chapter: `THE CITY COMES INTO VIEW / A table is never far away.`
- Verified in the real reduced-motion browser after all five chapters were present: at scrollY 280 the video held at 3.28s with `THE CITY COMES INTO VIEW`; at 760 it held at 7.29s with `CENTRAL PARK`; reverse scroll returned to 0s; and at 3592 the video was exactly 19.435s, all captions were hidden, and the opening title was fully visible. No console errors.
