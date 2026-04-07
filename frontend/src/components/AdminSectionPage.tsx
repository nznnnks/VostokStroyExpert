import { adminCatalog, adminClients, adminNav, adminNews, adminOrders, adminProjects, adminRequests, adminUser } from "../data/admin";
import { useMemo, useState } from "react";

type AdminSectionPageProps = {
  activeKey: string;
  title: string;
  subtitle?: string;
};

function AdminTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<string | JSX.Element>>;
}) {
  return (
    <div className="overflow-hidden border border-[#e8e3db] bg-white">
      <div className="grid border-b border-[#ece8e1] px-8 py-5 text-[12px] uppercase tracking-[3px] text-[#b1ada6] [font-family:Jaldi,'JetBrains_Mono',monospace]" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col) => (
          <span key={col}>{col}</span>
        ))}
      </div>
      <div className="divide-y divide-[#ece8e1]">
        {rows.map((row, index) => (
          <div
            key={`${index}-${row[0] as string}`}
            className="grid items-center gap-4 px-8 py-6 text-[16px] text-[#2b2a27] admin-event-row"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {row.map((cell, cellIndex) => (
              <div key={`${index}-${cellIndex}`} className="min-w-0">
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ tone, label }: { tone: "green" | "gold" | "gray" | "amber"; label: string }) {
  const toneClasses: Record<typeof tone, string> = {
    green: "bg-[#e7f6ee] text-[#2a7b4a]",
    gold: "bg-[#f8f0db] text-[#8a6a2a]",
    gray: "bg-[#f0efec] text-[#7f7a73]",
    amber: "bg-[#f5e9e2] text-[#8a4d2c]",
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] ${toneClasses[tone]}`}>{label}</span>;
}

export function AdminSectionPage({ activeKey, title, subtitle }: AdminSectionPageProps) {
  const [newsQuery, setNewsQuery] = useState("");
  const [newsStatus, setNewsStatus] = useState<"all" | "Опубликовано" | "Черновик">("all");
  const [newsFormOpen, setNewsFormOpen] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogAvailability, setCatalogAvailability] = useState<"all" | "В наличии" | "Под заказ">("all");
  const [catalogFormOpen, setCatalogFormOpen] = useState(false);

  const filteredNews = useMemo(() => {
    return adminNews.filter((item) => {
      const matchQuery = newsQuery
        ? item.title.toLowerCase().includes(newsQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(newsQuery.toLowerCase())
        : true;
      const matchStatus = newsStatus === "all" ? true : item.status === newsStatus;
      return matchQuery && matchStatus;
    });
  }, [newsQuery, newsStatus]);

  const filteredCatalog = useMemo(() => {
    return adminCatalog.filter((item) => {
      const matchQuery = catalogQuery
        ? item.title.toLowerCase().includes(catalogQuery.toLowerCase()) ||
          item.brand.toLowerCase().includes(catalogQuery.toLowerCase())
        : true;
      const matchAvailability = catalogAvailability === "all" ? true : item.stock === catalogAvailability;
      return matchQuery && matchAvailability;
    });
  }, [catalogQuery, catalogAvailability]);

  const placeholderRows = [
    ["—", "—", "—", "—", "—", "—"].map((text, index) => (
      <span key={`placeholder-${index}`} className="block h-4 w-full rounded bg-[#f2efe9]" aria-hidden="true" />
    )),
  ];

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#111] [font-family:DM_Sans,Manrope,'Liberation_Sans',sans-serif]">
      <div className="grid min-h-screen xl:grid-cols-[360px_1fr] 2xl:grid-cols-[400px_1fr]">
        <aside className="hidden min-h-screen flex-col bg-[#211d1a] text-white xl:flex">
          <div className="border-b border-white/10 px-8 py-12">
            <p className="max-w-full text-[26px] italic uppercase leading-none tracking-[-0.04em] text-white 2xl:text-[30px] [font-family:'Cormorant_Garamond',serif]">
              ВОСТОКСТРОЙЭКСПЕРТ
            </p>
            <p className="mt-6 text-[14px] uppercase tracking-[4px] text-white/50 2xl:text-[15px] [font-family:Jaldi,'JetBrains_Mono',monospace]">
              панель администратора
            </p>
          </div>

          <nav className="pt-6">
            {adminNav.map((item) => {
              const active = item.key === activeKey;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={`flex min-h-[68px] items-center gap-5 px-6 text-[18px] ${
                    active ? "border-l-4 border-white bg-white/4" : "text-white/70"
                  }`}
                >
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    width="22"
                    height="22"
                    loading="lazy"
                    decoding="async"
                    className="h-5 w-5 object-contain"
                  />
                  <span className={active ? "text-white" : ""}>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-[16px] font-semibold text-[#111]">
                      {item.badge}
                    </span>
                  ) : null}
                </a>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 px-8 py-8">
            <a href="/login" className="flex items-center gap-4 text-[18px] text-white/70">
              <img
                src="/админка/выход.svg"
                alt=""
                aria-hidden="true"
                width="20"
                height="20"
                loading="lazy"
                decoding="async"
                className="h-5 w-5 object-contain"
              />
              Выход
            </a>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-[#e8e3db] bg-white px-6 py-5 md:px-10">
            <div className="flex items-center justify-end gap-6">
              <img
                src="/админка/уведомление.svg"
                alt=""
                aria-hidden="true"
                width="18"
                height="18"
                loading="lazy"
                decoding="async"
                className="h-[18px] w-[18px] object-contain"
              />
              <div className="h-10 w-px bg-[#ece8e1]" />
              <span className="text-[18px]">{adminUser.name}</span>
              <img
                src={adminUser.avatar}
                alt="Профиль администратора"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                className="h-12 w-12 rounded-[4px] border border-[#ece8e1] object-cover"
              />
            </div>
          </header>

          <section className="px-6 py-10 md:px-10 md:py-14">
            <div className="mx-auto max-w-[1280px]">
              <h1 className="text-[46px] leading-none md:text-[64px] [font-family:'Cormorant_Garamond',serif]">{title}</h1>
              {subtitle ? <p className="mt-4 text-[18px] text-[#7a7a75] md:text-[20px]">{subtitle}</p> : null}

              {activeKey === "requests" ? (
                <div className="mt-10">
                  <AdminTable
                    columns={["ID", "Клиент", "Услуга", "Бюджет", "Статус", "Дата"]}
                    rows={adminRequests.map((item) => [
                      item.id,
                      item.client,
                      item.service,
                      item.budget,
                      <StatusBadge
                        key={item.id}
                        tone={item.status === "Новая" ? "green" : item.status === "В работе" ? "gold" : "amber"}
                        label={item.status}
                      />,
                      item.date,
                    ])}
                  />
                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="admin-card-in border border-[#e8e3db] bg-white p-7">
                      <h3 className="text-[20px] [font-family:'Cormorant_Garamond',serif]">Новая заявка</h3>
                      <div className="mt-5 grid gap-4 text-[14px]">
                        <label className="grid gap-2 text-[#7a7a75]">
                          Клиент
                          <input className="admin-input" placeholder="Название компании" />
                        </label>
                        <label className="grid gap-2 text-[#7a7a75]">
                          Услуга
                          <input className="admin-input" placeholder="Направление работ" />
                        </label>
                        <label className="grid gap-2 text-[#7a7a75]">
                          Бюджет
                          <input className="admin-input" placeholder="Сумма, ₽" />
                        </label>
                      </div>
                      <button type="button" className="admin-action-btn mt-6">Добавить</button>
                    </div>
                    <div className="admin-card-in border border-[#e8e3db] bg-white p-7">
                      <h3 className="text-[20px] [font-family:'Cormorant_Garamond',serif]">Фильтры заявок</h3>
                      <div className="mt-5 grid gap-3 text-[14px] text-[#7a7a75]">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="admin-checkbox" defaultChecked />
                          Новые
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="admin-checkbox" defaultChecked />
                          В работе
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="admin-checkbox" />
                          Коммерческие
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeKey === "orders" ? (
                <div className="mt-10">
                  <AdminTable
                    columns={["Номер", "Клиент", "Позиции", "Сумма", "Статус", "Дата"]}
                    rows={adminOrders.map((item) => [
                      item.id,
                      item.client,
                      item.items,
                      item.amount,
                      <StatusBadge key={item.id} tone="gold" label={item.status} />,
                      item.date,
                    ])}
                  />
                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="admin-card-in border border-[#e8e3db] bg-white p-7">
                      <h3 className="text-[20px] [font-family:'Cormorant_Garamond',serif]">Статусы заказов</h3>
                      <div className="mt-5 grid gap-3 text-[14px] text-[#7a7a75]">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="admin-checkbox" defaultChecked />
                          Оплата ожидается
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="admin-checkbox" />
                          В сборке
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="admin-checkbox" />
                          Доставка
                        </label>
                      </div>
                    </div>
                    <div className="admin-card-in border border-[#e8e3db] bg-white p-7">
                      <h3 className="text-[20px] [font-family:'Cormorant_Garamond',serif]">Новый заказ</h3>
                      <div className="mt-5 grid gap-4 text-[14px]">
                        <label className="grid gap-2 text-[#7a7a75]">
                          Клиент
                          <input className="admin-input" placeholder="Компания" />
                        </label>
                        <label className="grid gap-2 text-[#7a7a75]">
                          Сумма
                          <input className="admin-input" placeholder="Сумма, ₽" />
                        </label>
                      </div>
                      <button type="button" className="admin-action-btn mt-6">Создать</button>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeKey === "clients" ? (
                <div className="mt-10">
                  <AdminTable
                    columns={["Клиент", "Сегмент", "Менеджер", "Заказы", "Статус"]}
                    rows={adminClients.map((item) => [
                      item.name,
                      item.segment,
                      item.manager,
                      item.orders,
                      <StatusBadge key={item.name} tone={item.status === "Активен" ? "green" : "gray"} label={item.status} />,
                    ])}
                  />
                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="admin-card-in border border-[#e8e3db] bg-white p-7">
                      <h3 className="text-[20px] [font-family:'Cormorant_Garamond',serif]">Поиск клиента</h3>
                      <input className="admin-input mt-4" placeholder="Название или менеджер" />
                      <button type="button" className="admin-action-btn mt-6">Найти</button>
                    </div>
                    <div className="admin-card-in border border-[#e8e3db] bg-white p-7">
                      <h3 className="text-[20px] [font-family:'Cormorant_Garamond',serif]">Добавить клиента</h3>
                      <div className="mt-5 grid gap-4 text-[14px]">
                        <label className="grid gap-2 text-[#7a7a75]">
                          Компания
                          <input className="admin-input" placeholder="Название" />
                        </label>
                        <label className="grid gap-2 text-[#7a7a75]">
                          Менеджер
                          <input className="admin-input" placeholder="Имя менеджера" />
                        </label>
                      </div>
                      <button type="button" className="admin-action-btn mt-6">Добавить</button>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeKey === "news" ? (
                <div className="mt-10">
                  <div className="admin-toolbar">
                    <div className="admin-toolbar__group">
                      <label className="admin-toolbar__label">Поиск</label>
                      <input
                        className="admin-input admin-toolbar__input"
                        placeholder="Название или категория"
                        value={newsQuery}
                        onChange={(event) => setNewsQuery(event.target.value)}
                      />
                    </div>
                    <div className="admin-toolbar__group">
                      <label className="admin-toolbar__label">Статус</label>
                      <div className="flex gap-2">
                        {(["all", "Опубликовано", "Черновик"] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            className={`admin-filter-pill ${newsStatus === status ? "admin-filter-pill--active" : ""}`}
                            onClick={() => setNewsStatus(status)}
                          >
                            {status === "all" ? "Все" : status}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="button" className="admin-action-btn" onClick={() => setNewsFormOpen((value) => !value)}>
                      {newsFormOpen ? "Скрыть форму" : "Добавить новость"}
                    </button>
                  </div>

                  {newsFormOpen ? (
                    <div className="admin-form-grid">
                      <div className="admin-card-in border border-[#e8e3db] bg-white p-7">
                        <h3 className="text-[20px] [font-family:'Cormorant_Garamond',serif]">Новая публикация</h3>
                        <div className="mt-5 grid gap-4 text-[14px]">
                          <label className="grid gap-2 text-[#7a7a75]">
                            Заголовок
                            <input className="admin-input" placeholder="Название материала" />
                          </label>
                          <label className="grid gap-2 text-[#7a7a75]">
                            Категория
                            <input className="admin-input" placeholder="Например: Интеграция" />
                          </label>
                          <label className="grid gap-2 text-[#7a7a75]">
                            Статус
                            <select className="admin-input">
                              <option>Черновик</option>
                              <option>Опубликовано</option>
                            </select>
                          </label>
                          <label className="grid gap-2 text-[#7a7a75]">
                            Краткое описание
                            <textarea className="admin-input admin-textarea" placeholder="Тизер для карточки" />
                          </label>
                        </div>
                        <div className="mt-6 flex items-center gap-3">
                          <button type="button" className="admin-action-btn">Сохранить</button>
                          <button type="button" className="admin-action-btn admin-action-btn--ghost">Предпросмотр</button>
                        </div>
                      </div>
                      <div className="admin-card-in border border-[#e8e3db] bg-white p-7">
                        <h3 className="text-[20px] [font-family:'Cormorant_Garamond',serif]">Настройки публикации</h3>
                        <div className="mt-5 grid gap-4 text-[14px] text-[#7a7a75]">
                          <label className="grid gap-2">
                            Дата публикации
                            <input className="admin-input" placeholder="ДД.ММ.ГГГГ" />
                          </label>
                          <label className="grid gap-2">
                            Автор
                            <input className="admin-input" placeholder="Редактор" />
                          </label>
                          <label className="grid gap-2">
                            Изображение
                            <input className="admin-input" placeholder="URL или выбрать из медиатеки" />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    {(filteredNews.length ? filteredNews : adminNews).map((item, index) => (
                      <article key={item.title} style={{ animationDelay: `${index * 90}ms` }} className="admin-card-in border border-[#e8e3db] bg-white p-7">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[12px] uppercase tracking-[3px] text-[#b1ada6] [font-family:Jaldi,'JetBrains_Mono',monospace]">{item.category}</p>
                            <h3 className="mt-3 text-[22px] [font-family:'Cormorant_Garamond',serif]">{item.title}</h3>
                          </div>
                          <StatusBadge tone={item.status === "Опубликовано" ? "green" : "gray"} label={item.status} />
                        </div>
                        <div className="mt-6 flex items-center justify-between text-[14px] text-[#7a7a75]">
                          <span>{item.date}</span>
                          <button type="button" className="admin-action-btn">Редактировать</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeKey === "catalog" ? (
                <div className="mt-10">
                  <div className="admin-toolbar">
                    <div className="admin-toolbar__group">
                      <label className="admin-toolbar__label">Поиск</label>
                      <input
                        className="admin-input admin-toolbar__input"
                        placeholder="Название или бренд"
                        value={catalogQuery}
                        onChange={(event) => setCatalogQuery(event.target.value)}
                      />
                    </div>
                    <div className="admin-toolbar__group">
                      <label className="admin-toolbar__label">Наличие</label>
                      <div className="flex gap-2">
                        {(["all", "В наличии", "Под заказ"] as const).map((state) => (
                          <button
                            key={state}
                            type="button"
                            className={`admin-filter-pill ${catalogAvailability === state ? "admin-filter-pill--active" : ""}`}
                            onClick={() => setCatalogAvailability(state)}
                          >
                            {state === "all" ? "Все" : state}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="button" className="admin-action-btn" onClick={() => setCatalogFormOpen((value) => !value)}>
                      {catalogFormOpen ? "Скрыть форму" : "Добавить товар"}
                    </button>
                  </div>

                  {catalogFormOpen ? (
                    <div className="admin-form-grid">
                      <div className="admin-card-in border border-[#e8e3db] bg-white p-7">
                        <h3 className="text-[20px] [font-family:'Cormorant_Garamond',serif]">Карточка товара</h3>
                        <div className="mt-5 grid gap-4 text-[14px]">
                          <label className="grid gap-2 text-[#7a7a75]">
                            Название
                            <input className="admin-input" placeholder="Monolith V2" />
                          </label>
                          <label className="grid gap-2 text-[#7a7a75]">
                            Бренд
                            <input className="admin-input" placeholder="Aeris Precision" />
                          </label>
                          <label className="grid gap-2 text-[#7a7a75]">
                            Цена
                            <input className="admin-input" placeholder="284 500 ₽" />
                          </label>
                          <label className="grid gap-2 text-[#7a7a75]">
                            Наличие
                            <select className="admin-input">
                              <option>В наличии</option>
                              <option>Под заказ</option>
                              <option>Нет в наличии</option>
                            </select>
                          </label>
                        </div>
                        <div className="mt-6 flex items-center gap-3">
                          <button type="button" className="admin-action-btn">Сохранить</button>
                          <button type="button" className="admin-action-btn admin-action-btn--ghost">Черновик</button>
                        </div>
                      </div>
                      <div className="admin-card-in border border-[#e8e3db] bg-white p-7">
                        <h3 className="text-[20px] [font-family:'Cormorant_Garamond',serif]">Медиа и параметры</h3>
                        <div className="mt-5 grid gap-4 text-[14px] text-[#7a7a75]">
                          <label className="grid gap-2">
                            Основное изображение
                            <input className="admin-input" placeholder="URL изображения" />
                          </label>
                          <label className="grid gap-2">
                            Серия
                            <input className="admin-input" placeholder="Premium" />
                          </label>
                          <label className="grid gap-2">
                            Площадь покрытия
                            <input className="admin-input" placeholder="до 120 м²" />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {(filteredCatalog.length ? filteredCatalog : adminCatalog).map((item, index) => (
                      <article key={item.title} style={{ animationDelay: `${index * 90}ms` }} className="admin-card-in border border-[#e8e3db] bg-white p-7">
                        <p className="text-[12px] uppercase tracking-[3px] text-[#b1ada6] [font-family:Jaldi,'JetBrains_Mono',monospace]">{item.brand}</p>
                        <h3 className="mt-3 text-[22px] [font-family:'Cormorant_Garamond',serif]">{item.title}</h3>
                        <p className="mt-4 text-[20px]">{item.price}</p>
                        <div className="mt-6 flex items-center justify-between text-[14px] text-[#7a7a75]">
                          <span>{item.stock}</span>
                          <button type="button" className="admin-action-btn">Открыть</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeKey === "projects" ? (
                <div className="mt-10">
                  <AdminTable
                    columns={["Проект", "Клиент", "Этап", "Дедлайн", "Ответственный"]}
                    rows={adminProjects.map((item) => [item.name, item.client, item.stage, item.deadline, item.lead])}
                  />
                </div>
              ) : null}

              {activeKey === "settings" ? (
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                  {[
                    { title: "Профиль", desc: "Имя компании, контактный email, логотипы." },
                    { title: "Безопасность", desc: "Доступы менеджеров и двухфакторная защита." },
                    { title: "Уведомления", desc: "Email и push-уведомления по заявкам и заказам." },
                    { title: "Интеграции", desc: "CRM, платежи и импорт каталога." },
                  ].map((card, index) => (
                    <article key={card.title} style={{ animationDelay: `${index * 90}ms` }} className="admin-card-in border border-[#e8e3db] bg-white p-7">
                      <h3 className="text-[22px] [font-family:'Cormorant_Garamond',serif]">{card.title}</h3>
                      <p className="mt-3 text-[15px] text-[#7a7a75]">{card.desc}</p>
                      <button type="button" className="admin-action-btn mt-6">Настроить</button>
                    </article>
                  ))}
                </div>
              ) : null}

              {activeKey !== "dashboard" && activeKey !== "requests" && activeKey !== "orders" && activeKey !== "clients" && activeKey !== "news" && activeKey !== "catalog" && activeKey !== "projects" && activeKey !== "settings" ? (
                <div className="mt-10">
                  <AdminTable columns={["Раздел", "Описание", "Статус", "Ответственный"]} rows={placeholderRows} />
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AdminSectionPage;
