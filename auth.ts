/// Configuration d'authentification minimale pour Clinique NOS.

export const AUTH_COOKIE_NAME = "clinique-nos.session";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const AUTH_SECRET_FALLBACK = "clinique-nos-dev-secret-change-me";

export const AUTH_ROLES = ["patient", "doctor", "secretary", "clinic_admin"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export type AuthSessionUser = {
  id: string;
  email: string;
  role: AuthRole;
};
