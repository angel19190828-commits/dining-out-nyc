import { describe, expect, it } from 'vitest';
import { dampScrubTime } from './heroScrub';

describe('dampScrubTime', () => {
  it('eases toward the target without overshooting in either direction', () => {
    expect(dampScrubTime(2, 8, 1 / 60)).toBeGreaterThan(2);
    expect(dampScrubTime(2, 8, 1 / 60)).toBeLessThan(8);
    expect(dampScrubTime(8, 2, 1 / 60)).toBeLessThan(8);
    expect(dampScrubTime(8, 2, 1 / 60)).toBeGreaterThan(2);
  });

  it('settles exactly on very small differences', () => {
    expect(dampScrubTime(3.2795, 3.28, 1 / 30)).toBe(3.28);
  });
});
