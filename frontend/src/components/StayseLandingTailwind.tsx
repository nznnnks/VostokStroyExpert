import { Suspense, lazy, useEffect, useState } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const LazyHeroDesktopModel = lazy(() => import("./HeroDesktopModel"));

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits === "7" || digits === "8") return "+7";
  let normalized = digits;
  if (normalized.startsWith("8")) normalized = `7${normalized.slice(1)}`;
  if (normalized.startsWith("7")) normalized = normalized.slice(1);
  const slice = normalized.slice(0, 10);
  if (!slice) return "";
  let result = "+7";
  if (slice.length > 0) result += ` (${slice.slice(0, 3)}`;
  if (slice.length > 3) result += ")";
  if (slice.length > 3) result += ` ${slice.slice(3, 6)}`;
  if (slice.length > 6) result += `-${slice.slice(6, 8)}`;
  if (slice.length > 8) result += `-${slice.slice(8, 10)}`;
  return result;
};

const stats = [
  {
    value: "100+",
    mobileLines: ["реализовано", "проектов"],
    desktopLabel: "реализованных проектов",
  },
  {
    value: "10+",
    mobileLines: ["лет", "практики"],
    desktopLabel: "лет на рынке инженерных решений",
  },
  {
    value: "проверено",
    mobileLines: ["премиальные", "объекты"],
    desktopLabel: "на объектах высокого класса и в коммерческих пространствах",
  },
] as const;

const trusted = [
  ["/image/trusted-1.png", "Artest", "88 Michelin"],
  ["/image/trusted-2.png", "White Rabbit", "88 Michelin"],
  ["/image/trusted-3.png", "Technikum", "рекомендовано Michelin"],
  ["/image/trusted-4.png", "Central House", "рекомендовано Michelin"],
  ["/image/trusted-5.png", "Regent", "рекомендовано Michelin"],
  ["/image/trusted-6.png", "Big Gourmet", "наградa Michelin Big Gourmand"],
  ["/image/trusted-7.png", "Co-Co Chalet", "в 10 лучших ресторанов краснодарского края"],
];

const services = [
  {
    image: "/image/services-1.png",
    title: "Тепловой контроль",
    text: "Настраиваем стабильную температуру и корректную работу систем в резиденциях, бутиках и инженерно сложных интерьерах.",
  },
  {
    image: "/image/services-2.png",
    title: "Очистка воздуха",
    text: "Подбираем фильтрацию, влажность и воздухообмен так, чтобы система работала незаметно и ощущалась как комфорт.",
  },
  {
    image: "/image/services-3.png",
    title: "Акустическая настройка",
    text: "Снижаем шум, убираем лишние вибрации и интегрируем оборудование без конфликта с архитектурой пространства.",
  },
];

const serviceHrefByTitle: Record<string, string> = {
  "Тепловой контроль": "/services/thermal-control",
  "Очистка воздуха": "/services/air-cleaning",
  "Акустическая настройка": "/services/acoustic-tuning",
};

const steps = [
  ["/image/steps-1.png", "Диагностика", "Изучаем объект, ограничения и режим эксплуатации, чтобы не перегружать проект лишними решениями."],
  ["/image/steps-2.png", "Моделирование", "Собираем инженерную схему, считаем нагрузки и согласовываем логику системы."],
  ["/image/steps-3.png", "Интеграция", "Встраиваем оборудование в архитектуру, интерьер и существующие инженерные сети."],
  ["/image/steps-4.png", "Запуск", "Проводим настройку, тестирование и передаём систему в эксплуатацию с понятным сопровождением."],
];

