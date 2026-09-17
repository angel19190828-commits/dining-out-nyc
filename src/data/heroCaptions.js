/** @typedef {Object} HeroCaption
 * @property {number} time - seconds into /assets/hero/hero.mp4
 * @property {string} title
 * @property {string} subtitle
 */

/** @type {HeroCaption[]}
 * Each entry is a scroll "chapter": scroll advances the video toward `time`,
 * eases toward `time`, settles on the frame, then holds it through a dedicated
 * caption entrance, reading interval and exit before continuing. No caption
 * plays between the last chapter and the video's true end (19.43s) — that gap
 * leads into the title and paper-dissolve handoff.
 *
 * The 03.28s aerial establishes the city without forcing another place name;
 * the remaining four stops move between landmark and dining-language beats.
 */
export const HERO_CAPTIONS = [
  { time: 3.28, title: 'THE CITY COMES INTO VIEW', subtitle: 'A table is never far away.' },
  { time: 7.29, title: 'CENTRAL PARK', subtitle: 'Lunch beneath the trees.' },
  { time: 11.30, title: 'DINING MOVES OUTSIDE', subtitle: 'Tables spill beyond the restaurant.' },
  { time: 14.42, title: 'TIMES SQUARE', subtitle: 'Dining in the middle of the city.' },
  { time: 18.43, title: 'BROOKLYN WATERFRONT', subtitle: 'Dinner with Manhattan across the river.' }
];
