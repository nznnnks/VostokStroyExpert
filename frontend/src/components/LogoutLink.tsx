import type { ReactNode } from "react";

import { clearStoredAuthSession } from "../lib/auth";

type LogoutLinkProps = {
  className?: string;
  href?: string;
  children: ReactNode;
};

export function LogoutLink({ className, href = "/login", children }: LogoutLinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        clearStoredAuthSession();
      }}
    >
      {children}
    </a>
  );
}

export default LogoutLink;
