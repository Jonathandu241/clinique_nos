/// Politiques métier pour la gestion des droits sur les rendez-vous.

import { AppointmentStatus } from "./types";

/**
 * Détermine si un rendez-vous peut être annulé selon son statut actuel.
 */
export function canCancel(currentStatus: AppointmentStatus): boolean {
  const prohibited: AppointmentStatus[] = [
    "completed",
    "cancelled",
    "cancelled_by_staff",
    "cancelled_by_patient",
    "expired_unpaid"
  ];
  
  return !prohibited.includes(currentStatus);
}

/**
 * Détermine si un rendez-vous peut être reprogrammé.
 */
export function canReschedule(currentStatus: AppointmentStatus): boolean {
  const allowed: AppointmentStatus[] = [
    "pending",
    "confirmed"
  ];
  
  return allowed.includes(currentStatus);
}
