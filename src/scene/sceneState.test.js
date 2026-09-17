import { describe, expect, it } from 'vitest';
import { sceneVisibility } from './sceneState';

describe('continuous ExploreStage scene state', () => {
  it('preloads landmarks during the Hero handoff', () => {
    expect(sceneVisibility('landmark-enter')).toEqual({ landmarks: true, nearby: false });
  });

  it('keeps the selected landmark alive through nearby and detail', () => {
    ['nearby', 'detail'].forEach(phase => {
      expect(sceneVisibility(phase)).toEqual({ landmarks: true, nearby: true });
    });
  });

  it('does not mount nearby restaurants in the all-landmarks mode', () => {
    expect(sceneVisibility('landmark').nearby).toBe(false);
  });

  it('hides the 3D exploration world outside the story stage', () => {
    ['intro', 'plan', 'source'].forEach(phase => expect(sceneVisibility(phase)).toEqual({ landmarks: false, nearby: false }));
  });
});
