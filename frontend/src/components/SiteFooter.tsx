import { footerColumns } from "../data/site";

export function SiteFooter() {
  const columnTitles = ["Карта сайта", "Клиенту", "Услуги"];
  return (
    <footer className="mt-16 border-t border-[#e8e3db] bg-[#f7f5f1] px-4 py-12 md:px-10 xl:px-12 xl:py-14 2xl:px-16 2xl:py-16">
      <div className="mx-auto grid max-w-[1480px] gap-10 xl:grid-cols-[1.1fr_1.2fr_1fr] xl:items-start xl:gap-12 2xl:max-w-[1860px] 2xl:gap-14">
        <div>
          <p className="text-[24px] italic transition duration-300 ease-out hover:opacity-75 [font-family:'Cormorant_Garamond',serif] md:text-[26px] xl:text-[30px] 2xl:text-[34px]">ВостокСтройЭксперт</p>
          <p className="mt-8 hidden max-w-[360px] text-[14px] uppercase leading-9 tracking-[1.8px] text-[#7d7d78] md:mt-10 xl:block md:text-[15px] md:leading-10 xl:max-w-[400px] xl:text-[16px] xl:leading-[2.9rem] 2xl:text-[18px] [font-family:Jaldi,'JetBrains_Mono',monospace]">
            архитектурная климатическая интеграция для нового поколения антропогенной среды.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 xl:hidden">
          {footerColumns.map((column, index) => (
            <div key={index} className="min-w-0">
              <h3 className="text-[16px] uppercase [font-family:'Cormorant_Garamond',serif] md:text-[18px]">
                {columnTitles[index] ?? "Раздел"}
              </h3>
              <div className="mt-4 space-y-3 text-[13px] uppercase tracking-[1.5px] text-[#7a7a75] md:mt-5 md:space-y-4 md:text-[14px] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                {column.map((link) => (
                  <a key={link.href + link.label} href={link.href} className="block leading-[1.45] whitespace-normal transition duration-300 ease-out hover:translate-x-1 hover:text-[#2f2f2a]">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
          <div className="col-span-2 min-w-0 border-t border-[#ebe5dc] pt-6">
            <h3 className="text-[16px] uppercase [font-family:'Cormorant_Garamond',serif] md:text-[18px]">Юридическая информация</h3>
            <div className="mt-4 grid gap-3 text-[13px] uppercase tracking-[1.5px] text-[#7a7a75] md:mt-5 md:grid-cols-2 md:gap-4 md:text-[14px] [font-family:Jaldi,'JetBrains_Mono',monospace]">
              <a href="/about#privacy" className="leading-[1.45] transition duration-300 ease-out hover:translate-x-1 hover:text-[#2f2f2a]">Соглашение о конфиденциальности</a>
              <a href="/about#terms" className="leading-[1.45] transition duration-300 ease-out hover:translate-x-1 hover:text-[#2f2f2a]">Условия</a>
            </div>
          </div>
        </div>
        <div className="hidden xl:grid xl:grid-cols-3 xl:gap-8 xl:pt-[2px]">
          {footerColumns.map((column, index) => (
            <div key={index} className="min-w-0">
              <h3 className="text-[20px] uppercase [font-family:'Cormorant_Garamond',serif] 2xl:text-[22px]">
                {columnTitles[index] ?? "Раздел"}
              </h3>
              <div className="mt-6 space-y-6 text-[15px] uppercase tracking-[1.5px] text-[#7a7a75] 2xl:text-[17px] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                {column.map((link) => (
                  <a key={link.href + link.label} href={link.href} className="block whitespace-normal transition duration-300 ease-out hover:translate-x-1 hover:text-[#2f2f2a]">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="hidden xl:block">
          <h3 className="text-[20px] uppercase [font-family:'Cormorant_Garamond',serif] 2xl:text-[22px]">Юридическая информация</h3>
          <div className="mt-10 space-y-9 text-[16px] uppercase tracking-[1.5px] text-[#7a7a75] 2xl:text-[17px] [font-family:Jaldi,'JetBrains_Mono',monospace]">
            <a href="/about#privacy" className="transition duration-300 ease-out hover:translate-x-1 hover:text-[#2f2f2a]">Соглашение о конфиденциальности</a>
            <a href="/about#terms" className="transition duration-300 ease-out hover:translate-x-1 hover:text-[#2f2f2a]">Условия</a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1480px] flex-col gap-5 border-t border-[#e8e3db] pt-6 text-[11px] uppercase tracking-[1.4px] text-[#7a7a75] md:mt-12 md:text-[12px] xl:pt-8 xl:text-[13px] 2xl:max-w-[1860px] 2xl:text-[14px] [font-family:Jaldi,'JetBrains_Mono',monospace] md:flex-row md:items-center md:justify-between">
        <p>
          © 2026 <span className="[font-family:'Cormorant_Garamond',serif] italic text-[#5b5b56]">ВостокСтройЭксперт</span> climate technologies. Все права защищены.
        </p>
        <div className="flex items-center gap-6 xl:gap-7 2xl:gap-8">
          <img src="/image/planet.svg" alt="" aria-hidden="true" width="20" height="20" className="h-5 w-5 object-contain opacity-70 transition duration-300 ease-out hover:-translate-y-0.5 hover:opacity-100 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7" />
          <img src="/image/cart.png" alt="" aria-hidden="true" width="18" height="18" className="h-4 w-4 object-contain opacity-70 transition duration-300 ease-out hover:-translate-y-0.5 hover:opacity-100 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6" />
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
