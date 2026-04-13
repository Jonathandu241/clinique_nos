/// Service de gestion des notifications.
import { createNotificationLog, updateNotificationStatus } from "./repository";
import { simulateSend } from "./provider";
import { NotificationChannel, NotificationStatus } from "./types";

interface SendNotificationParams {
  appointmentId: string;
  template: string;
  channel: NotificationChannel;
  recipient: string;
  content: string; // Le contenu déjà formatté via le template
}

/**
 * Envoie une notification et gère son cycle de vie en base de données.
 * Cette fonction est robuste : un échec d'envoi n'arrête pas le thread 
 * mais est marqué comme 'failed' en base.
 */
export async function sendNotification({
  appointmentId,
  template,
  channel,
  recipient,
  content
}: SendNotificationParams) {
  let logId: string | null = null;

  try {
    // 1. Enregistrement de l'intention en base (Pending)
    const log = await createNotificationLog({
      appointmentId,
      template,
      channel,
      recipient,
      status: NotificationStatus.pending
    });
    logId = log.id;

    // 2. Envoi simulé
    const providerRef = await simulateSend(channel, recipient, content);

    // 3. Mise à jour du succès
    await updateNotificationStatus(logId, NotificationStatus.sent, providerRef);
    
    return { success: true, logId, providerRef };
  } catch (error) {
    console.error(`[NotificationService] Erreur lors de l'envoi vers ${recipient}:`, error);

    // Si on a déjà créé le log, on marque l'échec
    if (logId) {
      await updateNotificationStatus(logId, NotificationStatus.failed);
    }
    
    return { success: false, error };
  }
}
