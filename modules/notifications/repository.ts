/// Repository pour la gestion des événements de notification en base de données.
import { prisma } from "@/lib/db/prisma";
import { NotificationChannel, NotificationStatus, CreateNotificationInput } from "./types";

/// Crée une nouvelle entrée de notification dans la table evenements_notification.
/// @param data Les données d'entrée pour la création de la notification.
export async function createNotificationLog(data: CreateNotificationInput) {
  return await prisma.notificationEvent.create({
    data: {
      appointmentId: data.appointmentId,
      template: data.template,
      channel: data.channel,
      recipient: data.recipient,
      status: data.status || NotificationStatus.pending,
    },
  });
}

/// Met à jour le statut d'une notification existante.
/// @param id L'identifiant de la notification.
/// @param status Le nouveau statut (sent, failed).
/// @param providerReference La référence optionnelle du fournisseur externe.
export async function updateNotificationStatus(
  id: string,
  status: NotificationStatus,
  providerReference?: string
) {
  return await prisma.notificationEvent.update({
    where: { id },
    data: {
      status,
      providerReference,
      sentAt: status === NotificationStatus.sent ? new Date() : undefined,
    },
  });
}

/// Récupère l'historique des notifications pour un rendez-vous.
/// @param appointmentId L'identifiant du rendez-vous.
export async function getNotificationsByAppointmentId(appointmentId: string) {
  return await prisma.notificationEvent.findMany({
    where: { appointmentId },
    orderBy: { createdAt: "desc" },
  });
}
