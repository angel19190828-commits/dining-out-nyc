import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO_CAPTIONS } from '@/data/heroCaptions';
import { publicUrl } from '@/publicUrl';
import { dampScrubTime } from './heroScrub';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = publicUrl('assets/hero/hero-scroll.mp4');
const POSTER_SRC = publicUrl('assets/hero/hero-poster.jpg');

export const VIDEO_SCROLL_PX_PER_SECOND = 420;
export const CHAPTER_APPROACH_PX = 520;
export const CHAPTER_SETTLE_PX = 260;
export const CAPTION_IN_PX = 300;
export const CAPTION_HOLD_PX = 1600;
export const CAPTION_OUT_PX = 360;
export const PORTAL_ENTER_PX = 1900;
export const TITLE_REVEAL_PX = 480;
export const TITLE_HOLD_PX = 1600;
export const LANDMARK_HANDOFF_PX = 900;
export const MAX_GESTURE_SCROLL_PX = 720;

const APPROACH_SECONDS = .6;
const SCRUB_SMOOTHING_SECONDS = .1;
const SEEK_INTERVAL_MS = 1000 / 30;
const SEEK_THRESHOLD_SECONDS = 1 / 90;
const CAMERA_FRAMES = [
  { scale: 1.045, xPercent: 0, yPercent: 0 },
  { scale: 1.07, xPercent: -1.1, yPercent: -.45 },
  { scale: 1.05, xPercent: .8, yPercent: -.7 },
  { scale: 1.075, xPercent: -.7, yPercent: .25 },
  { scale: 1.055, xPercent: .9, yPercent: -.35 }
];

