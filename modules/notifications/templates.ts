/// Templates textuels pour les notifications transactionnelles.

interface AppointmentDetails {
  id: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
}

/**
 * Génère le contenu d'un template spécifique.
 */
export const NotificationTemplates = {
  /**
   * Notification envoyée au patient lors de la réservation (en attente de paiement).
   */
  PATIENT_RESERVATION_PENDING: (details: AppointmentDetails) => ({
    template: "patient_reservation_pending",
    subject: "Votre demande de rendez-vous - Clinique NOS",
    body: `Bonjour ${details.patientName},

Votre demande de rendez-vous avec le Dr ${details.doctorName} le ${details.date} à ${details.time} a bien été enregistrée.

IMPORTANT : Votre rendez-vous est actuellement en attente. Pour le confirmer définitivement, veuillez procéder au règlement sécurisé sur votre espace patient sous 2 heures.

Référence du rendez-vous : ${details.id.toUpperCase()}`
  }),

  /**
   * Notification envoyée au patient après confirmation du paiement.
   */
  PATIENT_PAYMENT_CONFIRMED: (details: AppointmentDetails) => ({
    template: "patient_payment_confirmed",
    subject: "Confirmation de votre rendez-vous - Clinique NOS",
    body: `Bonjour ${details.patientName},

Nous avons le plaisir de vous confirmer votre rendez-vous avec le Dr ${details.doctorName}.

🗓️ Date : ${details.date}
⏰ Heure : ${details.time}
📍 Lieu : Clinique NOS - 123 Avenue de la Santé, Paris

Votre paiement a bien été reçu. Merci de vous présenter 15 minutes avant l'heure prévue.`
  }),

  /**
   * Alerte pour le médecin lors d'un nouveau rendez-vous confirmé.
   */
  DOCTOR_NEW_APPOINTMENT: (details: AppointmentDetails) => ({
    template: "doctor_new_appointment",
    subject: "Nouveau rendez-vous confirmé",
    body: `Cher Dr ${details.doctorName},

Un nouveau rendez-vous a été confirmé dans votre agenda :

Patient : ${details.patientName}
Date : ${details.date}
Heure : ${details.time}

Vous pouvez consulter votre planning complet sur votre tableau de bord staff.`
  })
};
