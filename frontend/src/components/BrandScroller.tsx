import { useEffect, useMemo, useRef, useState } from "react";

type BrandLogo = {
  path: string;
  alt: string;
};

export default function BrandScroller({
  logos,
  className = "",
  itemClassName = "",
  speed = 18,
}: {
  logos: BrandLogo[];
  className?: string;
  itemClassName?: string;
  speed?: number;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const interactionTimeoutRef = useRef<number | null>(null);

  const duplicated = useMemo(() => {
    // Repeat enough times so the track is always wider than the viewport
    // (autoscroll is otherwise invisible on ultra-wide screens).
    const repeat = Math.max(2, Math.ceil(48 / Math.max(1, logos.length)));
    const result: BrandLogo[] = [];
    for (let i = 0; i < repeat; i += 1) result.push(...logos);
    return [...result, ...result];
  }, [logos]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let lastTime = 0;

    const step = (now: number) => {
      rafId = window.requestAnimationFrame(step);
      if (isInteracting) {
        lastTime = now;
        return;
      }

      if (!lastTime) lastTime = now;
      const dt = Math.min(48, now - lastTime);
      lastTime = now;

      viewport.scrollLeft += (speed * dt) / 1000;

      // Seamless loop: list is duplicated twice, so we can wrap at half width.
      const half = track.scrollWidth / 2;
      if (half > 0 && viewport.scrollLeft >= half) {
        viewport.scrollLeft -= half;
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [isInteracting, speed]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const bumpInteraction = () => {
      setIsInteracting(true);
      if (interactionTimeoutRef.current !== null) window.clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = window.setTimeout(() => {
        interactionTimeoutRef.current = null;
        setIsInteracting(false);
      }, 1400);
    };

    const onWheel = (event: WheelEvent) => {
      if (!isPointerInside) return;
      // Convert vertical wheel to horizontal scroll inside the brands area.
      event.preventDefault();
      viewport.scrollLeft += event.deltaY + event.deltaX;
      bumpInteraction();
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", onWheel);
      if (interactionTimeoutRef.current !== null) {
        window.clearTimeout(interactionTimeoutRef.current);
        interactionTimeoutRef.current = null;
      }
    };
  }, [isPointerInside]);

  return (
    <div
      ref={viewportRef}
      className={`brand-scroller ${className}`}
      onPointerEnter={() => setIsPointerInside(true)}
      onPointerLeave={() => setIsPointerInside(false)}
      onMouseEnter={() => setIsPointerInside(true)}
      onMouseLeave={() => setIsPointerInside(false)}
      onPointerDown={() => setIsInteracting(true)}
      onPointerUp={() => setIsInteracting(false)}
      onPointerCancel={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => setIsInteracting(false)}
      onTouchCancel={() => setIsInteracting(false)}
      aria-label="Бренды"
    >
      <div ref={trackRef} className="brand-scroller__track">
        {duplicated.map(({ path, alt }, index) => (
          <article key={`${path}-${index}`} className={`brand-scroller__item ${itemClassName}`}>
            <div className="brand-scroller__logo">
              <img src={path} alt={alt} loading="lazy" decoding="async" className="h-full w-auto max-w-full object-contain object-center" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
