/// Vérifications de permissions et de rôles pour Clinique NOS.

import { redirect } from "next/navigation";
import type { AuthRole } from "../../auth";
import { getAuthSession } from "./session";

// Rôles autorisés à accéder à l'espace staff.
const STAFF_ROLES: AuthRole[] = ["doctor", "secretary", "clinic_admin"];

/// Vérifie qu'une session existe, sinon redirige vers la connexion.
export async function requireAuth() {
  const session = await getAuthSession();

  // Redirige vers la connexion si aucune session n'existe.
  if (!session) {
    redirect("/login");
  }

  return session;
}

/// Vérifie qu'un rôle précis est autorisé.
export async function requireRole(allowedRoles: AuthRole[]) {
  const session = await requireAuth();

  // Redirige vers l'accueil si le rôle n'est pas autorisé.
  if (!allowedRoles.includes(session.role)) {
    redirect("/");
  }

  return session;
}

/// Vérifie l'accès à l'espace staff.
export async function requireStaffAccess() {
  // Réutilise la règle staff centralisée pour rester cohérent.
  return requireRole(STAFF_ROLES);
}

/// Vérifie l'accès à l'espace patient.
export async function requirePatientAccess() {
  // Limite l'espace patient au seul rôle patient.
  return requireRole(["patient"]);
}

/// Indique si un utilisateur possède un rôle autorisé.
export function hasRole(role: AuthRole, allowedRoles: AuthRole[]) {
  // Compare simplement le rôle courant à la liste autorisée.
  return allowedRoles.includes(role);
}
