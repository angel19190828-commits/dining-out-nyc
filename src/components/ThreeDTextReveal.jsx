import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* Licensed React Bits Pro source is intentionally not reproduced here. This
 * local compatibility component can be replaced in-place after authentication. */
export default function ThreeDTextReveal({ items = [], className = '', textClassName = '', scrollDistance = '145vh', perspective = 1200, radiusOffset = .25, startRotation = -55, endRotation = 115, scrubSmoothing = .7, fontSize = 'clamp(4.75rem, 15vw, 13rem)', fontWeight = 800, gap = '.02em' }) {
  const root = useRef(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const context = gsap.context(() => {
      const lines = gsap.utils.toArray('.text-reveal__line', element);
      if (reduced) { gsap.set(lines, { opacity: 1, rotateX: 0, z: 0, yPercent: 0 }); return; }
      gsap.set(lines, { opacity: 0, rotateX: startRotation, z: -perspective * radiusOffset, yPercent: 35, transformOrigin: '50% 100%' });
      const timeline = gsap.timeline({ scrollTrigger: { trigger: element, start: 'top top', end: 'bottom bottom', scrub: scrubSmoothing, invalidateOnRefresh: true } });
      lines.forEach((line, index) => {
        timeline.to(line, { opacity: 1, rotateX: 0, z: 0, yPercent: 0, duration: .34, ease: 'none' }, index * .22)
          .to(line, { opacity: index === lines.length - 1 ? 1 : .18, rotateX: endRotation * .22, z: perspective * radiusOffset * .28, yPercent: -26, duration: .25, ease: 'none' }, index * .22 + .36);
      });
      timeline.to(lines, { opacity: 0, yPercent: -54, stagger: .035, duration: .18, ease: 'none' }, '+=.08');
    }, element);
    return () => context.revert();
  }, [endRotation, perspective, radiusOffset, scrubSmoothing, startRotation]);
  return (
    <section ref={root} className={`text-reveal ${className}`} style={{ minHeight: scrollDistance, '--reveal-perspective': `${perspective}px`, '--reveal-size': fontSize, '--reveal-weight': fontWeight, '--reveal-gap': gap }} aria-label={items.join(' ')}>
      <div className="text-reveal__sticky"><div className="text-reveal__stage" aria-hidden="true">
        {items.map(item => <div key={item} className={`text-reveal__line ${textClassName}`}>{item}</div>)}
      </div></div>
    </section>
  );
}
