import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import { services } from "../data/site";
import type { NewsPostView } from "../lib/backend-api";

type AboutPageProps = {
  newsPosts?: NewsPostView[];
};

const aboutHeroStats = [
  { value: "25", lines: ["лет на", "российском рынке"] },
  { value: "100+", lines: ["реализованных", "проектов"] },
  { value: "10+", lines: ["лет инженерной", "практики"] },
  { value: "63+", lines: ["брендов в", "ассортименте"] },
] as const;

const aboutBrandLogoFiles = [
  "Chicha.png",
  "El_Taco.png",
  "Fish.png",
  "KFC.png",
  "The toy.png",
  "artest.png",
  "belgian-beer-cafe.png",
  "bijou.png",
  "botanika.png",
  "bowl-room.png",
  "bruder.png",
  "burger-king.png",
  "chaichana_evroazia.png",
  "chefs-table.png",
  "chestnay_riba.png",
  "christian-2.png",
  "co-co-chalet.png",
  "corner-burgers.png",
  "dyuzhina.png",
  "eli-satsibeli.png",
  "enzo-2.png",
  "erch.png",
  "farshing.png",
  "folk.png",
  "frank-by-basta-2.png",
  "franklins-burger.png",
  "gastormatket_balchug.png",
  "gorilla-by-basta.png",
  "gorynych.png",
  "gruzinskie_kanikuli.png",
  "hamster-2.png",
  "hand-sign.png",
  "hmelburg.png",
  "il_patio.png",
  "kabuki.png",
  "kaspiyka.png",
  "krasota.png",
  "kvartiranti.png",
  "moremania.png",
  "narval.png",
  "nino.png",
  "papa-johns.png",
  "port.png",
  "red-chinese-logo.png",
  "regent.png",
  "restaurant-central-house-of-writers.png",
  "rico-dom.png",
  "rostics.png",
  "sakhalin.png",
  "sbarro.png",
  "sesilia.png",
  "svarnya.png",
  "syrovarnya.png",
  "tanuki1.png",
  "tashir-pizza.png",
  "tehnikum.png",
  "turquoise-circle-logo.png",
  "ugolek.png",
  "urok.png",
  "vanwok.png",
  "vokrug_sveta.png",
  "white-rabbit.png",
  "wilka_lojka.png",
] as const;

const aboutBrandLogos = aboutBrandLogoFiles.map((file) => ({
  path: `/image/clear_logo/${encodeURIComponent(file)}`,
  alt: file.replace(/\.png$/i, "").replace(/[_-]+/g, " "),
}));

const aboutBlog = [
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
] as const;

