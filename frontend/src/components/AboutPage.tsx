import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import { newsPosts as fallbackNewsPosts, services } from "../data/site";
import type { NewsPostView } from "../lib/backend-api";

type AboutPageProps = {
  newsPosts?: NewsPostView[];
};

function getFallbackNews() {
  return fallbackNewsPosts.map((post) => ({
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image,
    category: post.category,
    content: [...post.content],
    dateLabel: "—",
    status: "Опубликовано",
  }));
}

export function AboutPage({ newsPosts = getFallbackNews() }: AboutPageProps) {
  return (
    <main className="flex min-h-screen flex-col bg-white text-[#111] [font-family:DM_Sans,Manrope,'Liberation_Sans',sans-serif]">
      <div className="flex-1">
        <SiteHeader />
        <section className="px-4 py-10 md:px-10 md:py-14">
          <div className="mx-auto max-w-[1480px]">
          <p className="text-[clamp(0.68rem,0.5vw,0.85rem)] uppercase tracking-[1.5px] text-[#7a7a75] [font-family:Jaldi,'JetBrains_Mono',monospace]">
            <a href="/" className="hover:text-[#111]">Главная</a>
            <span className="mx-2 text-[#b5b2ab]">/</span>
            <a href="/about" className="hover:text-[#111]">О компании</a>
            <span className="mx-2 text-[#b5b2ab]">/</span>
            <span>ВостокСтройЭксперт</span>
          </p>
          <h1 className="mt-8 max-w-[900px] text-[clamp(2.6rem,5.2vw,5.75rem)] leading-[0.92] [font-family:'Cormorant_Garamond',serif]">
            Тихая инженерия для жилых, коммерческих и частных объектов высокого класса
          </h1>
          <div className="mt-10 grid gap-10 xl:grid-cols-[1.05fr_0.95fr]">
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
              <article className="border border-[#e8e3db] p-8">
                <p className="text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[2px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">Опыт</p>
                <p className="mt-5 text-[clamp(2.5rem,4.2vw,4.1rem)] leading-none [font-family:'Cormorant_Garamond',serif]">25+</p>
                <p className="mt-3 text-[clamp(0.95rem,1.1vw,1.15rem)] leading-7 text-[#5f5f5a]">лет в интеграции инженерных решений и сопровождении объектов высокого класса.</p>
              </article>
              <article className="border border-[#e8e3db] p-8">
                <p className="text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[2px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">Подход</p>
                <p className="mt-5 text-[clamp(1.8rem,2.6vw,2.6rem)] leading-[1.05] [font-family:'Cormorant_Garamond',serif]">Комфорт без визуального и акустического давления</p>
              </article>
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
              <article key={service.slug} className="border border-[#e8e3db] p-6">
                <img src={service.image} alt="" aria-hidden="true" width="500" height="500" className="mx-auto aspect-square w-[220px] object-contain" />
                <h3 className="mt-5 text-[clamp(1.4rem,2vw,2rem)] [font-family:'Cormorant_Garamond',serif]">{service.title}</h3>
                <p className="mt-4 text-[clamp(0.95rem,1vw,1.05rem)] leading-7 text-[#5f5f5a]">{service.shortText}</p>
                <a href={`/services/${service.slug}`} className="mt-6 inline-flex text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[1.5px] text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                  Подробнее
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
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {newsPosts.slice(0, 2).map((post) => (
              <article key={post.slug} className="border border-[#e8e3db] p-6">
                <img src={post.image} alt="" aria-hidden="true" width="1200" height="760" className="aspect-[16/10] w-full object-cover" />
                <p className="mt-5 text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[1.5px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">{post.category}</p>
                <h3 className="mt-2 text-[clamp(1.6rem,2.4vw,2.2rem)] leading-[1.05] [font-family:'Cormorant_Garamond',serif]">{post.title}</h3>
                <p className="mt-4 text-[clamp(0.95rem,1.1vw,1.15rem)] leading-7 text-[#5f5f5a]">{post.excerpt}</p>
                <a href={`/news/${post.slug}`} className="mt-6 inline-flex text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[1.5px] text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                  Читать
                </a>
              </article>
            ))}
          </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

export default AboutPage;
