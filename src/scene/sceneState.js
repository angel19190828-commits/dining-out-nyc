export function sceneVisibility(phase) {
  return {
    landmarks: ['landmark-enter', 'landmark', 'nearby', 'detail'].includes(phase),
    nearby: ['nearby', 'detail'].includes(phase)
  };
}
