import { useEffect, useState } from "react";

import { ApiError } from "../lib/api-client";
import { loadAccountSnapshot, type AccountProfileView } from "../lib/backend-api";
import { AccountInfoContent } from "./AccountInfoContent";
import { AccountLayout } from "./AccountLayout";

function StateMessage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-10 border border-[#ece8e1] bg-white px-8 py-10">
      <h2 className="text-[30px] [font-family:'Cormorant_Garamond',serif]">{title}</h2>
      <p className="mt-4 text-[18px] leading-8 text-[#6f6f69]">{description}</p>
    </div>
  );
}

export function AccountSupportPage() {
  const [profile, setProfile] = useState<AccountProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const data = await loadAccountSnapshot();

        if (!active) {
          return;
        }

        setProfile(data.profile);
        setError(null);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError instanceof Error ? nextError : new Error("Не удалось загрузить поддержку."));
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

  return (
    <AccountLayout active="support">
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e6e0d7] bg-[#faf8f4]">
          <img src="/account/support.svg" alt="" aria-hidden="true" width="32" height="32" className="h-8 w-8 object-contain opacity-70" />
        </div>
        <h1 className="text-[clamp(2rem,7vw,5rem)] leading-none [font-family:'Cormorant_Garamond',serif]">Информация</h1>
      </div>

      {loading ? <StateMessage title="Загрузка" description="Загружаю данные пользователя." /> : null}
      {!loading && authRequired ? (
        <StateMessage title="Нужен вход" description="Для обращения в поддержку войдите под пользовательской учетной записью." />
      ) : null}
      {!loading && error && !authRequired ? (
        <StateMessage title="Ошибка загрузки" description={error.message || "Не удалось загрузить поддержку."} />
      ) : null}

      {!loading && !error ? (
        <>
          <AccountInfoContent variant="page" />
        </>
      ) : null}
    </AccountLayout>
  );
}

export default AccountSupportPage;