export default function VideoHero({ reducedMotion }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const videoLayerRef = useRef(null);
  const washRef = useRef(null);
  const portalRef = useRef(null);
  const revealRef = useRef(null);
  const playCueRef = useRef(null);
  const captionRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return undefined;

    let context;
    let syncFrame = 0;
    let built = false;
    let cancelled = false;
    let displayedTime = 0;
    let lastFrameAt = performance.now();
    let lastSeekAt = 0;
    let gestureTotal = 0;
    let gestureDirection = 0;
    let lastWheelAt = 0;
    const mediaTarget = { time: 0 };

    const scheduleSync = callback => { syncFrame = requestAnimationFrame(callback); };

    const cancelSync = () => {
      if (!syncFrame) return;
      cancelAnimationFrame(syncFrame);
      syncFrame = 0;
    };

    const syncVideo = now => {
      if (cancelled) return;
      const target = Math.max(0, Math.min(video.duration || 0, mediaTarget.time));
      const deltaSeconds = (now - lastFrameAt) / 1000;
      lastFrameAt = now;
      displayedTime = dampScrubTime(displayedTime, target, deltaSeconds, SCRUB_SMOOTHING_SECONDS);

      if (
        !video.seeking &&
        now - lastSeekAt >= SEEK_INTERVAL_MS &&
        Math.abs(displayedTime - video.currentTime) >= SEEK_THRESHOLD_SECONDS
      ) {
        video.currentTime = displayedTime;
        lastSeekAt = now;
      }
      scheduleSync(syncVideo);
    };

    const normalizeWheel = event => {
      if (!built || event.ctrlKey) return;
      const rect = section.getBoundingClientRect();
      const max = section.offsetHeight - window.innerHeight;
      const local = window.scrollY - section.offsetTop;
      if (rect.bottom <= 0 || rect.top >= window.innerHeight || local < -2 || local > max + 2) return;

      const now = performance.now();
      const direction = Math.sign(event.deltaY);
      if (!direction) return;
      if (now - lastWheelAt > 150 || direction !== gestureDirection) gestureTotal = 0;
      lastWheelAt = now;
      gestureDirection = direction;
      event.preventDefault();

      const remaining = Math.max(0, MAX_GESTURE_SCROLL_PX - gestureTotal);
      if (!remaining) return;
      const step = Math.min(Math.max(18, Math.abs(event.deltaY)), 120, remaining);
      gestureTotal += step;
      window.scrollBy({ top: direction * step, behavior: 'auto' });
    };

    const normalizeKeys = event => {
      if (!built || !['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(event.key)) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      event.preventDefault();
      const reverse = event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && event.shiftKey);
      window.scrollBy({ top: reverse ? -360 : 360, behavior: reducedMotion ? 'auto' : 'smooth' });
    };

    const build = () => {
      const duration = video.duration;
      if (built || !Number.isFinite(duration) || duration <= 0) return;
      built = true;
      video.pause();
      video.currentTime = 0;
      displayedTime = 0;
      lastFrameAt = performance.now();

      const chapters = [...HERO_CAPTIONS].sort((a, b) => a.time - b.time);
      let measuredDistance = 0;
      let measuredTime = 0;
      chapters.forEach(chapter => {
        measuredDistance += Math.max(0, chapter.time - measuredTime - APPROACH_SECONDS) * VIDEO_SCROLL_PX_PER_SECOND;
        measuredDistance += CHAPTER_APPROACH_PX + CHAPTER_SETTLE_PX + CAPTION_IN_PX + CAPTION_HOLD_PX + CAPTION_OUT_PX;
        measuredTime = chapter.time;
      });
      measuredDistance += Math.max(0, duration - measuredTime) * VIDEO_SCROLL_PX_PER_SECOND;
      measuredDistance += PORTAL_ENTER_PX + TITLE_REVEAL_PX + TITLE_HOLD_PX + LANDMARK_HANDOFF_PX;
      section.style.setProperty('--hero-scroll-distance', `${Math.ceil(measuredDistance)}px`);

      context = gsap.context(() => {
        gsap.set(video, { scale: 1.035, xPercent: 0, yPercent: 0, transformOrigin: '50% 50%' });
        gsap.set(captionRefs.current, { opacity: 0, y: reducedMotion ? 0 : 18 });
        gsap.set(portalRef.current, { autoAlpha: 0, scale: .96 });
        gsap.set(revealRef.current, { autoAlpha: 0, y: reducedMotion ? 0 : 22 });
        gsap.set(playCueRef.current, { autoAlpha: 1 });

        const timeline = gsap.timeline({
          defaults: { overwrite: 'auto' },
          scrollTrigger: {
            id: 'hero-film',
            trigger: section,
            start: 'top top',
            end: () => `+=${Math.ceil(measuredDistance)}`,
            scrub: true,
            invalidateOnRefresh: true
          }
        });

        let cursor = 0;
        let videoTime = 0;
        timeline.to(playCueRef.current, { autoAlpha: 0, duration: 180, ease: 'power3.out' }, 0);

        chapters.forEach((chapter, index) => {
          const camera = reducedMotion ? { scale: 1.035, xPercent: 0, yPercent: 0 } : CAMERA_FRAMES[index % CAMERA_FRAMES.length];
          const travelEnd = Math.max(videoTime, chapter.time - APPROACH_SECONDS);
          const travelDistance = Math.max(0, travelEnd - videoTime) * VIDEO_SCROLL_PX_PER_SECOND;
          if (travelDistance > 0) {
            timeline.fromTo(mediaTarget, { time: videoTime }, { time: travelEnd, duration: travelDistance, ease: 'power1.inOut', immediateRender: false }, cursor)
              .to(video, { scale: camera.scale + (reducedMotion ? 0 : .018), xPercent: camera.xPercent * .72, yPercent: camera.yPercent * .72, duration: travelDistance, ease: 'power2.inOut' }, cursor);
            cursor += travelDistance;
          }

          timeline.fromTo(mediaTarget, { time: travelEnd }, { time: chapter.time, duration: CHAPTER_APPROACH_PX, ease: 'power3.out', immediateRender: false }, cursor)
            .to(video, { scale: camera.scale, xPercent: camera.xPercent, yPercent: camera.yPercent, duration: CHAPTER_APPROACH_PX, ease: 'power3.out' }, cursor);
          cursor += CHAPTER_APPROACH_PX + CHAPTER_SETTLE_PX;

          const caption = captionRefs.current[index];
          timeline.fromTo(caption,
            { opacity: 0, y: reducedMotion ? 0 : 18, scale: reducedMotion ? 1 : .985 },
            { opacity: 1, y: 0, scale: 1, duration: CAPTION_IN_PX, ease: 'power3.out', immediateRender: false }, cursor)
            .to(caption, { opacity: 1, duration: CAPTION_HOLD_PX, ease: 'none' }, cursor + CAPTION_IN_PX)
            .to(caption, { opacity: 0, y: reducedMotion ? 0 : -12, duration: CAPTION_OUT_PX, ease: 'power3.out' }, cursor + CAPTION_IN_PX + CAPTION_HOLD_PX);
          cursor += CAPTION_IN_PX + CAPTION_HOLD_PX + CAPTION_OUT_PX;
          videoTime = chapter.time;
        });

        const tailDistance = Math.max(1, (duration - videoTime) * VIDEO_SCROLL_PX_PER_SECOND);
        timeline.fromTo(mediaTarget, { time: videoTime }, { time: Math.max(0, duration - .035), duration: tailDistance, ease: 'power2.inOut', immediateRender: false }, cursor)
          .to(video, { scale: 1.035, xPercent: 0, yPercent: 0, duration: tailDistance, ease: 'power2.inOut' }, cursor);
        cursor += tailDistance;

        timeline.fromTo(portalRef.current,
          { autoAlpha: 0, scale: .96 },
          { autoAlpha: 1, scale: 1, duration: PORTAL_ENTER_PX * .18, ease: 'power3.out', immediateRender: false }, cursor)
          .to(portalRef.current, { scale: reducedMotion ? 1.08 : 4.8, duration: PORTAL_ENTER_PX * .82, ease: 'power2.inOut' }, cursor + PORTAL_ENTER_PX * .18)
          .to(video, { scale: reducedMotion ? 1.035 : 1.12, duration: PORTAL_ENTER_PX, ease: 'power2.inOut' }, cursor)
          .to(washRef.current, { opacity: 1, duration: PORTAL_ENTER_PX * .36, ease: 'power2.out' }, cursor + PORTAL_ENTER_PX * .64)
          .to(videoLayerRef.current, { opacity: 0, duration: PORTAL_ENTER_PX * .28, ease: 'power2.out' }, cursor + PORTAL_ENTER_PX * .72);
        cursor += PORTAL_ENTER_PX;

        timeline.to(portalRef.current, { autoAlpha: 0, duration: TITLE_REVEAL_PX * .4, ease: 'power3.out' }, cursor)
          .fromTo(revealRef.current,
            { autoAlpha: 0, y: reducedMotion ? 0 : 22 },
            { autoAlpha: 1, y: 0, duration: TITLE_REVEAL_PX, ease: 'power3.out', immediateRender: false }, cursor)
          .to(revealRef.current, { autoAlpha: 1, duration: TITLE_HOLD_PX, ease: 'none' }, cursor + TITLE_REVEAL_PX);
        cursor += TITLE_REVEAL_PX + TITLE_HOLD_PX;

        timeline.to(revealRef.current, { autoAlpha: 0, y: reducedMotion ? 0 : -18, duration: LANDMARK_HANDOFF_PX * .38, ease: 'power3.out' }, cursor)
          .to(washRef.current, { opacity: 0, duration: LANDMARK_HANDOFF_PX * .72, ease: 'power2.inOut' }, cursor + LANDMARK_HANDOFF_PX * .28);
      }, section);

      scheduleSync(syncVideo);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    if (video.readyState >= 1) build();
    else video.addEventListener('loadedmetadata', build, { once: true });
    window.addEventListener('wheel', normalizeWheel, { passive: false });
    window.addEventListener('keydown', normalizeKeys);

    return () => {
      cancelled = true;
      cancelSync();
      video.pause();
      context?.revert();
      section.style.removeProperty('--hero-scroll-distance');
      video.removeEventListener('loadedmetadata', build);
      window.removeEventListener('wheel', normalizeWheel);
      window.removeEventListener('keydown', normalizeKeys);
    };
  }, [reducedMotion]);

  return <section id="intro" ref={sectionRef} className="video-hero"><div className="video-hero__sticky">
    <div className="video-hero__video-layer" ref={videoLayerRef}><video ref={videoRef} className="video-hero__video" src={VIDEO_SRC} poster={POSTER_SRC} muted playsInline preload="auto" aria-label="New York outdoor dining film controlled by page scroll" />{HERO_CAPTIONS.map((caption, index) => <div key={caption.title} className="video-hero__caption" ref={element => { captionRefs.current[index] = element; }}><strong>{caption.title}</strong><span>{caption.subtitle}</span></div>)}<p className="video-hero__play-cue" ref={playCueRef}><span />Scroll through the film</p></div>
    <div className="video-hero__portal" ref={portalRef} aria-hidden="true"><span /></div>
    <div className="video-hero__paper-wash" ref={washRef} />
    <div className="video-hero__reveal" ref={revealRef}><p className="eyebrow">01 · New York eats outside</p><h1>New York<br />eats outside</h1><p className="hero-deck">See how New York City restaurants extend into sidewalks and streets.</p><p className="scroll-cue"><span />Scroll to explore</p></div>
  </div></section>;
}
