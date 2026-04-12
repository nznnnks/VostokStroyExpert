import { useEffect, useState } from "react";

import { ApiError } from "../lib/api-client";
import {
  createOrderTemplate,
  deleteOrderTemplate,
  loadAccountSnapshot,
  updateOrderTemplate,
  type AccountProfileView,
  type OrderTemplateView,
} from "../lib/backend-api";

const navItems = [
  ["/account/client-data.png", "Данные клиента", "/account", false],
  ["/account/orders.svg", "Заказы", "/account/orders", false],
  ["/account/templates.png", "Шаблоны заказа", "/account/templates", true],
  ["/account/support.svg", "Поддержка", "/account/support", false],
];

function StateMessage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-10 border border-[#ece8e1] bg-white px-8 py-10">
      <h2 className="text-[30px] [font-family:'Cormorant_Garamond',serif]">{title}</h2>
      <p className="mt-4 text-[18px] leading-8 text-[#6f6f69]">{description}</p>
    </div>
  );
}

export function AccountTemplatesPage() {
  const [profile, setProfile] = useState<AccountProfileView | null>(null);
  const [templates, setTemplates] = useState<OrderTemplateView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({
    id: "",
    title: "",
    contact: "",
    phone: "",
    address: "",
    comment: "",
    isDefault: false,
  });

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const data = await loadAccountSnapshot();

        if (!active) {
          return;
        }

        setProfile(data.profile);
        setTemplates(data.templates);
        setError(null);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError instanceof Error ? nextError : new Error("Не удалось загрузить шаблоны."));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      active = false;
    };
  }, []);

  const authRequired = error instanceof ApiError && error.status === 401;

  async function refreshTemplates() {
    const data = await loadAccountSnapshot();
    setProfile(data.profile);
    setTemplates(data.templates);
  }

  async function handleSubmit() {
    const title = form.title.trim();
    const contactName = form.contact.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();

    if (!title || !contactName || !phone || !address) {
      setActionError("Заполните название, контакт, телефон и адрес.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const payload = {
        title,
        contactName,
        phone,
        address,
        comment: form.comment.trim() || undefined,
        isDefault: form.isDefault,
      };

      if (form.id) {
        await updateOrderTemplate(form.id, payload);
      } else {
        await createOrderTemplate(payload);
      }

      await refreshTemplates();
      setForm({ id: "", title: "", contact: "", phone: "", address: "", comment: "", isDefault: false });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось сохранить шаблон.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!form.id) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await deleteOrderTemplate(form.id);
      await refreshTemplates();
      setForm({ id: "", title: "", contact: "", phone: "", address: "", comment: "", isDefault: false });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Не удалось удалить шаблон.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="bg-white text-[#111] [font-family:DM_Sans,Manrope,'Liberation_Sans',sans-serif]">
      <header className="border-b border-[#ece8e1] px-4 py-4 md:px-10">
        <div className="mx-auto flex max-w-[1580px] items-center gap-4">
          <a href="/" className="text-[28px] italic tracking-[-0.03em] text-[#050505] [font-family:'Cormorant_Garamond',serif]">ВостокСтройЭксперт</a>
          <nav className="ml-auto hidden items-center gap-10 text-[14px] uppercase tracking-[1.5px] text-[#6d6d67] md:flex [font-family:Jaldi,'JetBrains_Mono',monospace]">
            <a href="/">главная</a><a href="/about">о нас</a><a href="/services">услуги</a><a href="/news">проекты</a><a href="/catalog">каталог</a><a href="/news">блог</a>
          </nav>
          <div className="flex items-center gap-6 text-[14px] uppercase tracking-[1.4px] text-[#7a7a75] [font-family:Jaldi,'JetBrains_Mono',monospace]">
            <img src="/image/search.png" alt="" aria-hidden="true" width="18" height="18" className="h-[18px] w-[18px]" />
            <img src="/image/cart.png" alt="" aria-hidden="true" width="18" height="18" className="h-[18px] w-[18px]" />
            <span>{profile?.name ?? "Личный кабинет"}</span>
          </div>
        </div>
      </header>
      <section className="grid xl:grid-cols-[360px_1fr]">
        <aside className="border-r border-[#ece8e1] bg-[#fcfbf8] px-5 py-16 md:px-8">
          <div className="border border-[#ece8e1] bg-white p-8">
            <h2 className="text-[26px] [font-family:'Cormorant_Garamond',serif]">Личный кабинет</h2>
            <p className="mt-4 text-[14px] uppercase tracking-[4px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">ВостокСтройЭксперт business</p>
          </div>
          <nav className="mt-10 space-y-2">
            {navItems.map(([icon, label, href, active]) => (
              <a key={label as string} href={href as string} className={`flex min-h-[74px] items-center gap-4 px-6 text-[18px] ${active ? "bg-[#f5f3ef]" : "bg-transparent"}`}>
                <img src={icon as string} alt="" aria-hidden="true" width="24" height="24" className="h-6 w-6 object-contain" />
                <span className="[font-family:'Cormorant_Garamond',serif] text-[18px]">{label}</span>
              </a>
            ))}
          </nav>
        </aside>
        <div className="px-4 py-12 md:px-10 xl:px-16 xl:py-20">
          <div className="mx-auto max-w-[1200px] 2xl:max-w-[1480px]">
            <h1 className="text-[52px] leading-none md:text-[80px] [font-family:'Cormorant_Garamond',serif]">Шаблоны заказа</h1>

            {loading ? <StateMessage title="Загрузка" description="Загружаю сохраненные шаблоны заказа." /> : null}
            {!loading && authRequired ? <StateMessage title="Нужен вход" description="Для просмотра шаблонов войдите под пользовательской учетной записью." /> : null}
            {!loading && error && !authRequired ? <StateMessage title="Ошибка загрузки" description={error.message || "Не удалось загрузить шаблоны."} /> : null}

            {!loading && !error ? (
              <div className="mt-10 grid gap-8">
                <div className="border border-[#ece8e1] bg-white p-10">
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="text-[14px] uppercase tracking-[3px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                      Название шаблона
                      <input
                        className="mt-2 w-full border border-[#e8e3db] px-4 py-3 text-[16px]"
                        value={form.title}
                        onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                        placeholder="Дом для клиента А"
                      />
                    </label>
                    <label className="text-[14px] uppercase tracking-[3px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                      Контактное лицо
                      <input
                        className="mt-2 w-full border border-[#e8e3db] px-4 py-3 text-[16px]"
                        value={form.contact}
                        onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
                        placeholder="Алексей Иванов"
                      />
                    </label>
                    <label className="text-[14px] uppercase tracking-[3px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                      Телефон
                      <input
                        className="mt-2 w-full border border-[#e8e3db] px-4 py-3 text-[16px]"
                        value={form.phone}
                        onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                        placeholder="+7 999 123 45 67"
                      />
                    </label>
                    <label className="text-[14px] uppercase tracking-[3px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                      Адрес
                      <input
                        className="mt-2 w-full border border-[#e8e3db] px-4 py-3 text-[16px]"
                        value={form.address}
                        onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                        placeholder="Москва, Калужская, 12"
                      />
                    </label>
                  </div>
                  <label className="mt-6 block text-[14px] uppercase tracking-[3px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                    Комментарий
                    <textarea
                      className="mt-2 w-full border border-[#e8e3db] px-4 py-3 text-[16px]"
                      value={form.comment}
                      onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
                      placeholder="Дополнительные условия"
                    />
                  </label>
                  <label className="mt-6 flex items-center gap-3 text-[14px] uppercase tracking-[3px] text-[#8b8b86] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(event) => setForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    Сделать по умолчанию
                  </label>
                  {actionError ? <p className="mt-4 text-[16px] text-[#9b3d2f]">{actionError}</p> : null}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      className="inline-flex h-12 items-center justify-center bg-[#111] px-6 text-[14px] uppercase tracking-[1.4px] text-white [font-family:Jaldi,'JetBrains_Mono',monospace]"
                      type="button"
                      onClick={handleSubmit}
                      disabled={actionLoading}
                    >
                      {form.id ? "Сохранить" : "Создать"}
                    </button>
                    <button
                      className="inline-flex h-12 items-center justify-center border border-[#111] px-6 text-[14px] uppercase tracking-[1.4px] text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]"
                      type="button"
                      onClick={() => setForm({ id: "", title: "", contact: "", phone: "", address: "", comment: "", isDefault: false })}
                      disabled={actionLoading}
                    >
                      Очистить
                    </button>
                    {form.id ? (
                      <button
                        className="inline-flex h-12 items-center justify-center border border-[#111] px-6 text-[14px] uppercase tracking-[1.4px] text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]"
                        type="button"
                        onClick={handleDelete}
                        disabled={actionLoading}
                      >
                        Удалить
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                {templates.map((template) => (
                  <article key={template.id} className="border border-[#ece8e1] bg-white p-10">
                    <h2 className="text-[34px] [font-family:'Cormorant_Garamond',serif]">{template.title}</h2>
                    <div className="mt-8 space-y-4 text-[17px] text-[#6f6f69]">
                      <p><span className="text-[#8b8b86]">Контакт:</span> {template.contact}</p>
                      <p><span className="text-[#8b8b86]">Телефон:</span> {template.phone}</p>
                      <p><span className="text-[#8b8b86]">Адрес:</span> {template.address}</p>
                      <p><span className="text-[#8b8b86]">Комментарий:</span> {template.comment}</p>
                    </div>
                    <div className="mt-8 flex gap-3">
                      {template.isDefault ? (
                        <span className="inline-flex h-12 items-center justify-center bg-[#111] px-6 text-[14px] uppercase tracking-[1.4px] text-white [font-family:Jaldi,'JetBrains_Mono',monospace]">По умолчанию</span>
                      ) : (
                        <span className="inline-flex h-12 items-center justify-center border border-[#111] px-6 text-[14px] uppercase tracking-[1.4px] text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]">Сохраненный шаблон</span>
                      )}
                      <button
                        className="inline-flex h-12 items-center justify-center border border-[#111] px-6 text-[14px] uppercase tracking-[1.4px] text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]"
                        type="button"
                        onClick={() =>
                          setForm({
                            id: template.id,
                            title: template.title,
                            contact: template.contact,
                            phone: template.phone,
                            address: template.address,
                            comment: template.comment,
                            isDefault: template.isDefault,
                          })
                        }
                      >
                        Редактировать
                      </button>
                    </div>
                  </article>
                ))}
                {templates.length === 0 ? <div className="text-[18px] text-[#6f6f69]">Сохраненных шаблонов пока нет.</div> : null}
              </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AccountTemplatesPage;