const blog = [
  {
    image: "/image/news-1.png",
    title: "Почему инженерия должна быть частью тихого интерьера",
    text: "Разбираем, как оборудование высокого класса интегрируется в пространство без визуального и акустического давления.",
    wide: true,
  },
  {
    image: "/image/news-2.png",
    title: "Сервис и контроль системы после запуска",
    text: "Что важно предусмотреть заранее, чтобы климатическая система не требовала постоянного внимания.",
  },
  {
    image: "/image/news-3.png",
    title: "Что нужно знать про VRF-решения",
    text: "Коротко о сценариях применения и тонкостях подбора для объектов разного масштаба.",
  },
  {
    image: "/image/news-4.png",
    title: "Надёжность как главный критерий премиальной инженерии",
    text: "Почему стабильная работа системы важнее перегруженного набора характеристик в спецификации.",
  },
];

const reviews = [
  [
    "/image/reviews-1.svg",
    "Команда спроектировала решение очень аккуратно: техника не спорит с интерьером, работает тихо и даёт ощущение полной собранности пространства.",
    "Анна Морозова",
    "дизайнер интерьеров",
  ],
  [
    "/image/reviews-2.svg",
    "Получили понятный процесс, хороший контроль на всех этапах и систему, которая реально ощущается как премиальный сервис, а не как набор оборудования.",
    "Илья Сергеев",
    "управляющий объектом",
  ],
];

