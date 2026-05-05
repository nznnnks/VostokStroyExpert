import { defineMiddleware } from "astro:middleware";

import { buildApiUrl } from "./lib/api-client";
import { AUTH_TOKEN_COOKIE_KEY, AUTH_TYPE_COOKIE_KEY } from "./lib/auth";

const ADMIN_ROUTE_PREFIX = "/admin";
const CHECKOUT_ROUTE_PREFIX = "/checkout";
const ACCOUNT_ROUTE_PREFIX = "/account";

const PUBLIC_HTML_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=600";
const PRIVATE_HTML_CACHE_CONTROL = "no-store";

function isPrivateRoute(pathname: string) {
  return (
    pathname === ADMIN_ROUTE_PREFIX ||
    pathname.startsWith(`${ADMIN_ROUTE_PREFIX}/`) ||
    pathname === CHECKOUT_ROUTE_PREFIX ||
    pathname.startsWith(`${CHECKOUT_ROUTE_PREFIX}/`) ||
    pathname === ACCOUNT_ROUTE_PREFIX ||
    pathname.startsWith(`${ACCOUNT_ROUTE_PREFIX}/`) ||
    pathname === "/cart" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/code"
  );
}

function applySecurityHeaders(response: Response) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // Enable HSTS only when served over HTTPS (avoid breaking local/dev HTTP).
  if (import.meta.env.PROD) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}

function applyCacheHeaders(pathname: string, response: Response) {
  if (response.headers.has("Cache-Control")) return;

  const contentType = response.headers.get("Content-Type") ?? response.headers.get("content-type") ?? "";
  const isHtml = contentType.includes("text/html");

  if (!isHtml) return;

  response.headers.set("Cache-Control", isPrivateRoute(pathname) ? PRIVATE_HTML_CACHE_CONTROL : PUBLIC_HTML_CACHE_CONTROL);
}

async function verifyAccess(path: string, accessToken: string) {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.ok;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const requestedPath = `${pathname}${search}`;
  const accessToken = context.cookies.get(AUTH_TOKEN_COOKIE_KEY)?.value;
  const authType = context.cookies.get(AUTH_TYPE_COOKIE_KEY)?.value;
  const isQuickCheckout = pathname === CHECKOUT_ROUTE_PREFIX && context.url.searchParams.has("product");

  const finalizeResponse = (response: Response) => {
    applySecurityHeaders(response);
    applyCacheHeaders(pathname, response);
    return response;
  };

  if (pathname === CHECKOUT_ROUTE_PREFIX || pathname.startsWith(`${CHECKOUT_ROUTE_PREFIX}/`)) {
    if (isQuickCheckout) {
      return finalizeResponse(await next());
    }

    if (!accessToken || authType !== "user") {
      return finalizeResponse(context.redirect(`/login?next=${encodeURIComponent(requestedPath)}`));
    }

    try {
      if (await verifyAccess("/api/users/me", accessToken)) {
        return finalizeResponse(await next());
      }
    } catch {
      return finalizeResponse(context.redirect(`/login?next=${encodeURIComponent(requestedPath)}`));
    }

    return finalizeResponse(context.redirect(`/login?next=${encodeURIComponent(requestedPath)}`));
  }

  if (!(pathname === ADMIN_ROUTE_PREFIX || pathname.startsWith(`${ADMIN_ROUTE_PREFIX}/`))) {
    return finalizeResponse(await next());
  }

  if (!accessToken || authType !== "admin") {
    return finalizeResponse(context.redirect(`/login?next=${encodeURIComponent(requestedPath)}`));
  }

  try {
    if (await verifyAccess("/api/auth/admin/me", accessToken)) {
      return finalizeResponse(await next());
    }
  } catch {
    return finalizeResponse(context.redirect("/login"));
  }

  return finalizeResponse(context.redirect(authType === "user" ? "/account" : "/login"));
});
