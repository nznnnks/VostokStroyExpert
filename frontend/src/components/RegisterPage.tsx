import { useState, type FormEvent } from "react";

import AuthHeaderButton from "./AuthHeaderButton";
import SiteFooter from "./SiteFooter";
import { registerUser } from "../lib/auth";

export function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerUser(fullName, email, password);
      window.location.href = "/account";
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось зарегистрироваться.");
    } finally {
      setLoading(false);
    }
  }

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

        <section className="border-b border-[#ece8e1]">
          <div className="grid xl:grid-cols-[1.12fr_1fr]">
          <div className="border-r border-[#ece8e1] bg-[#efefec]">
            <img
              src="/register/register-photo.png"
              alt="Геометрическая композиция"
              width="1600"
              height="2100"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-full min-h-[560px] w-full object-cover"
            />
          </div>

          <div className="flex items-center px-6 py-14 md:px-12 xl:px-18 xl:py-20">
            <div className="mx-auto w-full max-w-[560px]">
              <p className="text-[clamp(0.68rem,0.5vw,0.85rem)] uppercase tracking-[1.5px] text-[#7a7a75] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                <a href="/" className="hover:text-[#111]">Главная</a>
                <span className="mx-2 text-[#b5b2ab]">/</span>
                <span>Регистрация</span>
              </p>
              <h1 className="mt-6 text-[clamp(2.4rem,5vw,5.2rem)] leading-none [font-family:'Cormorant_Garamond',serif]">Регистрация</h1>
              <div className="mt-6 h-px w-[74px] bg-[#d3b46a]" />

              <form className="mt-20 space-y-14" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-[clamp(0.8rem,0.7vw,1rem)] uppercase tracking-[2px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">Имя</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Ваше полное имя"
                    className="mt-8 h-16 w-full border-b border-[#d9d4cc] bg-transparent text-[clamp(1.1rem,1.4vw,1.5rem)] text-[#c8c7c2] outline-none placeholder:text-[#c9c9c4]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-[clamp(0.8rem,0.7vw,1rem)] uppercase tracking-[2px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                    Электронная почта
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="example@aura.com"
                    className="mt-8 h-16 w-full border-b border-[#d9d4cc] bg-transparent text-[clamp(1.1rem,1.4vw,1.5rem)] text-[#c8c7c2] outline-none placeholder:text-[#c9c9c4]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-[clamp(0.8rem,0.7vw,1rem)] uppercase tracking-[2px] text-[#7d7d78] [font-family:Jaldi,'JetBrains_Mono',monospace]">Пароль</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="mt-8 h-16 w-full border-b border-[#d9d4cc] bg-transparent text-[clamp(1.1rem,1.4vw,1.5rem)] text-[#c8c7c2] outline-none placeholder:text-[#c9c9c4]"
                    required
                    minLength={6}
                  />
                </label>

                {error ? <p className="text-[clamp(0.85rem,0.8vw,0.95rem)] leading-7 text-[#b24c47]">{error}</p> : null}

                <button
                  disabled={loading}
                  className="inline-flex h-20 w-full items-center justify-center gap-8 bg-[#111] px-10 text-[clamp(1rem,1.2vw,1.35rem)] uppercase tracking-[3px] text-white [font-family:Jaldi,'JetBrains_Mono',monospace]"
                >
                  <span>{loading ? "регистрация..." : "зарегистрироваться"}</span>
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

              <div className="mt-20 flex items-center gap-6 text-[clamp(0.75rem,0.6vw,0.95rem)] uppercase tracking-[2px] text-[#9a9993] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                <span className="h-px flex-1 bg-[#e1ddd5]" />
                <span>Precise Control</span>
                <span className="h-px flex-1 bg-[#e1ddd5]" />
              </div>

              <p className="mt-8 text-center text-[clamp(1rem,1vw,1.15rem)] text-[#7d7d78]">
                Уже есть аккаунт?{" "}
                <a href="/login" className="border-b border-[#d3b46a] font-semibold text-[#111]">
                  Войти
                </a>
              </p>
            </div>
          </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}

export default RegisterPage;
