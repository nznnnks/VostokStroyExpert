import { useEffect, useMemo, useRef, useState } from "react";
import { brandLogos as defaultBrandLogos } from "../data/brands";

type BrandLogo = {
  path: string;
  alt: string;
};

export default function BrandScroller({
  logos = defaultBrandLogos,
  className = "",
  itemClassName = "",
  speed = 28,
}: {
  logos?: BrandLogo[];
  className?: string;
  itemClassName?: string;
  speed?: number;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const { topRow, bottomRow } = useMemo(() => {
    const sourceTop = logos.filter((_, index) => index % 2 === 0);
    const sourceBottom = logos.filter((_, index) => index % 2 === 1);
    const topBase = sourceTop.length > 0 ? sourceTop : logos;
    const bottomBase = sourceBottom.length > 0 ? sourceBottom : logos;

    const buildRow = (rowLogos: BrandLogo[]) => {
      // Keep a reasonable amount of cards: enough for seamless autoscroll,
      // but avoid huge DOM lists that can degrade scroll performance.
      const minCardsPerRow = 18;
      const repeat = Math.max(1, Math.ceil(minCardsPerRow / Math.max(1, rowLogos.length)));
      const result: BrandLogo[] = [];
      for (let i = 0; i < repeat; i += 1) result.push(...rowLogos);
      return [...result, ...result];
    };

    return {
      topRow: buildRow(topBase),
      bottomRow: buildRow(bottomBase),
    };
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

      if (viewport.scrollWidth <= viewport.clientWidth + 8) return;

      viewport.scrollLeft += (speed * dt) / 1000;

      const half = track.scrollWidth / 2;
      if (half > 0 && viewport.scrollLeft >= half) {
        viewport.scrollLeft -= half;
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [isInteracting, speed]);

  return (
    <div
      ref={viewportRef}
      className={`brand-scroller ${className}`}
      onPointerDown={() => setIsInteracting(true)}
      onPointerUp={() => setIsInteracting(false)}
      onPointerCancel={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => setIsInteracting(false)}
      onTouchCancel={() => setIsInteracting(false)}
      aria-label="Бренды"
    >
      <div ref={trackRef} className="brand-scroller__stack">
        <div className="brand-scroller__track brand-scroller__track--top">
          {topRow.map(({ path, alt }, index) => (
            <article key={`top-${path}-${index}`} className={`brand-scroller__item ${itemClassName}`}>
              <div className="brand-scroller__logo">
                <img src={path} alt={alt} loading="lazy" decoding="async" className="h-full w-auto max-w-full object-contain object-center" />
              </div>
            </article>
          ))}
        </div>
        <div className="brand-scroller__track brand-scroller__track--bottom">
          {bottomRow.map(({ path, alt }, index) => (
            <article key={`bottom-${path}-${index}`} className={`brand-scroller__item ${itemClassName}`}>
              <div className="brand-scroller__logo">
                <img src={path} alt={alt} loading="lazy" decoding="async" className="h-full w-auto max-w-full object-contain object-center" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
