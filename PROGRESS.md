# Progress

## CURRENT STATE — 2026-09-17

Current flow:

```
01 Hero video
→ paper dissolve
→ 02 All Landmarks
→ 03 Landmark + Nearby Dining
→ 04 Restaurant Detail layer
→ 05 Plan Your Day
→ 06 Data Source
```

The project remains a Vite/React single-page story with one React Three Fiber Canvas. Sections 02–04 are one sticky spatial ExploreStage with exactly three states: `all-landmarks`, `nearby`, and `restaurant-detail`.

## Completed in the latest pass

- Hero now uses scroll-scrubbed chapter targets with continuous video catch-up instead of hard frame-by-frame assignment. Forward travel uses native playback-rate correction, stopping holds the frame, and reverse scroll eases the playhead backward.
- The five existing caption timestamps remain unchanged. Each chapter has an approach, frozen settle, caption entrance, long readable hold and caption exit; a single continuous wheel/trackpad burst is capped at `720px`, so it cannot skip a complete chapter.
- Restored the dimensional portal requested for the final 19.43-second frame. The portal expands through depth, then the `NEW YORK EATS OUTSIDE` title holds before the Landmark scene is revealed.
- Restaurant selection is now immediate on the invisible proxy's left-button `pointerdown`. The visible InstancedMesh is excluded from raycasting, removing the unreliable pointer-up/click re-hit that caused models to hover but not open a Receipt in real use.
- The Nearby copy panel is now click-through except for its actual controls. Visible restaurant models behind headings or transparent layout space therefore remain directly selectable. The Receipt occupies only its narrow paper area and never installs a full-screen interaction blocker.
- Canvas click selection is tied to the currently hovered restaurant with a stable six-pixel gesture threshold, so a re-render between pointer-down and pointer-up cannot discard the restaurant selection.
- Receipt presentation now has a stable shell and explicit `entering / visible / exiting` phases. Choosing another restaurant immediately moves the 3D selection, fades the current ticket and swaps to the latest pending record without returning to Nearby.
- Real-browser checks passed for opening a Roadway Receipt and then clicking a visible Sidewalk model behind it to replace the ticket without resetting the scene.
- Visual restaurant meshes are excluded from raycasting; the enlarged per-instance proxies now provide one consistent hover/click surface for every Sidewalk and Roadway record.
- The Hero now shows `Scroll to play the film`, keeps video playback in reduced-motion environments, and uses the visitor-facing deck: “Find your table in the city—open-air on the sidewalk or sheltered along the curb.”

