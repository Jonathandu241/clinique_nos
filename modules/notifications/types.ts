/// Fichier définissant les types et interfaces pour le module de notifications.

export enum NotificationChannel {
  email = "email",
  sms = "sms",
  whatsapp = "whatsapp",
}

export enum NotificationStatus {
  pending = "pending",
  sent = "sent",
  failed = "failed",
}

/// Interface pour la création d'une nouvelle notification.
export interface CreateNotificationInput {
  appointmentId: string;
  template: string; // Correspond au champ 'template' dans le schéma Prisma
  channel: NotificationChannel;
  recipient: string; // Correspond au champ 'recipient' dans le schéma Prisma
  status?: NotificationStatus;
}
