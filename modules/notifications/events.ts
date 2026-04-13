/// Mapping entre les événements métier et l'envoi de notifications.
import { getAppointmentDetailById } from "../appointments/repository";
import { sendNotification } from "./service";
import { NotificationTemplates } from "./templates";
import { NotificationChannel } from "./types";

/**
 * Notifie le patient que son rendez-vous est réservé (en attente de paiement).
 */
export async function notifyPatientReservationPending(appointmentId: string) {
  const app = await getAppointmentDetailById(appointmentId);
  if (!app) return;

  const startDate = new Date(app.startsAt);
  const details = {
    id: app.id,
    doctorName: `${app.doctorFirstName} ${app.doctorLastName}`,
    patientName: `${app.patientFirstName} ${app.patientLastName}`,
    date: startDate.toLocaleDateString("fr-FR"),
    time: startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  };

  const template = NotificationTemplates.PATIENT_RESERVATION_PENDING(details);

  return await sendNotification({
    appointmentId: app.id,
    template: template.template,
    channel: NotificationChannel.email, // Par défaut en V1
    recipient: app.patientEmail || "patient@example.com",
    content: template.body
  });
}

/**
 * Notifie le patient et le médecin que le rendez-vous est confirmé (payé).
 */
export async function notifyAppointmentConfirmed(appointmentId: string) {
  const app = await getAppointmentDetailById(appointmentId);
  if (!app) return;

  const startDate = new Date(app.startsAt);
  const details = {
    id: app.id,
    doctorName: `${app.doctorFirstName} ${app.doctorLastName}`,
    patientName: `${app.patientFirstName} ${app.patientLastName}`,
    date: startDate.toLocaleDateString("fr-FR"),
    time: startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  };

  // 1. Notification Patient
  const patientTemplate = NotificationTemplates.PATIENT_PAYMENT_CONFIRMED(details);
  await sendNotification({
    appointmentId: app.id,
    template: patientTemplate.template,
    channel: NotificationChannel.email,
    recipient: app.patientEmail || "patient@example.com",
    content: patientTemplate.body
  });

  // 2. Notification Médecin
  const doctorTemplate = NotificationTemplates.DOCTOR_NEW_APPOINTMENT(details);
  await sendNotification({
    appointmentId: app.id,
    template: doctorTemplate.template,
    channel: NotificationChannel.email,
    recipient: app.doctorEmail || "doctor@example.com",
    content: doctorTemplate.body
  });
}

/**
 * Notifie le patient d'un rappel de paiement imminent.
 */
export async function notifyPatientPaymentReminder(appointmentId: string) {
  const app = await getAppointmentDetailById(appointmentId);
  if (!app) return;

  const startDate = new Date(app.startsAt);
  
  if (!app.paymentDueAt) {
    console.warn(`[NOTIF] Pas d'échéance de paiement pour le rendez-vous ${appointmentId}`);
    return;
  }

  const dueAt = new Date(app.paymentDueAt);
  const now = new Date();
  
  // Calcul approximatif des minutes restantes avant expiration
  const minutesLeft = Math.max(0, Math.floor((dueAt.getTime() - now.getTime()) / (1000 * 60)));

  const details = {
    id: app.id,
    doctorName: `${app.doctorFirstName} ${app.doctorLastName}`,
    patientName: `${app.patientFirstName} ${app.patientLastName}`,
    date: startDate.toLocaleDateString("fr-FR"),
    time: startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    minutesLeft
  };

  const template = NotificationTemplates.PATIENT_PAYMENT_REMINDER(details);

  return await sendNotification({
    appointmentId: app.id,
    template: template.template,
    channel: NotificationChannel.email,
    recipient: app.patientEmail || "patient@example.com",
    content: template.body
  });
}
