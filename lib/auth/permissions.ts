/// Vérifications de permissions et de rôles pour Clinique NOS.

import { redirect } from "next/navigation";
import type { AuthRole } from "../../auth";
import { getAuthSession } from "./session";

const STAFF_ROLES: AuthRole[] = ["doctor", "secretary", "clinic_admin"];

/// Vérifie qu'une session existe, sinon redirige vers la connexion.
export async function requireAuth() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/// Vérifie qu'un rôle précis est autorisé.
export async function requireRole(allowedRoles: AuthRole[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.role)) {
    redirect("/");
  }

  return session;
}

/// Vérifie l'accès à l'espace staff.
export async function requireStaffAccess() {
  return requireRole(STAFF_ROLES);
}

/// Vérifie l'accès à l'espace patient.
export async function requirePatientAccess() {
  return requireRole(["patient"]);
}

/// Indique si un utilisateur possède un rôle autorisé.
export function hasRole(role: AuthRole, allowedRoles: AuthRole[]) {
  return allowedRoles.includes(role);
}
