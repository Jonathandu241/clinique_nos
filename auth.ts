/// Configuration d'authentification minimale pour Clinique NOS.

// Nom du cookie qui transporte la session signée.
export const AUTH_COOKIE_NAME = "clinique-nos.session";
// Durée de vie standard d'une session active.
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
// Secret de secours utilisé seulement en développement local.
export const AUTH_SECRET_FALLBACK = "clinique-nos-dev-secret-change-me";

// Liste fermée des rôles autorisés dans la V1.
export const AUTH_ROLES = ["patient", "doctor", "secretary", "clinic_admin"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export type AuthSessionUser = {
  id: string;
  email: string;
  role: AuthRole;
};
