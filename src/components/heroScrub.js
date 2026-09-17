export const dampScrubTime = (current, target, deltaSeconds, smoothingSeconds = 0.1) => {
  const delta = Math.max(0, Math.min(deltaSeconds, 0.1));
  const smoothing = Math.max(0.001, smoothingSeconds);
  const alpha = 1 - Math.exp(-delta / smoothing);
  const next = current + (target - current) * alpha;
  return Math.abs(target - next) < 0.001 ? target : next;
};
