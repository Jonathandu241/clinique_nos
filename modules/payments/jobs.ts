/// Logique de haut niveau pour les tâches de fond (Cron) liées aux paiements.

import { expireUnpaidAppointments, getAppointmentsNeedingReminder } from "../appointments/repository";
import { notifyPatientPaymentReminder } from "../notifications/events";

/**
 * Traite l'expiration des rendez-vous impayés.
 */
export async function processExpiredAppointments() {
  console.log("[JOBS] Exécution de processExpiredAppointments...");
  
  try {
    const expiredCount = await expireUnpaidAppointments();
    console.log(`[JOBS] Terminé : ${expiredCount} rendez-vous expirés.`);
    return { success: true, expiredCount };
  } catch (error) {
    console.error("[JOBS] Erreur lors de l'expiration :", error);
    throw error;
  }
}

/**
 * Envoie des rappels pour les rendez-vous dont l'échéance approche.
 */
export async function sendPaymentReminders() {
  console.log("[JOBS] Exécution de sendPaymentReminders...");
  
  try {
    // On cherche les rdv expirant dans les 60 prochaines minutes
    const needingReminders = await getAppointmentsNeedingReminder(60);
    console.log(`[JOBS] ${needingReminders.length} rappels à envoyer.`);

    const results = await Promise.allSettled(
      needingReminders.map(app => notifyPatientPaymentReminder(app.id))
    );

    const sentCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[JOBS] Terminé : ${sentCount} rappels envoyés.`);

    return { success: true, sentCount };
  } catch (error) {
    console.error("[JOBS] Erreur lors de l'envoi des rappels :", error);
    throw error;
  }
}
