import { apiRequest } from "./api-client";

export type StoredAuthType = "user" | "admin";

export type UserSessionPayload = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
};

export type AdminSessionPayload = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
};

export type StoredAuthSession = {
  type: StoredAuthType;
  accessToken: string;
  tokenType: string;
  expiresIn?: string | number;
  user?: UserSessionPayload | null;
  admin?: AdminSessionPayload | null;
};

type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: string | number;
  user?: {
    id: string;
    email: string;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
    clientProfile?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  };
  admin?: {
    id: string;
    email: string;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
  };
};

type RegisterResponse = {
  requiresEmailVerification: boolean;
  email: string;
};

type LoginInitResponse =
  | LoginResponse
  | { requiresLoginCode: true; email: string }
  | { requiresEmailVerification: true; email: string };

const AUTH_STORAGE_KEY = "vostokstroyexpert-auth";
export const AUTH_TOKEN_COOKIE_KEY = "vostokstroyexpert-access-token";
export const AUTH_TYPE_COOKIE_KEY = "vostokstroyexpert-auth-type";

function isAdminRole(role?: string | null) {
  return role === "SUPERADMIN" || role === "MANAGER" || role === "EDITOR";
}

function isBrowser() {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 12) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function syncAuthSessionCookies(session: StoredAuthSession) {
  setCookie(AUTH_TOKEN_COOKIE_KEY, session.accessToken);
  setCookie(AUTH_TYPE_COOKIE_KEY, session.type);
}

export function getStoredAuthSession(): StoredAuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as StoredAuthSession;
    syncAuthSessionCookies(session);
    return session;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    clearCookie(AUTH_TOKEN_COOKIE_KEY);
    clearCookie(AUTH_TYPE_COOKIE_KEY);
    return null;
  }
}

export function setStoredAuthSession(session: StoredAuthSession) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  syncAuthSessionCookies(session);
}

export function clearStoredAuthSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  clearCookie(AUTH_TOKEN_COOKIE_KEY);
  clearCookie(AUTH_TYPE_COOKIE_KEY);
}

export function getStoredAccessToken(expectedType?: StoredAuthType) {
  const session = getStoredAuthSession();

  if (!session) {
    return null;
  }

  if (expectedType && session.type !== expectedType) {
    return null;
  }

  return session.accessToken;
}

export function getStoredDisplayName() {
  const session = getStoredAuthSession();

  if (!session) {
    return null;
  }

  const person = session.type === "admin" ? session.admin : session.user;
  const fullName = [person?.firstName, person?.lastName].filter(Boolean).join(" ").trim();

  return fullName || person?.email || null;
}

export async function validateStoredAuthSession() {
  const session = getStoredAuthSession();

  if (!session) {
    return null;
  }

  try {
    if (session.type === "admin") {
      await apiRequest("/api/auth/admin/me", {
        authToken: session.accessToken,
      });
    } else {
      await apiRequest("/api/users/me", {
        authToken: session.accessToken,
      });
    }

    return session;
  } catch {
    clearStoredAuthSession();
    return null;
  }
}

export async function loginUser(email: string, password: string) {
  const response = await apiRequest<LoginInitResponse>("/api/auth/user/login", {
    method: "POST",
    body: { email, password },
  });

  if ("accessToken" in response) {
    if (response.admin) {
      const session: StoredAuthSession = {
        type: "admin",
        accessToken: response.accessToken,
        tokenType: response.tokenType,
        expiresIn: response.expiresIn,
        admin: {
          id: response.admin.id,
          email: response.admin.email,
          role: response.admin.role,
          firstName: response.admin.firstName ?? null,
          lastName: response.admin.lastName ?? null,
        },
      };

      setStoredAuthSession(session);
      return session;
    }

    const session: StoredAuthSession = {
      type: "user",
      accessToken: response.accessToken,
      tokenType: response.tokenType,
      expiresIn: response.expiresIn,
      user: response.user
        ? {
            id: response.user.id,
            email: response.user.email,
            role: response.user.role,
            firstName: response.user.firstName ?? response.user.clientProfile?.firstName ?? null,
            lastName: response.user.lastName ?? response.user.clientProfile?.lastName ?? null,
          }
        : null,
    };

    setStoredAuthSession(session);
    return session;
  }

  return response;
}

export async function loginAdmin(email: string, password: string) {
  const response = await apiRequest<LoginResponse>("/api/auth/admin/login", {
    method: "POST",
    body: { email, password },
  });

  const session: StoredAuthSession = {
    type: "admin",
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    expiresIn: response.expiresIn,
    admin: response.admin
      ? {
          id: response.admin.id,
          email: response.admin.email,
          role: response.admin.role,
          firstName: response.admin.firstName ?? null,
          lastName: response.admin.lastName ?? null,
        }
      : null,
  };

  setStoredAuthSession(session);
  return session;
}

export async function registerUser(fullName: string, email: string, password: string, phone?: string) {
  return apiRequest<RegisterResponse>("/api/auth/user/register", {
    method: "POST",
    body: { fullName, email, password, phone },
  });
}

export async function verifyUserEmail(email: string, code: string) {
  const response = await apiRequest<LoginResponse>("/api/auth/user/verify-email", {
    method: "POST",
    body: { email, code },
  });

  const session: StoredAuthSession = {
    type: "user",
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    expiresIn: response.expiresIn,
    user: response.user
      ? {
          id: response.user.id,
          email: response.user.email,
          role: response.user.role,
          firstName: response.user.firstName ?? response.user.clientProfile?.firstName ?? null,
          lastName: response.user.lastName ?? response.user.clientProfile?.lastName ?? null,
        }
      : null,
  };

  setStoredAuthSession(session);
  return session;
}

export async function resendUserEmailVerification(email: string) {
  return apiRequest<{ ok: true }>("/api/auth/user/resend-verification", {
    method: "POST",
    body: { email },
  });
}

export async function verifyUserLoginCode(email: string, code: string) {
  const response = await apiRequest<LoginResponse>("/api/auth/user/verify-login-code", {
    method: "POST",
    body: { email, code },
  });

  const session: StoredAuthSession = {
    type: "user",
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    expiresIn: response.expiresIn,
    user: response.user
      ? {
          id: response.user.id,
          email: response.user.email,
          role: response.user.role,
          firstName: response.user.firstName ?? response.user.clientProfile?.firstName ?? null,
          lastName: response.user.lastName ?? response.user.clientProfile?.lastName ?? null,
        }
      : null,
  };

  setStoredAuthSession(session);
  return session;
}

export async function resendUserLoginCode(email: string) {
  return apiRequest<{ ok: true }>("/api/auth/user/resend-login-code", {
    method: "POST",
    body: { email },
  });
}
