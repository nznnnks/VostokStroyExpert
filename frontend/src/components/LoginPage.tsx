import { useState, type FormEvent } from "react";

import { loginUser } from "../lib/auth";
import SiteHeader from "./SiteHeader";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await loginUser(email, password);
      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext = next && next.startsWith("/") ? next : null;

      window.location.href = session.type === "admin" ? "/admin" : safeNext || "/account";
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось выполнить вход.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-white text-[#111] [font-family:DM_Sans,Manrope,'Liberation_Sans',sans-serif]">
      <SiteHeader />

      <section className="border-b border-[#ece8e1]">
        <div className="grid h-[calc(100vh-112px)] overflow-hidden xl:grid-cols-[1.4fr_1fr]">
          <div className="flex items-center justify-center border-r border-[#ece8e1] bg-[#efefec] p-6">
            <img
              src="/login/login-photo.png"
              alt="Промышленная система"
              width="1600"
              height="2100"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="max-h-full w-auto max-w-full object-contain"
            />
          </div>

          <div className="flex items-center px-6 py-4 md:px-12 xl:px-16">
            <div className="mx-auto w-full max-w-[480px]">
              <p className="text-[13px] uppercase tracking-[1.5px] text-[#7a7a75] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                <a href="/" className="hover:text-[#111]">Главная</a>
                <span className="mx-2 text-[#b5b2ab]">/</span>
                <span>Вход</span>
              </p>
              <h1 className="mt-3 text-[clamp(1.9rem,3.6vw,3.2rem)] leading-[1.05] [font-family:'Cormorant_Garamond',serif]">
                Вход в личный кабинет
              </h1>
              <p className="mt-2 max-w-[460px] text-[clamp(0.9rem,1.1vw,1.05rem)] leading-[1.45] text-[#7d7d78]">
                Войдите, чтобы продолжить работу с заказами, шаблонами и персональными настройками.
              </p>

              <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-[16px] uppercase tracking-[2px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                    Электронная почта
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="mt-2 h-10 w-full border-b border-[#d9d4cc] bg-transparent text-[clamp(0.95rem,1.5vw,1.15rem)] text-[#111] outline-none placeholder:text-[#d4d3ce]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-[16px] uppercase tracking-[2px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                    Пароль
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="mt-2 h-10 w-full border-b border-[#d9d4cc] bg-transparent text-[clamp(0.95rem,1.5vw,1.15rem)] text-[#111] outline-none placeholder:text-[#d4d3ce]"
                    required
                  />
                </label>

                {error ? <p className="text-[15px] leading-7 text-[#b24c47]">{error}</p> : null}

                <button disabled={loading} className="inline-flex h-11 w-full items-center justify-between bg-[#111] px-8 text-[clamp(0.88rem,1.3vw,1rem)] uppercase tracking-[3px] text-white [font-family:Jaldi,'JetBrains_Mono',monospace]">
                  <span>{loading ? "вход..." : "войти"}</span>
                  <img
                    src="/login/arrow.svg"
                    alt=""
                    aria-hidden="true"
                    width="18"
                    height="18"
                    loading="lazy"
                    decoding="async"
                    className="h-[18px] w-[18px] object-contain"
                  />
                </button>
              </form>

              <div className="mt-4 space-y-2 text-[clamp(0.85rem,1.05vw,0.95rem)] leading-[1.5] text-[#7d7d78]">
                <p>
                  Нет аккаунта?{" "}
                  <a href="/register" className="underline underline-offset-4">
                    Зарегистрируйтесь
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