- Removed `landmark-focus` and the second-click gate. Any of the 12 Landmark miniatures now zooms directly into the same persistent object and reveals nearby dining around it.
- Added one-layer reverse navigation for upward wheel/trackpad gestures: Detail → Nearby → All Landmarks. A complete inertial gesture can consume only one layer, so it cannot collapse two states at once.
- Removed the visible Nearby back button and the duplicate Receipt back control. Scroll-up, Escape and the Receipt × all follow the same one-layer state model.
- All Landmarks supports horizontal rotation plus a small clamped vertical orbit gesture on blank 3D space. Wheel remains page navigation.
- Restaurant Detail keeps the same Landmark and restaurant instances mounted. The selected restaurant lifts/scales forward while surrounding instances receive a subtle neutral dim.
- Restaurant selection now remains active in both `nearby` and `restaurant-detail`: selecting a second 3D restaurant replaces the open receipt in place instead of being ignored. Visual meshes and their 1.6× proxies share the same pointer handlers, so both the visible object and its enlarged hit area select reliably.
- Nearby placement now uses three deterministic rings (6 / 8 / remaining) with substantially wider spacing and a higher camera. The 24 models no longer collapse into one cluster; the shared focus indicator persists for the selected record and hover tooltips have a stronger editorial outline.
- The stored landmark is only restored when the initial URL is part of the exploration flow. A fresh Hero → 02 journey therefore lands on the complete All Landmarks exhibition rather than an unexplained old focus state.
- `NEW YORK EATS OUTSIDE` remains a deliberate final title state after the fifth chapter. It holds for at least 1.8 seconds and requires a new gesture before the dissolve into 02.
- Each chapter now follows native playback → eased deceleration → frozen settle → caption reveal → minimum reading hold → caption exit → native playback. No ScrollTrigger playhead or scroll-position correction remains.
- `public/assets/hero/hero-scroll.mp4` is optimized for seeking with short GOPs; `/assets/hero/hero.mp4` remains the load-error fallback.
- The portal/window was deleted. Video, paper wash and the existing Canvas cross-dissolve, with no intentional blank frame.
- The Hero ending now explains Sidewalk and Roadway outdoor dining with matching visual keys before Landmark exploration.
- `exploreMode` now drives only `all-landmarks`, `nearby` and `restaurant-detail` without changing page scroll position.
- First landmark activation focuses the persistent miniature; second activation enters Nearby. Focused miniatures move away from the copy, and the 3D background exits focus.
- Initial hash restoration runs once. Landmark selection no longer reruns the stale `#intro` scroll restore; Back/Forward synchronizes exploration mode separately.
- Nearby objects are larger and more tightly clustered. Sidewalk tables and Roadway sheds keep distinct geometry, 1.6× proxy hit targets and deterministic ID mapping.
- Hover/selection uses one shared double-ring indicator plus lift, scale, tilt and a pointer-safe tooltip.
- Restaurant objects open receipts on first selection. The default large list was replaced by Previous/Next and a collapsed Browse-all disclosure.
- Nearby introduces Plan Your Day early with a live saved count and a direct Plan action.
- Mobile layouts were inspected at 390×844 and the focused Canvas was moved below the copy to avoid control overlap.

## Validation

- `npm test`: 4 files, 14 tests passed.
- `npm run build`: passed.
- Manual desktop flow: landmark focus → second activation → Nearby → 3D restaurant → receipt → back.
- Manual responsive flow: 390px Landmark Focus and Nearby, including objects, collapsed browser and Plan cue.
- Real-browser Hero verification: the playhead froze at `3.279559s`; the first caption was fully visible during its hold; reverse scroll moved the playhead back to `2.592617s`.
- A fast 18-event wheel burst advanced only `840px` and reached about `2.33s`, confirming the gesture cap prevents a chapter skip.
- The final-frame transition was inspected at `19.398333s`: the portal was visible over the held film, followed by the paper wash and opening title.
- Manual 01→02 handoff audit: the final frame remains visible under an early paper wash, the Sidewalk/Roadway explanation becomes readable, the video dollies and fades, and the persistent Landmark Canvas resolves behind it without a blank frame.
- Manual 03/detail audit on DUMBO: a Roadway shed opened SWEETGREEN DUMBO; clicking a Sidewalk model behind the open ticket immediately replaced it with TOMMY'S BAR & BURGER.
- Final A → B → C browser audit passed without closing the Receipt: LOS TACOS AL PASTOR → LOVE & DOUGH → TOMMY'S BAR & BURGER. The URL remained `#detail`, the Landmark scene stayed mounted, and only one receipt/selection was active.
- Regression check: with the viewport in ExploreStage and URL still `#intro`, landmark activation preserved `scrollY` instead of jumping to Hero.
- One Canvas remains. Live data, nearby radius logic, cuisine matching, receipt, Saved and itinerary storage remain intact.

## Known limitations / next work

- Real View remains a neutral verified-media placeholder by design.
- Production build still reports the existing >500kB Three.js chunk warning; functionality is unaffected.
- The Hero/Canvas dissolve is tuned visually in the current browser, but does not yet have pixel-diff automation or automated wheel/trackpad timing coverage.
- The automated test suite still focuses on data and scene-state helpers; end-to-end pointer choreography is currently covered by the manual browser walkthrough.
