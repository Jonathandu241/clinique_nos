/// Utilitaire de sécurité pour les routes API appelées par le planificateur de tâches (Cron).

import { NextRequest } from "next/server";

/**
 * Vérifie si la requête est autorisée à exécuter une tâche cron.
 * Utilise le header 'Authorization: Bearer <SECRET>'.
 * 
 * @param request La requête Next.js entrante.
 * @returns true si autorisé, false sinon.
 */
export function isCronAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Si le secret n'est pas configuré, on bloque par sécurité.
  if (!cronSecret) {
    console.error("[CRON_AUTH] Erreur : CRON_SECRET n'est pas défini dans les variables d'environnement.");
    return false;
  }

  // Format attendu : "Bearer <SECRET>"
  const expectedValue = `Bearer ${cronSecret}`;

  return authHeader === expectedValue;
}
