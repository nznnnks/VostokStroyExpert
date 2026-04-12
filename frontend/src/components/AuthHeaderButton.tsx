import { useEffect, useState } from "react";

import { getStoredDisplayName, type StoredAuthSession, validateStoredAuthSession } from "../lib/auth";

type AuthHeaderButtonProps = {
  className?: string;
  loggedOutLabel?: string;
};

export function AuthHeaderButton({ className, loggedOutLabel = "войти" }: AuthHeaderButtonProps) {
  const [session, setSession] = useState<StoredAuthSession | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const nextSession = await validateStoredAuthSession();

      if (!cancelled) {
        setSession(nextSession);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!session) {
    return (
      <a href="/login" className={className}>
        {loggedOutLabel}
      </a>
    );
  }

  const name = getStoredDisplayName();
  const href = session.type === "admin" ? "/admin" : "/account";
  const label = name || (session.type === "admin" ? "админка" : "кабинет");

  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

export default AuthHeaderButton;
