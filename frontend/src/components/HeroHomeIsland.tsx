import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { heroStats } from "../data/home";

const LazyHeroDesktopModel = lazy(() => import("./HeroDesktopModel"));
const PRELOADER_TEXT = "подготавливаем каталог и инженерные решения";

export default function HeroHomeIsland() {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const [animatedStats, setAnimatedStats] = useState<[number, number]>([0, 1]);
  const [heroStatsVisible, setHeroStatsVisible] = useState(false);
  const [showHeroModel, setShowHeroModel] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setAnimatedStats([100, 15]);
      setHeroStatsVisible(true);
      return;
    }

    let frameId = 0;
    let revealTimeout = 0;
    let startTimeout = 0;
    const duration = 3400;
    const delays = [0, 420];
    const targets = [100, 15];
    let start = 0;

    const tick = (now: number) => {
      const nextValues = targets.map((target, index) => {
        const elapsed = now - start - delays[index];
        if (elapsed <= 0) return index === 1 ? 1 : 0;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        return index === 1 ? Math.max(1, value) : value;
      }) as [number, number];

      setAnimatedStats(nextValues);
      if (nextValues[0] < targets[0] || nextValues[1] < targets[1]) frameId = window.requestAnimationFrame(tick);
    };

    startTimeout = window.setTimeout(() => {
      start = performance.now();
      frameId = window.requestAnimationFrame(tick);
    }, 520);
    revealTimeout = window.setTimeout(() => setHeroStatsVisible(true), 1450);

    return () => {
      window.clearTimeout(startTimeout);
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(revealTimeout);
    };
  }, []);

  // Preloader hides via CSS animation; keep JS free of timing so it doesn't depend on hydration.

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(min-width: 1280px)");
    const heroSection = heroSectionRef.current;
    let idleId: number | null = null;
    let timeoutId: number | null = null;
    let intersectionObserver: IntersectionObserver | null = null;

    const scheduleModelMount = () => {
      if (!mediaQueryList.matches || !heroSection) {
        setShowHeroModel(false);
        return;
      }

      const mount = () => setShowHeroModel(true);
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(mount, { timeout: 1200 });
        return;
      }

      timeoutId = window.setTimeout(mount, 180);
    };

    const cancelScheduledMount = () => {
      if (idleId !== null && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      idleId = null;
      timeoutId = null;
    };

    const update = () => {
      cancelScheduledMount();
      if (!mediaQueryList.matches || !heroSection) {
        setShowHeroModel(false);
        return;
      }

      intersectionObserver?.disconnect();
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting) {
            setShowHeroModel(false);
            return;
          }
          scheduleModelMount();
        },
        { rootMargin: "160px 0px" },
      );
      intersectionObserver.observe(heroSection);
    };

    update();
    mediaQueryList.addEventListener("change", update);
    return () => {
      mediaQueryList.removeEventListener("change", update);
      intersectionObserver?.disconnect();
      cancelScheduledMount();
    };
  }, []);

  return (
    <>
      <section id="hero" ref={heroSectionRef} className="hero">
        <div className="hero__background" aria-hidden="true">
          <img src="/image/hero-menu.png" alt="" aria-hidden="true" loading="eager" decoding="async" fetchPriority="high" width="1280" height="6179" className="hero__bg hero__bg--mobile" />
          <img src="/image/hero-desktop-bg.jpeg" alt="" aria-hidden="true" loading="eager" decoding="async" width="1280" height="720" className="hero__bg hero__bg--desktop" />
        </div>
        <div className="hero__inner">
          <div className="hero__stage">
            {showHeroModel ? (
              <div className="hero__media" aria-hidden="true">
                <Suspense fallback={null}>
                  <LazyHeroDesktopModel />
                </Suspense>
              </div>
            ) : null}
            <div className="hero__content">
              <h1 className="hero__title">
                Атмосферное
                <br />
                Совершенство
              </h1>
              <p className="hero__lead">
                Прецизионный климат-контроль ClimaTrade для элитных резиденций и промышленных объектов высшего класса.
                Когда тишина становится ощутимой.
              </p>
              <div className="hero__actions">
                <a href="/services" className="hero__button hero__button--primary"><span className="translate-y-[0.04em] leading-none">услуги</span></a>
                <a href="/catalog" className="hero__button hero__button--secondary"><span className="translate-y-[0.04em] leading-none">каталог</span></a>
              </div>
            </div>
          </div>
          <div className="hero__achievements">
            <ul className="hero__stats">
              {heroStats.map(({ value, mobileLines, desktopLabel }, index) => (
                <li key={value} className={`hero__stat ${heroStatsVisible ? "is-visible" : ""}`} style={{ transitionDelay: `${index * 130}ms` }}>
                  <strong className="hero__stat-value">
                    {index === 0 ? `${animatedStats[0]}+` : index === 1 ? `${animatedStats[1]}+` : value}
                  </strong>
                  <div className="hero__stat-mobile-label">
                    {mobileLines.map((line) => <p key={line} className="hero__stat-mobile-line">{line}</p>)}
                  </div>
                  <span className="hero__stat-label">{desktopLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
