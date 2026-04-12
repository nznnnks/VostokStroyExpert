import { footerColumns } from "../data/site";

export function SiteFooter() {
  const columnTitles = ["Карта сайта", "Клиенту", "Услуги"];
  return (
    <footer className="mt-16 border-t border-[#e8e3db] bg-[#f7f5f1] px-4 py-12 md:px-10 2xl:px-16">
      <div className="mx-auto grid max-w-[1480px] gap-10 md:grid-cols-[1.1fr_1.2fr_1fr] md:items-start 2xl:max-w-[1860px] 2xl:gap-14">
        <div>
          <p className="text-[24px] italic [font-family:'Cormorant_Garamond',serif] md:text-[26px] 2xl:text-[30px]">ВостокСтройЭксперт</p>
          <p className="mt-8 max-w-[360px] text-[14px] uppercase leading-9 tracking-[1.8px] text-[#7d7d78] md:mt-10 md:text-[15px] md:leading-10 2xl:text-[16px] [font-family:Jaldi,'JetBrains_Mono',monospace]">
            архитектурная климатическая интеграция для нового поколения антропогенной среды.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 md:pt-[2px]">
          {footerColumns.map((column, index) => (
            <div key={index} className="min-w-0">
              <h3 className="text-[16px] uppercase [font-family:'Cormorant_Garamond',serif] md:text-[18px] 2xl:text-[20px]">
                {columnTitles[index] ?? "Раздел"}
              </h3>
              <div
                className="mt-5 space-y-4 text-[13px] uppercase tracking-[1.5px] text-[#7a7a75] md:mt-6 md:space-y-5 md:text-[14px] 2xl:text-[15px] [font-family:Jaldi,'JetBrains_Mono',monospace]"
              >
                {column.map((link) => (
                  <a key={link.href + link.label} href={link.href} className="block whitespace-nowrap md:whitespace-normal">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-[16px] uppercase [font-family:'Cormorant_Garamond',serif] md:text-[18px] 2xl:text-[20px]">Юридическая информация</h3>
          <div className="mt-8 space-y-6 text-[13px] uppercase tracking-[1.5px] text-[#7a7a75] md:mt-10 md:space-y-8 md:text-[15px] 2xl:text-[16px] [font-family:Jaldi,'JetBrains_Mono',monospace]">
            <a href="/about#privacy">Соглашение о конфиденциальности</a>
            <a href="/about#terms">Условия</a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1480px] flex-col gap-4 border-t border-[#e8e3db] pt-6 text-[11px] uppercase tracking-[1.4px] text-[#7a7a75] md:mt-12 md:text-[12px] 2xl:max-w-[1860px] 2xl:text-[13px] [font-family:Jaldi,'JetBrains_Mono',monospace] md:flex-row md:items-center md:justify-between">
        <p>
          © 2026 <span className="[font-family:'Cormorant_Garamond',serif] italic text-[#5b5b56]">ВостокСтройЭксперт</span> climate technologies. Все права защищены.
        </p>
        <div className="flex items-center gap-6">
          <img src="/image/planet.svg" alt="" aria-hidden="true" width="20" height="20" className="h-5 w-5 object-contain opacity-70" />
          <img src="/image/cart.png" alt="" aria-hidden="true" width="18" height="18" className="h-4 w-4 object-contain opacity-70" />
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
