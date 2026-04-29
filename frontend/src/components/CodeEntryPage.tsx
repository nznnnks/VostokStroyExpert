import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

import SiteHeader from "./SiteHeader";
import {
  resendUserEmailVerification,
  resendUserLoginCode,
  verifyUserEmail,
  verifyUserLoginCode,
} from "../lib/auth";

export function CodeEntryPage() {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: 6 }).map(() => ""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const { email, nextPath, flow } = useMemo(() => {
    if (typeof window === "undefined") {
      return { email: null as string | null, nextPath: "/account", flow: "verify" as const };
    }

    const params = new URLSearchParams(window.location.search);
    const rawEmail = params.get("email");
    const rawNext = params.get("next");
    const rawFlow = params.get("flow");

    return {
      email: rawEmail,
      nextPath: rawNext || "/account",
      flow: rawFlow === "login" ? ("login" as const) : ("verify" as const),
    };
  }, []);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const code = digits.join("");
  const canSubmit = Boolean(email) && code.length === 6 && !digits.some((value) => value.length !== 1);

  function setDigit(index: number, value: string) {
    const nextValue = value.replace(/\D/g, "").slice(0, 1);

    setDigits((prev) => {
      const copy = [...prev];
      copy[index] = nextValue;
      return copy;
    });

    if (nextValue && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) {
      return;
    }

    event.preventDefault();
    const nextDigits = pasted.split("");
    setDigits(Array.from({ length: 6 }).map((_, index) => nextDigits[index] ?? ""));
    inputsRef.current[Math.min(pasted.length, 6) - 1]?.focus();
  }

  async function handleSubmit() {
    if (!email) {
      setError("Нет адреса почты. Вернитесь на страницу регистрации.");
      return;
    }

    if (!canSubmit) {
      setError("Введите 6-значный код.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (flow === "login") {
        await verifyUserLoginCode(email, code);
      } else {
        await verifyUserEmail(email, code);
      }
      window.location.href = nextPath;
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : flow === "login"
            ? "Не удалось войти."
            : "Не удалось подтвердить почту.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || resending || cooldownSeconds > 0) {
      return;
    }

    setResending(true);
    setError(null);

    try {
      if (flow === "login") {
        await resendUserLoginCode(email);
      } else {
        await resendUserEmailVerification(email);
      }
      setCooldownSeconds(60);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось отправить код.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-white text-[#111] [font-family:DM_Sans,Manrope,'Liberation_Sans',sans-serif]">
      <div className="flex min-h-0 flex-1 flex-col">
        <SiteHeader />

        <section className="flex min-h-0 flex-1 overflow-y-auto px-4 py-6 [webkit-overflow-scrolling:touch] md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-[1120px] border border-[#e8e3db] bg-white 2xl:max-w-[1480px]">
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

              <div className="px-5 py-7 sm:px-6 sm:py-8 md:px-10 md:py-12 lg:px-18 lg:py-16">
                <p className="breadcrumb-nav uppercase tracking-[1.5px] text-[#7a7a75] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                  <a href="/" className="hover:text-[#111]">Главная</a>
                  <span className="mx-2 text-[#b5b2ab]">/</span>
                  <span>Ввод кода</span>
                </p>
                <h1 className="mt-4 text-[clamp(2rem,8.5vw,5.5rem)] leading-none [font-family:'Cormorant_Garamond',serif] md:mt-6">Введите код</h1>
                <p className="mt-5 max-w-[630px] text-[clamp(0.95rem,1.4vw,1.35rem)] leading-[1.5] text-[#7d7d78] md:mt-8 md:leading-[1.55]">
                  {flow === "login"
                    ? "Мы отправили 6-значный код для входа на вашу почту. Пожалуйста, проверьте папку «Входящие» и «Спам»."
                    : "Мы отправили 6-значный код подтверждения на вашу почту. Пожалуйста, проверьте папку «Входящие» и «Спам»."}
                </p>

                <div className="mt-8 grid grid-cols-3 gap-3 md:mt-12 md:grid-cols-6 md:gap-5">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <label key={index} className="block">
                      <span className="sr-only">Цифра {index + 1}</span>
                      <input
                        inputMode="numeric"
                        maxLength={1}
                        placeholder="0"
                        value={digits[index] ?? ""}
                        onChange={(event) => setDigit(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        ref={(node) => {
                          inputsRef.current[index] = node;
                        }}
                        className="h-16 w-full border-b border-[#cfcac0] bg-transparent text-center text-[clamp(1.5rem,3.5vw,2.75rem)] text-[#111] outline-none placeholder:text-[#b5b2ab] md:h-20 [font-family:'Cormorant_Garamond',serif]"
                      />
                    </label>
                  ))}
                </div>

                {error ? <p className="mt-6 text-[clamp(0.85rem,0.8vw,0.95rem)] leading-7 text-[#b24c47]">{error}</p> : null}

                <button
                  disabled={loading || !canSubmit}
                  onClick={handleSubmit}
                  className="mt-8 inline-flex h-12 w-full items-center justify-center bg-[#1f1f1f] px-8 text-[clamp(0.9rem,1.2vw,1.4rem)] uppercase tracking-[1.8px] text-white md:mt-12 md:h-20 md:tracking-[4px] [font-family:Jaldi,'JetBrains_Mono',monospace] disabled:opacity-60"
                >
                  {loading ? "..." : "подтвердить"}
                </button>

                <div className="mt-7 text-center md:mt-12">
                  <p className="text-[clamp(0.82rem,0.9vw,1.15rem)] uppercase tracking-[1.8px] text-[#8f8f89] md:tracking-[3px] [font-family:Jaldi,'JetBrains_Mono',monospace]">
                    {cooldownSeconds > 0
                      ? `отправить код повторно через 00:${String(cooldownSeconds).padStart(2, "0")}`
                      : "можно отправить код повторно"}
                  </p>
                  <button
                    disabled={!email || resending || cooldownSeconds > 0}
                    onClick={handleResend}
                    className="mt-4 inline-flex h-11 w-full items-center justify-center border border-[#111] bg-[#111] px-6 text-[clamp(0.88rem,1vw,1.05rem)] uppercase tracking-[1.6px] text-white transition duration-200 ease-out hover:bg-[#1c1c1c] active:scale-[0.99] md:mt-5 md:h-12 md:tracking-[3px] [font-family:Jaldi,'JetBrains_Mono',monospace] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resending ? "..." : "Отправить код ещё раз"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

    </main>
  );
}

export default CodeEntryPage;
