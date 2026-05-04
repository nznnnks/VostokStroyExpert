import { useEffect, useId, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

import { confirmPasswordReset, requestPasswordReset } from "../lib/auth";

type PasswordRecoveryModalProps = {
  initialEmail?: string;
  onRecovered?: (email: string) => void;
};

export function PasswordRecoveryModal({ initialEmail = "", onRecovered }: PasswordRecoveryModalProps) {
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState<"email" | "confirm" | "success">("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: 6 }).map(() => ""));
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") startClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep("email");
    setEmail(initialEmail);
    setDigits(Array.from({ length: 6 }).map(() => ""));
    setPassword("");
    setPasswordRepeat("");
    setShowPassword(false);
    setShowPasswordRepeat(false);
    setLoading(false);
    setError(null);
  };

  const finishClose = () => {
    setRendered(false);
    setIsOpen(false);
    setIsClosing(false);
    setError(null);
  };

  const startClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => finishClose(), 260);
  };

  const open = () => {
    resetForm();
    setIsOpen(true);
    window.setTimeout(() => inputsRef.current[0]?.focus(), 50);
  };

  const code = digits.join("");
  const canConfirm = code.length === 6 && !digits.some((value) => value.length !== 1) && password.length >= 6;

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

  function handleDigitKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
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

  async function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email.trim());
      setStep("confirm");
      setDigits(Array.from({ length: 6 }).map(() => ""));
      window.setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось отправить код.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(email.trim(), code, password, passwordRepeat);
      setStep("success");
      onRecovered?.(email.trim());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось обновить пароль.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          open();
        }}
        className="mt-3 inline-flex w-full justify-end text-[12px] uppercase tracking-[1.6px] text-[#7d7d78] transition hover:text-[#111] [font-family:Jaldi,'JetBrains_Mono',monospace]"
      >
        Восстановить пароль
      </button>

      {rendered && mounted
        ? createPortal(
            <div
              className={`fixed inset-0 z-[300] flex items-end justify-center px-3 py-3 transition-opacity duration-200 sm:items-center sm:px-5 ${
                isClosing ? "bg-black/0 opacity-0" : "bg-black/60 opacity-100"
              }`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) startClose();
              }}
            >
              <div
                className={`relative w-full max-w-[640px] overflow-hidden rounded-[24px] border border-[#ddd1bf] bg-[linear-gradient(180deg,#fffdfa_0%,#f2ece4_100%)] shadow-[0_36px_90px_rgba(0,0,0,0.2)] transition-[opacity,transform] duration-300 ease-out ${
                  isClosing ? "translate-y-3 scale-[0.98] opacity-0" : "translate-y-0 scale-100 opacity-100"
                }`}
              >
                <button
                  type="button"
                  onClick={startClose}
                  className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#111]/15 text-[26px] leading-none text-[#111] transition hover:bg-[#111] hover:text-white"
                  aria-label="Закрыть"
                >
                  ×
                </button>

                <div className="px-6 pb-3 pt-7 sm:px-8 sm:pt-8">
                  <p className="text-[11px] uppercase tracking-[1.5px] text-[#7a7a75] [font-family:'JetBrains_Mono',monospace]">
                    Аккаунт
                  </p>
                  <h2 id={titleId} className="mt-2 text-[clamp(1.8rem,5.2vw,3.1rem)] leading-[0.98] [font-family:'Cormorant_Garamond',serif]">
                    Восстановление пароля
                  </h2>
                </div>

                {step === "email" ? (
                  <form onSubmit={handleRequestCode} className="grid gap-5 px-6 pb-7 sm:px-8 sm:pb-8">
                    <p className="text-[14px] leading-6 text-[#7d7d78]">
                      Введите email — мы отправим 6‑значный код для сброса пароля.
                    </p>

                    <label className="grid gap-2">
                      <span className="text-[11px] uppercase tracking-[1.4px] text-[#7a7a75] [font-family:'JetBrains_Mono',monospace]">
                        Электронная почта
                      </span>
                      <input
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setError(null);
                        }}
                        className="h-14 border border-[#cfcac1] bg-[#f6f3ed] px-4 text-[18px] text-[#111] outline-none transition focus:border-[#111]"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="example@domain.com"
                        required
                      />
                    </label>

                    {error ? <p className="text-[14px] leading-5 text-[#9a2d2d]">{error}</p> : null}

                    <button
                      type="submit"
                      className="mt-1 inline-flex h-14 items-center justify-center bg-[#111] px-6 text-[13px] uppercase tracking-[1.4px] text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_16px_36px_rgba(0,0,0,0.24)] active:translate-y-0 disabled:opacity-60 [font-family:'JetBrains_Mono',monospace]"
                      disabled={loading}
                    >
                      {loading ? "..." : "Отправить код"}
                    </button>
                  </form>
                ) : null}

                {step === "confirm" ? (
                  <form onSubmit={handleConfirm} className="grid gap-5 px-6 pb-7 sm:px-8 sm:pb-8">
                    <p className="text-[14px] leading-6 text-[#7d7d78]">
                      Мы отправили код на <span className="font-semibold text-[#111]">{email.trim()}</span>. Введите код и
                      придумайте новый пароль.
                    </p>

                    <div>
                      <p className="text-[11px] uppercase tracking-[1.4px] text-[#7a7a75] [font-family:'JetBrains_Mono',monospace]">
                        Код
                      </p>
                      <div className="mt-3 grid grid-cols-6 gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <label key={index} className="block">
                            <span className="sr-only">Цифра {index + 1}</span>
                            <input
                              inputMode="numeric"
                              maxLength={1}
                              placeholder="0"
                              value={digits[index] ?? ""}
                              onChange={(event) => setDigit(index, event.target.value)}
                              onKeyDown={(event) => handleDigitKeyDown(index, event)}
                              onPaste={index === 0 ? handlePaste : undefined}
                              ref={(node) => {
                                inputsRef.current[index] = node;
                              }}
                              className="h-14 w-full border border-[#cfcac1] bg-[#f6f3ed] text-center text-[22px] text-[#111] outline-none transition focus:border-[#111] [font-family:'JetBrains_Mono',monospace]"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="grid gap-2">
                      <span className="text-[11px] uppercase tracking-[1.4px] text-[#7a7a75] [font-family:'JetBrains_Mono',monospace]">
                        Новый пароль
                      </span>
                      <div className="relative">
                        <input
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value);
                            setError(null);
                          }}
                          className="h-14 w-full border border-[#cfcac1] bg-[#f6f3ed] px-4 pr-14 text-[18px] text-[#111] outline-none transition focus:border-[#111]"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          autoComplete="new-password"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[12px] uppercase tracking-[1.2px] text-[#7a7a75] transition hover:text-[#111] [font-family:'JetBrains_Mono',monospace]"
                          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                        >
                          {showPassword ? "Скрыть" : "Показать"}
                        </button>
                      </div>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[11px] uppercase tracking-[1.4px] text-[#7a7a75] [font-family:'JetBrains_Mono',monospace]">
                        Повторите пароль
                      </span>
                      <div className="relative">
                        <input
                          value={passwordRepeat}
                          onChange={(event) => {
                            setPasswordRepeat(event.target.value);
                            setError(null);
                          }}
                          className="h-14 w-full border border-[#cfcac1] bg-[#f6f3ed] px-4 pr-14 text-[18px] text-[#111] outline-none transition focus:border-[#111]"
                          type={showPasswordRepeat ? "text" : "password"}
                          name="passwordRepeat"
                          autoComplete="new-password"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordRepeat((value) => !value)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[12px] uppercase tracking-[1.2px] text-[#7a7a75] transition hover:text-[#111] [font-family:'JetBrains_Mono',monospace]"
                          aria-label={showPasswordRepeat ? "Скрыть пароль" : "Показать пароль"}
                        >
                          {showPasswordRepeat ? "Скрыть" : "Показать"}
                        </button>
                      </div>
                    </label>

                    {error ? <p className="text-[14px] leading-5 text-[#9a2d2d]">{error}</p> : null}

                    <button
                      type="submit"
                      className="mt-1 inline-flex h-14 items-center justify-center bg-[#111] px-6 text-[13px] uppercase tracking-[1.4px] text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_16px_36px_rgba(0,0,0,0.24)] active:translate-y-0 disabled:opacity-60 [font-family:'JetBrains_Mono',monospace]"
                      disabled={loading || !canConfirm}
                    >
                      {loading ? "..." : "Обновить пароль"}
                    </button>
                  </form>
                ) : null}

                {step === "success" ? (
                  <div className="grid gap-5 px-6 pb-7 sm:px-8 sm:pb-8">
                    <p className="text-[14px] leading-6 text-[#7d7d78]">
                      Пароль успешно обновлён. Мы также отправили уведомление на почту.
                    </p>
                    <button
                      type="button"
                      onClick={startClose}
                      className="mt-1 inline-flex h-14 items-center justify-center bg-[#111] px-6 text-[13px] uppercase tracking-[1.4px] text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_16px_36px_rgba(0,0,0,0.24)] active:translate-y-0 [font-family:'JetBrains_Mono',monospace]"
                    >
                      Вернуться ко входу
                    </button>
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export default PasswordRecoveryModal;
