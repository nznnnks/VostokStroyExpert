type SupportChannel = {
  title: string;
  label: string;
  value: string;
  href: string;
  action: string;
};

type Props = {
  variant?: "page" | "embedded";
  showOrdersCta?: boolean;
};

const supportChannels: SupportChannel[] = [
  {
    title: "Персональный менеджер",
    label: "Ответ в рабочее время",
    value: "+7 999 200-40-00",
    href: "tel:+79992004000",
    action: "позвонить",
  },
  {
    title: "Почта поддержки",
    label: "Документы и сервисные запросы",
    value: "support@vostokstroyexpert.ru",
    href: "mailto:support@vostokstroyexpert.ru",
    action: "написать",
  },
  {
    title: "Telegram",
    label: "Оперативные уточнения по заказам",
    value: "@vostok_support",
    href: "https://t.me/vostok_support",
    action: "открыть",
  },
];

const supportTopics = [
  "Статус и состав заказа",
  "Изменение адреса или шаблона доставки",
  "Сервисное обслуживание и выезд инженера",
  "Документы, закрывающие акты и счета",
];

const supportRules = [
  { label: "Часы работы:", value: "пн-пт, 09:00-19:00" },
  { label: "Срочные вопросы:", value: "Telegram и телефон" },
  { label: "Документы:", value: "ответ в течение 1 рабочего дня" },
  { label: "Сервисный выезд:", value: "согласуем отдельным подтверждением" },
];

function ChannelAction({ channel }: { channel: SupportChannel }) {
  const isExternal = channel.href.startsWith("https://");
  return (
    <a
      href={channel.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="inline-flex h-11 items-center justify-center bg-[#111] px-5 text-[12px] uppercase tracking-[1.2px] text-white transition-colors duration-200 hover:bg-[#2a2a2a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]"
    >
      {channel.action}
    </a>
  );
}

export function AccountInfoContent({ variant = "page", showOrdersCta = true }: Props) {
  if (variant === "embedded") {
    return (
      <section aria-label="Информация">
        <p className="text-[15px] uppercase tracking-[2px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">Информация</p>
        <p className="mt-4 text-[16px] leading-7 text-[#6f6f69]">
          Поможем со статусом заказа, документами, изменением адреса доставки и сервисными вопросами. Выберите удобный канал, и мы быстро подключимся.
        </p>

        <div className="mt-7 grid gap-4">
          {supportChannels.map((channel) => {
            const isExternal = channel.href.startsWith("https://");
            return (
              <article key={channel.title} className="rounded-[14px] border border-[#ece8e1] bg-white p-5">
                <p className="text-[11px] uppercase tracking-[1.6px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">{channel.label}</p>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-[22px] leading-[1.05] [font-family:'Cormorant_Garamond',serif]">{channel.title}</h2>
                    <a
                      href={channel.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      className="mt-2 block break-all text-[16px] text-[#111] underline-offset-4 hover:underline"
                    >
                      {channel.value}
                    </a>
                  </div>
                  <div className="shrink-0">
                    <ChannelAction channel={channel} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10">
          <p className="text-[15px] uppercase tracking-[2px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">Чаще всего помогаем с этим</p>
          <ul className="mt-6 grid gap-4">
            {supportTopics.map((topic) => (
              <li key={topic} className="flex items-start gap-4 border-b border-[#ece8e1] pb-4 last:border-b-0 last:pb-0">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#111]" />
                <span className="text-[18px] leading-[1.3] [font-family:'Cormorant_Garamond',serif]">{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <p className="text-[15px] uppercase tracking-[2px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">Регламент</p>
          <div className="mt-6 space-y-4 text-[15px] leading-6 text-[#6f6f69]">
            {supportRules.map((rule) => (
              <p key={rule.label}>
                <span className="text-[#8b8b86]">{rule.label}</span> {rule.value}
              </p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <p className="mt-6 max-w-[780px] text-[clamp(1rem,1.8vw,1.2rem)] leading-[1.6] text-[#6f6f69]">
        Поможем со статусом заказа, документами, изменением адреса доставки и сервисными вопросами. Выберите удобный канал, и мы быстро подключимся.
      </p>

      <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-3">
        {supportChannels.map((channel) => (
          <article key={channel.title} className="border border-[#ece8e1] bg-white p-6 md:p-8">
            <p className="text-[15px] uppercase tracking-[2px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">{channel.label}</p>
            <h2 className="mt-5 text-[clamp(1.7rem,3.5vw,2.2rem)] leading-[1.05] [font-family:'Cormorant_Garamond',serif]">{channel.title}</h2>
            <p className="mt-6 break-all text-[clamp(1.2rem,3vw,1.7rem)] leading-[1.2] text-[#111] [font-family:'Cormorant_Garamond',serif]">{channel.value}</p>
            <div className="mt-10">
              <ChannelAction channel={channel} />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-[#ece8e1] bg-[#fcfbf8] p-6 md:p-10">
          <p className="text-[15px] uppercase tracking-[2px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">Чаще всего помогаем с этим</p>
          <ul className="mt-8 grid gap-4">
            {supportTopics.map((topic) => (
              <li key={topic} className="flex items-start gap-4 border-b border-[#ece8e1] pb-4 last:border-b-0 last:pb-0">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#111]" />
                <span className="text-[clamp(1.2rem,2.6vw,1.5rem)] leading-[1.3] [font-family:'Cormorant_Garamond',serif]">{topic}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="border border-[#ece8e1] bg-white p-6 md:p-10">
          <p className="text-[15px] uppercase tracking-[2px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">Регламент</p>
          <div className="mt-8 space-y-5 text-[17px] text-[#6f6f69]">
            {supportRules.map((rule) => (
              <p key={rule.label}>
                <span className="text-[#8b8b86]">{rule.label}</span> {rule.value}
              </p>
            ))}
          </div>
          {showOrdersCta ? (
            <div className="mt-10 border-t border-[#ece8e1] pt-6">
              <a
                href="/account/orders"
                className="inline-flex h-12 items-center justify-center border border-[#111] px-6 text-[14px] uppercase tracking-[1.4px] text-[#111] transition-colors duration-200 hover:bg-[#111] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]"
              >
                открыть заказы
              </a>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}

export default AccountInfoContent;

