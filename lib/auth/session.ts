/// Gestion de session serveur pour Clinique NOS.

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME, AUTH_SECRET_FALLBACK, type AuthSessionUser } from "../../auth";

type SessionPayload = {
  // Utilisateur minimal stocké dans le cookie de session.
  user: AuthSessionUser;
  // Date d'expiration absolue de la session en millisecondes.
  expiresAt: number;
};

// Utilise un secret unique pour signer les cookies de session.
function getSessionSecret() {
  return process.env.AUTH_SECRET || AUTH_SECRET_FALLBACK;
}

/// Signe une charge utile JSON de session.
function signPayload(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

/// Encode une session dans une valeur de cookie signe.
function encodeSession(session: SessionPayload) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

/// Decode et verifie une session depuis une valeur de cookie.
function decodeSession(cookieValue: string) {
  const [payload, signature] = cookieValue.split(".");

  // Refuse les cookies mal formés.
  if (!payload || !signature) {
    return null;
  }

  // Refuse les cookies altérés.
  if (signPayload(payload) !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;

    // Refuse les sessions expirées.
    if (parsed.expiresAt < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/// Cree une session persistante pour un utilisateur connecte.
export async function createAuthSession(user: AuthSessionUser) {
  const session: SessionPayload = {
    user,
    expiresAt: Date.now() + AUTH_COOKIE_MAX_AGE_SECONDS * 1000,
  };

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });
}

/// Supprime la session active de l'utilisateur courant.
export async function clearAuthSession() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);
}

/// Retourne la session courante si elle existe et est valide.
export async function getAuthSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  const session = decodeSession(sessionCookie);

  if (!session) {
    return null;
  }

  return session.user;
}

/// Retourne l'utilisateur courant issu de la session valide.
export async function getCurrentUser() {
  return getAuthSession();
}
