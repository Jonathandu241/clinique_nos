/// Repository pour la gestion des événements de notification en base de données via MySQL2.
import { mysqlPool } from "../../lib/db/mysql";
import { NotificationChannel, NotificationStatus, CreateNotificationInput } from "./types";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

/// Crée une nouvelle entrée de notification dans la table evenements_notification.
export async function createNotificationLog(data: CreateNotificationInput) {
  const id = crypto.randomUUID();
  
  await mysqlPool.query(
    `
    INSERT INTO evenements_notification (
      id, appointment_id, template, channel, recipient, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    [
      id,
      data.appointmentId,
      data.template,
      data.channel,
      data.recipient,
      data.status || NotificationStatus.pending
    ]
  );

  return { id, ...data };
}

/// Met à jour le statut d'une notification existante.
export async function updateNotificationStatus(
  id: string,
  status: NotificationStatus,
  providerReference?: string
) {
  await mysqlPool.query(
    `
    UPDATE evenements_notification
    SET 
      status = ?,
      provider_reference = ?,
      sent_at = ?,
      updated_at = NOW()
    WHERE id = ?
    `,
    [
      status,
      providerReference || null,
      status === NotificationStatus.sent ? new Date() : null,
      id
    ]
  );
  
  return true;
}

/// Récupère l'historique des notifications pour un rendez-vous.
export async function getNotificationsByAppointmentId(appointmentId: string) {
  const [rows] = await mysqlPool.query<RowDataPacket[]>(
    `
    SELECT * FROM evenements_notification 
    WHERE appointment_id = ? 
    ORDER BY created_at DESC
    `,
    [appointmentId]
  );
  
  return rows;
}
