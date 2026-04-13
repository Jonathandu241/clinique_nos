/// Logique métier pour la gestion des rendez-vous Clinique NOS (Côté Staff).

import { getAppointmentById } from "./repository";
import { canCancel, canReschedule } from "./policies";
import * as repo from "./repository";
import { notifyPatientCancelledByStaff } from "../notifications/events";

/**
 * Annule un rendez-vous (Action Staff).
 * Libère le créneau et notifie le patient.
 */
export async function staffCancelAppointment(appointmentId: string, reason: string) {
  const appointment = await getAppointmentById(appointmentId);
  
  if (!appointment) {
    throw new Error("Rendez-vous non trouvé.");
  }

  // Vérification de la politique métier
  if (!canCancel(appointment.status)) {
    throw new Error(`L'annulation n'est pas autorisée pour un rendez-vous au statut : ${appointment.status}`);
  }

  // Transaction SQL
  await repo.cancelAppointmentTransaction(
    appointmentId,
    appointment.availabilitySlotId,
    reason
  );

  // Notification patient (asynchrone)
  notifyPatientCancelledByStaff(appointmentId, reason).catch(console.error);
  
  return { success: true };
}

/**
 * Reprogramme un rendez-vous vers un nouveau créneau.
 */
export async function staffRescheduleAppointment(appointmentId: string, newSlotId: string) {
  const appointment = await getAppointmentById(appointmentId);
  
  if (!appointment) {
    throw new Error("Rendez-vous non trouvé.");
  }

  if (!canReschedule(appointment.status)) {
    throw new Error(`La reprogrammation n'est pas autorisée pour ce rendez-vous.`);
  }

  // Vérifier que le nouveau créneau appartient au même médecin (sécurité métier)
  // TODO: On pourrait ajouter une vérification ici si nécessaire.

  await repo.rescheduleAppointmentTransaction(
    appointmentId,
    appointment.availabilitySlotId,
    newSlotId
  );

  // TODO: Notification de reprogrammation (Task 10.4)
  
  return { success: true };
}
