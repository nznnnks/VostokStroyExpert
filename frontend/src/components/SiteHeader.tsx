import { useEffect, useState } from "react";
import AuthHeaderButton from "./AuthHeaderButton";
import { navLinks } from "../data/site";

type SiteHeaderProps = {
  light?: boolean;
};

export function SiteHeader({ light = true }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className={`border-b px-4 py-4 md:px-10 ${light ? "border-[#ece8e1] bg-white" : "border-white/10 bg-transparent"}`}>
      <div className="mx-auto grid max-w-[1480px] grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[auto_1fr_auto] md:gap-4 2xl:max-w-[1860px]">
        <a
          href="/"
          className={`text-[clamp(18px,3.6vw,36px)] italic tracking-[-0.03em] [font-family:'Cormorant_Garamond',serif] ${
            light ? "text-[#050505]" : "text-white"
          }`}
        >
          ВостокСтройЭксперт
        </a>
        <nav
          className={`hidden w-full items-center justify-center gap-[clamp(18px,1.8vw,40px)] text-[clamp(11px,0.5vw+10px,16px)] uppercase tracking-[1.4px] lg:flex lg:justify-self-center [font-family:Jaldi,'JetBrains_Mono',monospace] ${
            light ? "text-[#6d6d67]" : "text-white/80"
          }`}
        >
          {navLinks.map((link) => (
            <a key={link.href + link.label} href={link.href} className="whitespace-nowrap">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-3 md:gap-4">
          <a href="/catalog" aria-label="Поиск по каталогу" className="hidden md:inline-flex">
            <svg viewBox="0 0 24 24" width="18" height="18" className={`${light ? "text-[#111]" : "text-white"}`} aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" fill="none" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </a>
          <a href="/cart" aria-label="Корзина" className="hidden md:inline-flex">
            <svg viewBox="0 0 24 24" width="18" height="18" className={`${light ? "text-[#111]" : "text-white"}`} aria-hidden="true">
              <path
                d="M6 7h13l-1.5 8.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.5L5 4H2"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9.5" cy="19.5" r="1.4" fill="currentColor" />
              <circle cx="16.5" cy="19.5" r="1.4" fill="currentColor" />
            </svg>
          </a>
          <AuthHeaderButton
            className={`hidden h-[clamp(40px,3.2vw,56px)] items-center justify-center px-[clamp(18px,2vw,34px)] text-[clamp(11px,0.5vw+10px,14px)] uppercase tracking-[1.2px] sm:inline-flex [font-family:Jaldi,'JetBrains_Mono',monospace] ${
              light ? "bg-[#050505] text-white" : "border border-white/20 bg-white/10 text-white"
            }`}
          />
          <button
            type="button"
            aria-label="Открыть меню"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(true)}
            className={`inline-flex h-11 w-11 items-center justify-center border lg:hidden ${light ? "border-[#e6e0d7]" : "border-white/20 text-white"}`}
          >
            <span className="relative h-[12px] w-[20px]">
              <span className={`absolute left-0 top-0 h-[2px] w-full ${light ? "bg-[#111]" : "bg-white"}`} />
              <span className={`absolute left-0 top-[5px] h-[2px] w-full ${light ? "bg-[#111]" : "bg-white"}`} />
              <span className={`absolute left-0 top-[10px] h-[2px] w-full ${light ? "bg-[#111]" : "bg-white"}`} />
            </span>
          </button>
        </div>
      </div>
      {isOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Закрыть меню"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsOpen(false)}
          />
          <aside className={`absolute right-0 top-0 h-full w-[85vw] max-w-[360px] px-6 py-6 ${light ? "bg-white" : "bg-[#111]"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[20px] italic [font-family:'Cormorant_Garamond',serif] ${light ? "text-[#050505]" : "text-white"}`}>
                ВостокСтройЭксперт
              </span>
              <button
                type="button"
                aria-label="Закрыть меню"
                onClick={() => setIsOpen(false)}
                className={`h-10 w-10 border ${light ? "border-[#e6e0d7]" : "border-white/20 text-white"}`}
              >
                ✕
              </button>
            </div>
            <nav className={`mt-8 flex flex-col gap-5 text-[14px] uppercase tracking-[1.8px] [font-family:Jaldi,'JetBrains_Mono',monospace] ${light ? "text-[#6d6d67]" : "text-white/80"}`}>
              {navLinks.map((link) => (
                <a key={link.href + link.label} href={link.href} onClick={() => setIsOpen(false)}>
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-8 grid gap-3">
              <AuthHeaderButton
                className={`inline-flex h-12 items-center justify-center px-7 text-[14px] uppercase tracking-[1.2px] [font-family:Jaldi,'JetBrains_Mono',monospace] ${
                  light ? "bg-[#050505] text-white" : "border border-white/20 bg-white/10 text-white"
                }`}
              />
              <div className="flex items-center gap-4">
                <a href="/catalog" className="inline-flex h-11 flex-1 items-center justify-center border border-[#e6e0d7] text-[13px] uppercase tracking-[1.2px] text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                  Поиск
                </a>
                <a href="/cart" className="inline-flex h-11 flex-1 items-center justify-center border border-[#e6e0d7] text-[13px] uppercase tracking-[1.2px] text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                  Корзина
                </a>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}

export default SiteHeader;
