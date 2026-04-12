import { defineMiddleware } from "astro:middleware";

import { buildApiUrl } from "./lib/api-client";
import { AUTH_TOKEN_COOKIE_KEY, AUTH_TYPE_COOKIE_KEY } from "./lib/auth";

const ADMIN_ROUTE_PREFIX = "/admin";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;

  if (!(pathname === ADMIN_ROUTE_PREFIX || pathname.startsWith(`${ADMIN_ROUTE_PREFIX}/`))) {
    return next();
  }

  const accessToken = context.cookies.get(AUTH_TOKEN_COOKIE_KEY)?.value;
  const authType = context.cookies.get(AUTH_TYPE_COOKIE_KEY)?.value;

  if (!accessToken) {
    return context.redirect(`/login?next=${encodeURIComponent(`${pathname}${search}`)}`);
  }

  try {
    const response = await fetch(buildApiUrl("/api/auth/admin/me"), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return next();
    }
  } catch {
    return context.redirect("/login");
  }

  return context.redirect(authType === "user" ? "/account" : "/login");
});
