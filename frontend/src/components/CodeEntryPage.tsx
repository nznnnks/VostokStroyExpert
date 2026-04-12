import AuthHeaderButton from "./AuthHeaderButton";
import SiteFooter from "./SiteFooter";

export function CodeEntryPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-[#111] [font-family:DM_Sans,Manrope,'Liberation_Sans',sans-serif]">
      <div className="flex-1">
        <header className="border-b border-[#ece8e1] px-4 py-4 md:px-10">
          <div className="mx-auto flex max-w-[1580px] items-center gap-4">
          <a href="/" className="text-[clamp(1.4rem,1.6vw,2rem)] italic tracking-[-0.03em] text-[#050505] [font-family:'Cormorant_Garamond',serif]">
            ВостокСтройЭксперт
          </a>
          <nav className="ml-auto hidden items-center gap-10 text-[clamp(0.7rem,0.6vw,0.9rem)] uppercase tracking-[1.5px] text-[#6d6d67] md:flex [font-family:Jaldi,'JetBrains_Mono',monospace]">
            <a href="/">главная</a>
            <a href="/about">о нас</a>
            <a href="/services">услуги</a>
            <a href="/news">проекты</a>
            <a href="/catalog">каталог</a>
            <a href="/news">блог</a>
          </nav>
          <div className="flex items-center gap-4">
            <img src="/image/search.png" alt="" aria-hidden="true" width="18" height="18" className="h-[18px] w-[18px]" />
            <img src="/image/cart.png" alt="" aria-hidden="true" width="18" height="18" className="h-[18px] w-[18px]" />
            <AuthHeaderButton className="inline-flex h-12 items-center justify-center bg-[#050505] px-7 text-[clamp(0.7rem,0.6vw,0.9rem)] uppercase tracking-[1.2px] text-white [font-family:Jaldi,'JetBrains_Mono',monospace]" />
          </div>
        </div>
        </header>

        <section className="px-4 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-[1120px] border border-[#e8e3db] bg-white 2xl:max-w-[1480px]">
          <div className="grid md:grid-cols-[140px_1fr]">
            <div className="bg-[#111]">
              <img
                src="/code-entry/code-photo.png"
                alt=""
                aria-hidden="true"
                width="280"
                height="1200"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-full min-h-[320px] w-full object-cover"
              />
            </div>

            <div className="px-6 py-10 md:px-10 md:py-12 lg:px-18 lg:py-16">
              <p className="text-[clamp(0.68rem,0.5vw,0.85rem)] uppercase tracking-[1.5px] text-[#7a7a75] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                <a href="/" className="hover:text-[#111]">Главная</a>
                <span className="mx-2 text-[#b5b2ab]">/</span>
                <span>Ввод кода</span>
              </p>
              <h1 className="mt-6 text-[clamp(2.6rem,5.2vw,5.5rem)] leading-none [font-family:'Cormorant_Garamond',serif]">Введите код</h1>
              <p className="mt-8 max-w-[630px] text-[clamp(1.05rem,1.4vw,1.35rem)] leading-[1.55] text-[#7d7d78]">
                Мы отправили 6-значный код на вашу почту. Пожалуйста, проверьте папку «Входящие» и «Спам».
              </p>

              <div className="mt-16 grid grid-cols-3 gap-4 md:grid-cols-6 md:gap-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <label key={index} className="block">
                    <span className="sr-only">Цифра {index + 1}</span>
                    <input
                      inputMode="numeric"
                      maxLength={1}
                      placeholder="0"
                      className="h-20 w-full border-b border-[#e8e3db] bg-transparent text-center text-[clamp(2rem,3.5vw,2.75rem)] text-[#d8d8d3] outline-none placeholder:text-[#e0e0db] [font-family:'Cormorant_Garamond',serif]"
                    />
                  </label>
                ))}
              </div>

              <button className="mt-16 inline-flex h-20 w-full items-center justify-center bg-[#1f1f1f] px-8 text-[clamp(1rem,1.2vw,1.4rem)] uppercase tracking-[4px] text-white [font-family:Jaldi,'JetBrains_Mono',monospace]">
                подтвердить
              </button>

              <div className="mt-12 text-center">
                <p className="text-[clamp(0.95rem,0.9vw,1.15rem)] uppercase tracking-[3px] text-[#8f8f89] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                  отправить код повторно через 00:59
                </p>
                <button className="mt-4 text-[clamp(0.85rem,0.8vw,1rem)] uppercase tracking-[3px] text-[#d0d0cb] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                  отправить код
                </button>
              </div>
            </div>
          </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}

export default CodeEntryPage;