export function StayseLandingTailwind() {
  const [animatedStats, setAnimatedStats] = useState([0, 1]);
  const [heroStatsVisible, setHeroStatsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setAnimatedStats([100, 10]);
      setHeroStatsVisible(true);
      return;
    }

    let frameId = 0;
    let revealTimeout = 0;
    let startTimeout = 0;
    const duration = 3400;
    const delays = [0, 420];
    const targets = [100, 10];
    let start = 0;

    const tick = (now: number) => {
      const nextValues = targets.map((target, index) => {
        const elapsed = now - start - delays[index];
        if (elapsed <= 0) return index === 1 ? 1 : 0;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        return index === 1 ? Math.max(1, value) : value;
      });

      setAnimatedStats(nextValues as [number, number]);

      if (nextValues[0] < targets[0] || nextValues[1] < targets[1]) {
        frameId = window.requestAnimationFrame(tick);
      }
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

  const trustedTopRow = trusted.slice(0, 4);
  const trustedBottomRow = trusted.slice(4);
  const blogTopRow = blog.slice(0, 2);
  const blogBottomRow = blog.slice(2, 4);
  const renderBlogCard = (article: (typeof blog)[number], isWide: boolean, imageClassName: string, contentClassName: string) => (
    <article key={article.title} className={`group relative overflow-hidden transition duration-500 ease-out hover:-translate-y-1 hover:opacity-100 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] ${isWide ? "md:col-span-8" : "md:col-span-4"}`}>
      <a href="/news" aria-label={`Открыть новость: ${article.title}`} className="absolute inset-0 z-10" />
      <img
        src={article.image}
        alt=""
        loading="lazy"
        decoding="async"
        width="1200"
        height="760"
        className={`w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025] ${imageClassName}`}
      />
      {isWide ? (
        <div className={`grid border border-t-0 border-[#ece8e1] bg-white p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-8 md:p-6 ${contentClassName}`}>
          <p className="max-w-[90%] text-[clamp(15px,0.55vw+12px,20px)] leading-[1.5] text-[#2d2d2a]">{article.text}</p>
          <a
            href="/news"
            className="relative z-20 inline-flex h-11 w-fit items-center justify-center self-start bg-[#1a1a1a] px-7 text-[clamp(12px,0.4vw+10px,14px)] uppercase tracking-[1.2px] text-white transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2a2a2a] md:self-end [font-family:'JetBrains_Mono',monospace]"
          >
            смотреть
          </a>
        </div>
      ) : (
        <div className={`border border-t-0 border-[#ece8e1] bg-white p-5 md:p-6 ${contentClassName}`}>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-5">
            <p className="max-w-[22ch] text-[clamp(15px,0.55vw+12px,20px)] leading-[1.5] text-[#2d2d2a]">{article.text}</p>
            <a
              href="/news"
              className="relative z-20 inline-flex h-11 w-fit items-center justify-center self-start bg-[#1a1a1a] px-7 text-[clamp(12px,0.4vw+10px,14px)] uppercase tracking-[1.2px] text-white transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2a2a2a] md:self-end [font-family:'JetBrains_Mono',monospace]"
            >
              смотреть
            </a>
          </div>
        </div>
      )}
    </article>
  );

  return (
    <main className="flex min-h-screen flex-col bg-white text-[#0f0f0e] [font-family:Manrope,'Liberation_Sans',sans-serif]">
      <div className="flex-1">
        <SiteHeader />

        <section id="hero" className="relative isolate h-[calc(100dvh-76px)] overflow-hidden bg-[#050505] text-white md:h-[calc(100dvh-82px)]">
        <img
          src="/image/hero-menu.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          width="1280"
          height="6179"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[72%_center] md:hidden"
        />
        <img
          src="/image/hero-desktop-bg.jpeg"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          width="1280"
          height="720"
          className="absolute inset-0 -z-20 hidden h-full w-full object-cover object-center md:block"
        />
        <Suspense fallback={null}>
          <LazyHeroDesktopModel />
        </Suspense>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,4,5,0.98)_0%,rgba(4,4,5,0.92)_24%,rgba(4,4,5,0.62)_46%,rgba(4,4,5,0.18)_72%)]" />
        <div className="absolute inset-0 -z-[5] hidden bg-[radial-gradient(circle_at_72%_44%,rgba(127,153,220,0.18)_0%,rgba(127,153,220,0.07)_18%,rgba(5,5,5,0)_44%)] md:block" />
        <div className="relative z-20 mx-auto flex h-full max-w-[1480px] flex-col justify-center gap-8 px-5 pb-7 pt-0 sm:px-5 md:justify-between md:gap-8 md:px-10 md:pb-8 md:pt-8 xl:gap-10 xl:pb-10 xl:pt-12 2xl:max-w-[1680px]">
          <div className="mx-auto max-w-[680px] text-center md:mx-0 md:max-w-[46rem] md:text-left xl:max-w-[52rem]">
            <h1 className="mx-auto max-w-[760px] text-[clamp(42px,11vw,136px)] leading-[0.86] tracking-[-0.045em] [font-family:'Cormorant_Garamond',serif] md:mx-0 md:max-w-[8.2em] md:text-[clamp(34px,7.1vw,122px)] md:tracking-[-0.05em] xl:max-w-[760px] xl:text-[clamp(40px,8.2vw,136px)]">
              Атмосферное
              <br />
              Совершенство
            </h1>
            <p className="mx-auto mt-6 max-w-[30rem] text-[clamp(15px,3.5vw,32px)] font-[300] leading-[1.42] text-[#f4f4f1] md:mx-0 md:mt-5 md:max-w-[32rem] md:text-[clamp(14px,1.7vw,25px)] md:leading-[1.42] xl:mt-6 xl:max-w-[720px] xl:text-[clamp(16px,2.4vw,32px)] xl:leading-[1.52]">
              Прецизионный климат-контроль Dantex для элитных резиденций и промышленных объектов высшего класса.
              Когда тишина становится ощутимой.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[clamp(11px,0.42vw+10px,17px)] uppercase tracking-[1.1px] [font-family:'JetBrains_Mono',monospace] md:mt-7 md:justify-start md:gap-3.5 xl:mt-8 xl:gap-6 2xl:gap-7 md:tracking-[1.2px]">
              <a
                href="/services"
                className="inline-grid h-[56px] min-w-[164px] place-items-center bg-[#1a1a1a] px-7 text-center text-white transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2a2a2a] hover:shadow-[0_18px_40px_rgba(0,0,0,0.28)] md:h-[clamp(44px,3.2vw,58px)] md:min-w-[clamp(138px,11vw,180px)] md:px-[clamp(18px,1.8vw,28px)] xl:h-[76px] xl:min-w-[248px] xl:px-[clamp(20px,2.2vw,38px)] 2xl:h-[84px] 2xl:min-w-[276px]"
              >
                <span className="translate-y-[0.04em] leading-none">услуги</span>
              </a>
              <a
                href="/catalog"
                className="inline-grid h-[56px] min-w-[164px] place-items-center border border-white/25 bg-black/20 px-7 text-center text-white/92 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/12 hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)] md:h-[clamp(44px,3.2vw,58px)] md:min-w-[clamp(138px,11vw,180px)] md:px-[clamp(18px,1.8vw,28px)] xl:h-[76px] xl:min-w-[248px] xl:px-[clamp(20px,2.2vw,38px)] 2xl:h-[84px] 2xl:min-w-[276px]"
              >
                <span className="translate-y-[0.04em] leading-none">каталог</span>
              </a>
            </div>
          </div>

          <ul className="mt-5 grid gap-0 overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,15,16,0.9)_0%,rgba(19,21,26,0.86)_52%,rgba(26,31,41,0.82)_100%)] shadow-[0_16px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[10px] sm:mt-8 sm:grid-cols-3 sm:gap-4 sm:rounded-[22px] sm:border-white/10 sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] sm:px-5 sm:py-5 sm:shadow-none sm:backdrop-blur-[10px] md:mt-0 md:rounded-none md:border-x-0 md:border-b-0 md:border-t md:bg-transparent md:px-0 md:py-4 md:shadow-none md:backdrop-blur-0 xl:pt-5 [font-family:'JetBrains_Mono',monospace]">
            {stats.map(({ value, mobileLines, desktopLabel }, index) => (
              <li
                key={value}
                className={`relative flex min-h-[82px] flex-col items-center justify-center gap-1 px-4 py-3 text-center transition duration-700 ease-out sm:min-h-0 sm:gap-1.5 sm:px-0 sm:py-0 ${
                  heroStatsVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 130}ms` }}
              >
                {index > 0 ? (
                  <span className="absolute left-4 right-4 top-0 h-px bg-white/8 sm:hidden" aria-hidden="true" />
                ) : null}
                <strong
                  className={`text-[clamp(1.8rem,5vw,2.3rem)] font-semibold uppercase leading-none tracking-[0.08em] text-white transition duration-700 ease-out sm:text-[clamp(16px,0.95vw+12px,28px)] sm:font-normal sm:tracking-[0.18em] ${
                    index === 2 && heroStatsVisible ? "translate-y-0 opacity-100" : index === 2 ? "translate-y-2 opacity-0" : ""
                  }`}
                  style={index === 2 ? { transitionDelay: "260ms" } : undefined}
                >
                  {index === 0 ? `${animatedStats[0]}+` : index === 1 ? `${animatedStats[1]}+` : value}
                </strong>
                <div className="space-y-0.5 text-center sm:hidden">
                  {mobileLines.map((line) => (
                    <p
                      key={line}
                      className="text-[0.66rem] uppercase leading-[1.08] tracking-[0.1em] text-white/68"
                    >
                      {line}
                    </p>
                  ))}
                </div>
                <span className="mx-auto hidden max-w-[420px] text-center leading-[1.45] sm:block sm:leading-5">{desktopLabel}</span>
              </li>
            ))}
          </ul>
        </div>
        </section>

      <section id="about" className="px-3 py-10 sm:px-5 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[1480px] gap-8 pb-6 xl:grid-cols-[120px_360px_minmax(0,760px)] xl:items-start xl:gap-12 2xl:max-w-[1860px]">
          <div className="text-[clamp(56px,5.5vw,120px)] leading-[0.78] text-[#e5dfd8] [font-family:'Cormorant_Garamond',serif]">25</div>
          <div>
            <h2 className="text-[clamp(32px,3vw,72px)] leading-[0.92] [font-family:'Cormorant_Garamond',serif]">О компании</h2>
            <p className="mt-3 max-w-[300px] text-[clamp(13px,0.7vw+11px,18px)] italic leading-6 text-[#8b8b86] [font-family:'Cormorant_Garamond',serif]">
              ВостокЭкспертСтрой
            </p>
          </div>
          <p className="max-w-[760px] pt-1 text-[clamp(18px,1.6vw+12px,34px)] leading-[1.35] text-[#12120f] [font-family:'Cormorant_Garamond',serif]">
            Прецизионный климат-контроль Dantex для элитных резиденций и промышленных объектов высшего класса.
            Когда тишина становится ощутимой.
          </p>
        </div>
      </section>

      <section className="px-3 py-10 sm:px-5 md:px-10 md:py-16">
        <div className="mx-auto max-w-[1480px] 2xl:max-w-[1860px]">
          <h2 className="text-[clamp(36px,3.6vw,82px)] leading-[0.92] [font-family:'Cormorant_Garamond',serif]">Нам доверяют:</h2>
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6 lg:hidden">
            {trusted.map(([image, title], index) => (
              <article
                key={title}
                className={`flex min-h-[170px] flex-col items-center justify-center border border-[#f0ede7] bg-white p-4 text-center transition duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(17,17,17,0.07)] md:min-h-[210px] md:p-5 ${
                  index === trusted.length - 1 ? "col-span-2 md:col-span-3" : ""
                }`}
              >
                <img
                  src={image}
                  alt={title}
                  loading="lazy"
                  decoding="async"
                  width="240"
                  height="221"
                  className="mx-auto h-[110px] w-full max-w-[220px] object-contain object-center md:h-[150px] md:max-w-[240px]"
                />
              </article>
            ))}
          </div>
          <div className="mt-10 hidden space-y-5 md:space-y-6 xl:block">
            <div className="grid grid-cols-4 gap-6">
              {trustedTopRow.map(([image, title]) => (
                <article key={title} className="flex min-h-[210px] flex-col items-center justify-center border border-[#f0ede7] bg-white p-5 text-center transition duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(17,17,17,0.07)] 2xl:min-h-[240px]">
                  <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    width="240"
                    height="221"
                    className="mx-auto h-[150px] w-full max-w-[240px] object-contain object-center 2xl:h-[170px]"
                  />
                </article>
              ))}
            </div>
            <div className="mx-auto grid max-w-[1120px] grid-cols-3 gap-6">
              {trustedBottomRow.map(([image, title]) => (
                <article key={title} className="flex min-h-[210px] flex-col items-center justify-center border border-[#f0ede7] bg-white p-5 text-center transition duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(17,17,17,0.07)] 2xl:min-h-[240px]">
                  <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    width="240"
                    height="221"
                    className="mx-auto h-[150px] w-full max-w-[240px] object-contain object-center 2xl:h-[170px]"
                  />
                </article>
              ))}
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <a href="/about" className="inline-flex h-12 items-center justify-center bg-[#111] px-10 text-[clamp(12px,0.5vw+11px,16px)] text-white transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#232323] hover:shadow-[0_14px_28px_rgba(0,0,0,0.14)] [font-family:'Cormorant_Garamond',serif]">
              Подробнее
            </a>
          </div>
        </div>
      </section>

      <section id="services" className="px-3 py-12 sm:px-5 md:px-10 md:py-18">
        <div className="mx-auto max-w-[1480px] 2xl:max-w-[1860px]">
          <p className="text-[clamp(12px,0.45vw+10px,17px)] uppercase tracking-[1.5px] text-[#b99863] [font-family:'JetBrains_Mono',monospace]">основные услуги</p>
          <h2 className="mt-3 text-[clamp(32px,3.2vw,72px)] leading-[0.95] [font-family:'Cormorant_Garamond',serif]">Наши услуги</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="group relative flex h-full flex-col border-l border-[#ece8e1] pl-3 transition duration-500 ease-out hover:-translate-y-1 hover:border-[#d3b46a] hover:shadow-[0_14px_30px_rgba(0,0,0,0.05)] md:pl-5">
                <a
                  href={serviceHrefByTitle[service.title] ?? "/services"}
                  aria-label={`Открыть направление: ${service.title}`}
                  className="absolute inset-0 z-10"
                />
                <img src={service.image} alt="" loading="lazy" decoding="async" width="560" height="560" className="mx-auto aspect-square w-[180px] object-cover transition duration-700 ease-out group-hover:scale-[1.035] sm:w-[220px] md:w-[250px]" />
                <h3 className="mt-5 max-w-[280px] text-[clamp(22px,1.6vw+16px,40px)] leading-[1.02] transition-colors duration-300 group-hover:text-[#8f6c38] [font-family:'Cormorant_Garamond',serif]">{service.title}</h3>
                <p className="mt-4 max-w-[340px] flex-1 text-[clamp(14px,0.6vw+12px,20px)] leading-[1.65] text-[#2f2f2c]">{service.text}</p>
                <div className="relative z-20 mt-auto flex flex-wrap items-center gap-4 pt-6 text-[clamp(12px,0.45vw+10px,16px)] uppercase tracking-[1.2px] [font-family:'JetBrains_Mono',monospace]">
                  <a href="/checkout" className="inline-flex h-9 items-center justify-center bg-[#050505] px-5 text-white transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#1f1f1f] xl:h-11 xl:px-7 2xl:h-12 2xl:px-8">заказать</a>
                  <a href={serviceHrefByTitle[service.title] ?? "/services"} className="text-[#2d2d29] transition-colors duration-300 hover:text-[#8f6c38] xl:text-[17px] 2xl:text-[18px]">подробнее</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="steps" className="px-3 py-14 sm:px-5 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1480px] 2xl:max-w-[1860px]">
          <h2 className="text-[clamp(32px,3.2vw,68px)] leading-[0.95] [font-family:'Cormorant_Garamond',serif]">Любая задача в 4 этапа</h2>
          <div className="mt-10 grid justify-items-center gap-8 sm:mt-12 sm:grid-cols-2 sm:justify-items-stretch sm:gap-x-8 sm:gap-y-10 xl:grid-cols-4 xl:gap-12">
            {steps.map(([image, title, text]) => (
              <article key={title} className="max-w-[320px] text-center transition duration-500 ease-out hover:-translate-y-1 sm:max-w-none sm:text-left">
                <img src={image} alt="" loading="lazy" decoding="async" width="48" height="48" className="mx-auto h-11 w-11 object-contain transition duration-300 ease-out hover:scale-110 sm:mx-0 sm:h-12 sm:w-12" />
                <h3 className="mt-4 text-[clamp(20px,1.1vw+16px,32px)] leading-none [font-family:'Cormorant_Garamond',serif]">{title}</h3>
                <p className="mt-2 text-[clamp(14px,0.55vw+12px,19px)] leading-[1.6] text-[#2f2f2c]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="px-3 py-16 sm:px-5 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1480px] 2xl:max-w-[1860px]">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-[clamp(32px,3vw,60px)] leading-[0.95] [font-family:'Cormorant_Garamond',serif]">Новостной блог</h2>
            <a href="/news" className="pb-2 text-[clamp(12px,0.45vw+10px,17px)] uppercase tracking-[1.2px] text-[#2f2f2c] [font-family:'JetBrains_Mono',monospace]">Все новости</a>
          </div>
          <div className="mt-12 space-y-6 xl:space-y-8">
            <div className="grid gap-6 lg:grid-cols-12 xl:gap-8">
              {blogTopRow.map((article, index) =>
                renderBlogCard(
                  article,
                  index === 0,
                  index === 0 ? "aspect-[16/9] md:h-[420px] md:aspect-auto" : "aspect-[4/3] md:h-[420px] md:aspect-auto",
                  "md:h-[196px] 2xl:h-[212px]",
                ),
              )}
            </div>
            <div className="grid gap-6 lg:grid-cols-12 xl:gap-8">
              {blogBottomRow.map((article, index) =>
                renderBlogCard(
                  article,
                  index === 1,
                  index === 1 ? "aspect-[16/9] md:h-[360px] md:aspect-auto" : "aspect-[4/3] md:h-[360px] md:aspect-auto",
                  "md:h-[196px] 2xl:h-[212px]",
                ),
              )}
            </div>
          </div>
        </div>
      </section>

        <section className="px-3 py-14 sm:px-5 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1480px] 2xl:max-w-[1860px]">
          <h2 className="text-[clamp(32px,3.2vw,68px)] leading-[0.95] [font-family:'Cormorant_Garamond',serif]">Мнения клиентов</h2>
          <div className="mt-10 grid gap-10 sm:mt-12 xl:grid-cols-2 xl:gap-x-28 xl:gap-y-12">
            {reviews.map(([avatar, text, author, role]) => (
              <article key={author as string} className="grid gap-6 lg:gap-8">
                <p className="max-w-[620px] text-[clamp(24px,1.1vw+15px,44px)] leading-[1.28] italic tracking-[0.01em] text-[#1c1c19] [font-family:'Cormorant_Garamond',serif]">
                  {text}
                </p>
                <footer className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 md:gap-6 lg:justify-start lg:gap-8 xl:gap-10">
                  <div className="flex min-w-0 items-center gap-3 md:gap-4">
                    <img src={avatar as string} alt={author as string} loading="lazy" decoding="async" width="120" height="120" className="h-11 w-11 rounded-full object-cover" />
                    <div className="min-w-0">
                      <strong className="block text-[clamp(26px,0.85vw+16px,38px)] leading-[1.04] tracking-[0.005em] [font-family:'Cormorant_Garamond',serif]">{author}</strong>
                      <span className="block text-[clamp(20px,0.7vw+13px,30px)] leading-[1.1] text-[#5f5f5b] [font-family:'Cormorant_Garamond',serif]">{role}</span>
                    </div>
                  </div>
                  <a href="/about" className="inline-flex h-10 w-fit shrink-0 items-center justify-center self-start bg-[#1a1a1a] px-5 text-[clamp(12px,0.45vw+10px,16px)] uppercase tracking-[1.2px] text-white transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2b2b2b] sm:self-center xl:h-11 xl:px-6 2xl:h-12 2xl:px-7 [font-family:'JetBrains_Mono',monospace]">
                    отзыв
                  </a>
                </footer>
              </article>
            ))}
          </div>
        </div>
        </section>

        <section id="contact" className="bg-white px-3 py-18 sm:px-5 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1480px] gap-14 border-b border-[#e8e3db] pb-16 xl:grid-cols-[minmax(460px,560px)_minmax(0,1fr)] xl:gap-20 2xl:max-w-[1860px]">
          <div>
            <h2 className="max-w-[10ch] text-[clamp(40px,3.6vw,96px)] leading-[0.92] [font-family:'Cormorant_Garamond',serif] xl:max-w-[11ch]">Бесплатная консультация</h2>
            <div className="mt-8 space-y-8">
              <div>
                <p className="text-[clamp(10px,0.38vw+9px,14px)] uppercase tracking-[1.4px] text-[#7a7a75] [font-family:'JetBrains_Mono',monospace]">Офис</p>
                <p className="mt-3 text-[clamp(16px,0.9vw+12px,22px)] leading-8 text-[#111]">г. Москва, Калужская, 12</p>
              </div>
              <div>
                <p className="text-[clamp(10px,0.38vw+9px,14px)] uppercase tracking-[1.4px] text-[#7a7a75] [font-family:'JetBrains_Mono',monospace]">Запросы</p>
                <address className="mt-3 not-italic text-[clamp(16px,0.9vw+12px,22px)] leading-8 text-[#111]">
                  concierge@aeris-climate.com
                  <br />
                  +7 999 200 40 00
                </address>
              </div>
            </div>
          </div>

          <form className="grid max-w-[820px] gap-5 2xl:max-w-none 2xl:grid-cols-2 xl:gap-x-6">
            <label className="grid gap-2">
              <span className="text-[clamp(10px,0.38vw+9px,14px)] uppercase tracking-[1.4px] text-[#7a7a75] [font-family:'JetBrains_Mono',monospace]">Имя</span>
              <input
                className="h-20 border border-[#e5e3df] bg-[#fbfaf8] px-6 text-[clamp(18px,1.1vw+14px,30px)] text-[#6b6b67] [font-family:'Liberation_Sans',Manrope,sans-serif] xl:h-[5.5rem] 2xl:h-24"
                type="text"
                name="name"
                required
                placeholder="Ваше имя"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[clamp(10px,0.38vw+9px,14px)] uppercase tracking-[1.4px] text-[#7a7a75] [font-family:'JetBrains_Mono',monospace]">Телефон</span>
              <input
                className="h-20 border border-[#e5e3df] bg-[#fbfaf8] px-6 text-[clamp(18px,1.1vw+14px,30px)] text-[#6b6b67] [font-family:'Liberation_Sans',Manrope,sans-serif] xl:h-[5.5rem] 2xl:h-24"
                type="tel"
                name="phone"
                inputMode="tel"
                required
                placeholder="+7 (777) 777-77-77"
                onInput={(event) => {
                  const input = event.currentTarget;
                  input.value = formatPhone(input.value);
                  input.setCustomValidity("");
                }}
                onBlur={(event) => {
                  const input = event.currentTarget;
                  if (!input.value) return;
                  const valid = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(input.value);
                  input.setCustomValidity(valid ? "" : "Введите телефон в формате +7 (777) 777-77-77");
                }}
              />
            </label>
            <label className="grid gap-2 2xl:col-span-2">
              <span className="text-[clamp(10px,0.38vw+9px,14px)] uppercase tracking-[1.4px] text-[#7a7a75] [font-family:'JetBrains_Mono',monospace]">О проекте</span>
              <div className="relative">
                <select className="h-20 w-full appearance-none border border-[#e5e3df] bg-[#fbfaf8] px-6 pr-20 text-[clamp(18px,1.1vw+14px,30px)] text-[#181816] [font-family:'Cormorant_Garamond',serif] xl:h-[5.5rem] 2xl:h-24" defaultValue="" name="projectType" required>
                  <option value="" disabled>
                    Жилой / Коммерческий / Другой
                  </option>
                  <option value="residence">Жилой</option>
                  <option value="commercial">Коммерческий</option>
                  <option value="other">Другой</option>
                </select>
                <span className="pointer-events-none absolute right-6 top-1/2 h-6 w-6 -translate-y-1/2 border-b-2 border-r-2 border-[#111] rotate-45" />
              </div>
            </label>
            <button className="inline-flex h-20 items-center justify-center bg-[#1a1a1a] px-10 text-[clamp(14px,0.7vw+12px,20px)] uppercase tracking-[1.6px] text-white xl:h-[5.5rem] xl:px-12 2xl:h-24 2xl:px-14 [font-family:'JetBrains_Mono',monospace]" type="submit">
              оставить заявку
            </button>
            <span className="self-center text-[clamp(13px,0.55vw+11px,18px)] uppercase tracking-[1.4px] text-[#8a8a86] [font-family:'JetBrains_Mono',monospace]">
              отвечаем за 15 минут
            </span>
          </form>
        </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}

export default StayseLandingTailwind;