export function AboutPage({ newsPosts = [] }: AboutPageProps) {
  const aboutBlogTopRow = aboutBlog.slice(0, 2);
  const aboutBlogBottomRow = aboutBlog.slice(2, 4);
  const renderAboutBlogCard = (
    article: (typeof aboutBlog)[number],
    isWide: boolean,
    imageClassName: string,
    contentClassName: string,
  ) => (
    <article
      key={article.title}
      className={`group relative overflow-hidden transition duration-500 ease-out hover:-translate-y-1 hover:opacity-100 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] ${isWide ? "md:col-span-8" : "md:col-span-4"}`}
    >
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
    <main className="flex min-h-screen flex-col bg-white text-[#111] [font-family:DM_Sans,Manrope,'Liberation_Sans',sans-serif]">
      <div className="flex-1">
        <SiteHeader />
        <section className="relative overflow-hidden bg-[#050505] text-white">
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-0 h-full w-screen -translate-x-1/2 overflow-hidden">
              <img
                src="/image/about-trust-mobile.png"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center brightness-[1.03] md:hidden"
              />
              <img
                src="/image/hero-desktop-bg.jpeg"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 hidden h-full w-full object-cover object-center md:block"
              />
              <video
                className="absolute inset-0 hidden h-full w-full object-cover md:block"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/image/hero-desktop-bg.jpeg"
              >
                <source src="/video/about-trust.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,15,0.18)_0%,rgba(8,11,16,0.22)_24%,rgba(8,11,16,0.3)_50%,rgba(8,11,16,0.46)_100%)] md:bg-[linear-gradient(180deg,rgba(7,10,15,0.58)_0%,rgba(8,11,16,0.56)_18%,rgba(8,11,16,0.66)_44%,rgba(8,11,16,0.76)_70%,rgba(8,11,16,0.86)_100%)]" />
            </div>
          </div>

          <div className="relative z-10 mx-auto flex min-h-[420px] max-w-[1860px] items-end px-3 pb-8 sm:px-5 md:min-h-[520px] md:px-10 md:pb-12 xl:min-h-[680px] xl:px-12 xl:pb-16 2xl:px-20">
            <p className="text-[clamp(28px,2vw,54px)] font-normal italic leading-none text-white/88 [font-family:'Cormorant_Garamond',serif]">
              О нашей работе и опыте
            </p>
          </div>
        </section>

        <section className="bg-white px-3 py-6 sm:px-5 md:px-10 md:py-8 xl:px-12 xl:py-10 2xl:px-20">
          <div className="mx-auto max-w-[1860px]">
            <div className="grid gap-4 md:gap-5 xl:grid-cols-[420px_minmax(0,1fr)] xl:items-stretch xl:gap-8">
              <div className="flex min-h-[118px] flex-col justify-start rounded-[18px] bg-white px-6 py-6 text-[#12120f] md:min-h-[124px] md:px-8 md:py-6 xl:min-h-[132px] xl:justify-between xl:px-10 xl:py-7">
                <p className="text-[clamp(10px,0.28vw+9px,13px)] uppercase tracking-[0.18em] text-[#7f8ea3] [font-family:'JetBrains_Mono',monospace]">
                  25 лет на российском рынке
                </p>
                <h1 className="mt-8 max-w-[12ch] text-[clamp(32px,8vw,46px)] leading-[0.9] tracking-[-0.035em] [font-family:'Cormorant_Garamond',serif] md:mt-0 md:max-w-[14ch] md:text-[clamp(30px,2.1vw,42px)] md:leading-[0.96] md:tracking-[-0.028em]">
                  ВостокСтройЭксперт
                </h1>
              </div>
              <div className="flex min-h-[116px] items-center rounded-[18px] bg-white px-6 py-6 text-[#12120f] md:min-h-[124px] md:px-8 md:py-6 xl:min-h-[132px] xl:px-14 2xl:px-16">
                <p className="max-w-[61ch] text-[clamp(24px,1.5vw,40px)] leading-[1.14] tracking-[-0.01em] [font-family:'Cormorant_Garamond',serif]">
                  Прецизионный климат-контроль Dantex для элитных резиденций и промышленных объектов высшего класса. Когда тишина становится ощутимой.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-6 2xl:gap-8">
              {aboutHeroStats.map(({ value, lines }) => (
                <article
                  key={value}
                  className="flex min-h-[128px] flex-col justify-between rounded-[18px] border border-[#d7dee8] bg-[linear-gradient(180deg,#5c6576_0%,#474e5d_100%)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] xl:min-h-[176px] xl:px-7 xl:py-6"
                >
                  <strong className="block text-[clamp(2rem,6vw,3rem)] font-semibold leading-none tracking-[-0.03em] text-[#eef0f4] xl:text-[clamp(2.45rem,2.4vw,3.7rem)]">
                    {value}
                  </strong>
                  <p className="text-[clamp(13px,1.1vw,18px)] font-semibold leading-[0.98] text-[#d7dae1] xl:text-[clamp(17px,0.72vw+13px,26px)]">
                    <span className="block whitespace-nowrap">{lines[0]}</span>
                    <span className="block whitespace-nowrap">{lines[1]}</span>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-3 pb-8 sm:px-5 md:px-10 md:pb-12 xl:px-12 xl:pb-14 2xl:px-20">
          <div className="mx-auto max-w-[1860px] rounded-[24px] bg-[#fbfaf8] p-4 text-[#12120f] md:p-6 xl:p-8">
            <div className="flex flex-col gap-3 border-b border-[#ece6dd] pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[clamp(12px,0.45vw+10px,17px)] uppercase tracking-[1.5px] text-[#b99863] [font-family:'JetBrains_Mono',monospace]">
                  Более 63 брендов
                </p>
                <h2 className="mt-3 text-[clamp(28px,2.6vw,58px)] leading-[0.95] [font-family:'Cormorant_Garamond',serif]">
                  Бренды, с которыми мы работали и которые знаем вживую
                </h2>
              </div>
              <p className="max-w-[680px] text-[clamp(0.96rem,1vw,1.12rem)] leading-[1.7] text-[#5f5f5a]">
                В этой сетке используются только файлы из текущей папки clear_logo, без подмешивания логотипов из других каталогов.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
              {aboutBrandLogos.map(({ path, alt }) => (
                <article
                  key={path}
                  className="group flex min-h-[122px] items-center justify-center rounded-[18px] border border-[#efebe4] bg-white px-4 py-4 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#dbc7a1] hover:shadow-[0_18px_30px_rgba(0,0,0,0.08)]"
                >
                  <img
                    src={path}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="max-h-[72px] w-full max-w-[150px] object-contain object-center transition duration-300 ease-out group-hover:scale-[1.05] group-hover:[filter:drop-shadow(0_8px_16px_rgba(0,0,0,0.08))_contrast(1.04)]"
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about-blog" className="bg-white px-3 py-10 sm:px-5 md:px-10 md:py-14 xl:px-12 xl:py-16 2xl:px-20">
          <div className="mx-auto max-w-[1860px]">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-[clamp(32px,3vw,60px)] leading-[0.95] [font-family:'Cormorant_Garamond',serif]">Новостной блог</h2>
              <a href="/news" className="pb-2 text-[clamp(12px,0.45vw+10px,17px)] uppercase tracking-[1.2px] text-[#2f2f2c] [font-family:'JetBrains_Mono',monospace]">Все новости</a>
            </div>
            <div className="mt-12 space-y-6 xl:space-y-8">
              <div className="grid gap-6 lg:grid-cols-12 xl:gap-8">
                {aboutBlogTopRow.map((article, index) =>
                  renderAboutBlogCard(
                    article,
                    index === 0,
                    index === 0 ? "aspect-[16/9] md:h-[420px] md:aspect-auto" : "aspect-[4/3] md:h-[420px] md:aspect-auto",
                    "md:h-[196px] 2xl:h-[212px]",
                  ),
                )}
              </div>
              <div className="grid gap-6 lg:grid-cols-12 xl:gap-8">
                {aboutBlogBottomRow.map((article, index) =>
                  renderAboutBlogCard(
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

        <section className="px-4 py-10 md:px-10 md:py-14">
          <div className="mx-auto max-w-[1480px]">
          <p className="breadcrumb-nav uppercase tracking-[1.5px] text-[#7a7a75] [font-family:Jaldi,'JetBrains_Mono',monospace]">
            <a href="/" className="hover:text-[#111]">Главная</a>
            <span className="mx-2 text-[#b5b2ab]">/</span>
            <a href="/about" className="hover:text-[#111]">О компании</a>
            <span className="mx-2 text-[#b5b2ab]">/</span>
            <span>ВостокСтройЭксперт</span>
          </p>
          <h1 className="mt-8 max-w-[900px] text-[clamp(2.6rem,5.2vw,5.75rem)] leading-[0.92] [font-family:'Cormorant_Garamond',serif]">
            Тихая инженерия для жилых, коммерческих и частных объектов высокого класса
          </h1>
          <div className="mt-10 grid items-start gap-10 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8 text-[clamp(1.05rem,1.4vw,1.45rem)] leading-[1.75] text-[#565651]">
              <p>
                ВостокСтройЭксперт проектирует и интегрирует климатические системы так, чтобы техника не спорила с архитектурой, не шумела и не усложняла эксплуатацию объекта.
              </p>
              <p>
                Мы работаем с частными резиденциями, коммерческими пространствами, бутиками и объектами с высокой инженерной плотностью. Основной фокус: точность, акустический комфорт, сервис и долговечность решений.
              </p>
              <p id="privacy">
                Мы также сопровождаем объект после запуска: проводим диагностику, тонкую настройку и сервисную поддержку, чтобы климатическая система работала как часть пространства, а не как отдельный технический слой.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <article className="flex h-full flex-col border border-[#e8e3db] p-8 text-left">
                <p className="text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[2px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">Опыт</p>
                <p className="mt-5 text-[clamp(2.5rem,4.2vw,4.1rem)] leading-none [font-family:'Cormorant_Garamond',serif]">25+</p>
                <p className="mt-3 text-[clamp(0.95rem,1.1vw,1.15rem)] leading-7 text-[#5f5f5a]">лет в интеграции инженерных решений и сопровождении объектов высокого класса.</p>
              </article>
              <article className="flex h-full flex-col border border-[#e8e3db] p-8 text-left">
                <p className="text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[2px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">Подход</p>
                <p className="mt-5 text-[clamp(1.8rem,2.6vw,2.6rem)] leading-[1.05] [font-family:'Cormorant_Garamond',serif]">Комфорт без визуального и акустического давления</p>
              </article>
            </div>
          </div>
          </div>
        </section>

        <section className="px-4 py-6 md:px-10 md:py-10">
          <div className="mx-auto max-w-[1480px] border border-[#e8e3db] bg-[#fbfaf8] p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[2px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                  Наши достижения
                </p>
                <h2 className="mt-4 text-[clamp(2rem,3.2vw,3.6rem)] leading-[1] [font-family:'Cormorant_Garamond',serif]">
                  Репутация, собранная на реальных объектах
                </h2>
                <p className="mt-4 max-w-[720px] text-[clamp(1rem,1.2vw,1.35rem)] leading-[1.7] text-[#5f5f5a]">
                  Мы измеряем результат не количеством проектов, а качеством среды, которую создаём. За последние годы мы сформировали устойчивую
                  практику инженерной интеграции для резиденций, бутиков, гостиниц и коммерческих пространств высокого класса.
                </p>
              </div>
              <div className="grid min-w-[260px] gap-4">
                {[
                  ["120+", "проектов с полным циклом интеграции"],
                  ["25+", "лет экспертизы команды в климатическом инжиниринге"],
                  ["98%", "клиентов продолжают сервисное сопровождение"],
                ].map(([value, label]) => (
                  <div key={label} className="border border-[#e8e3db] bg-white p-4">
                    <p className="text-[clamp(1.4rem,2.2vw,2.2rem)] [font-family:'Cormorant_Garamond',serif]">{value}</p>
                    <p className="mt-2 text-[clamp(0.85rem,0.8vw,1rem)] leading-6 text-[#5f5f5a]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 md:px-10 md:py-12">
          <div className="mx-auto max-w-[1480px]">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[clamp(2rem,3.5vw,3.9rem)] [font-family:'Cormorant_Garamond',serif]">Наши направления</h2>
            <a href="/services" className="text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[1.5px] text-[#6f6f69] [font-family:Jaldi,'JetBrains_Mono',monospace]">
              Все услуги
            </a>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article key={service.slug} className="border border-[#e8e3db]">
                <a href={`/services/${service.slug}`} className="block h-full p-6">
                  <img src={service.image} alt="" aria-hidden="true" width="500" height="500" className="mx-auto aspect-square w-[220px] object-contain" />
                  <h3 className="mt-5 text-[clamp(1.4rem,2vw,2rem)] [font-family:'Cormorant_Garamond',serif]">{service.title}</h3>
                  <p className="mt-4 text-[clamp(0.95rem,1vw,1.05rem)] leading-7 text-[#5f5f5a]">{service.shortText}</p>
                  <span className="mt-6 inline-flex text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[1.5px] text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                    Подробнее
                  </span>
                </a>
              </article>
            ))}
          </div>
          </div>
        </section>

        <section id="terms" className="px-4 py-8 md:px-10 md:py-12">
          <div className="mx-auto max-w-[1480px]">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[clamp(2rem,3.5vw,3.9rem)] [font-family:'Cormorant_Garamond',serif]">Новости и контекст</h2>
            <a href="/news" className="text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[1.5px] text-[#6f6f69] [font-family:Jaldi,'JetBrains_Mono',monospace]">
              Весь блог
            </a>
          </div>
          {newsPosts.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {newsPosts.slice(0, 2).map((post) => (
                <article key={post.slug} className="border border-[#e8e3db]">
                  <a href={`/news/${post.slug}`} className="block h-full p-6">
                    <img src={post.image} alt="" aria-hidden="true" width="1200" height="760" className="aspect-[16/10] w-full object-cover" />
                    <p className="mt-5 text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[1.5px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">{post.category}</p>
                    <h3 className="mt-2 text-[clamp(1.6rem,2.4vw,2.2rem)] leading-[1.05] [font-family:'Cormorant_Garamond',serif]">{post.title}</h3>
                    <p className="mt-4 text-[clamp(0.95rem,1.1vw,1.15rem)] leading-7 text-[#5f5f5a]">{post.excerpt}</p>
                    <span className="mt-6 inline-flex text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[1.5px] text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                      Читать
                    </span>
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-[#e8e3db] bg-white px-8 py-10 text-[18px] text-[#5f5f5a]">
              Публикаций пока нет.
            </div>
          )}
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

export default AboutPage;
