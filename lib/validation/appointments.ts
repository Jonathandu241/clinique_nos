/// Schemas Zod de validation pour les reservations Clinique NOS.

import { z } from "zod";

/// Taille maximale des notes internes de reservation en V1.
export const MAX_APPOINTMENT_NOTES_LENGTH = 500;

/// Valide les statuts de rendez-vous autorises dans le module.
export const appointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "expired_unpaid",
]);

/// Valide les statuts de paiement lies au rendez-vous.
export const paymentStatusSchema = z.enum(["unpaid", "due", "paid", "failed", "refunded"]);

/// Valide l'entree brute d'une reservation patient.
export const createAppointmentReservationSchema = z.object({
  availabilitySlotId: z.string().trim().min(1, "Le creneau est requis."),
  doctorId: z.string().trim().min(1, "Le medecin est requis."),
  notesInternal: z
    .string()
    .trim()
    .max(
      MAX_APPOINTMENT_NOTES_LENGTH,
      `Les notes ne doivent pas depasser ${MAX_APPOINTMENT_NOTES_LENGTH} caracteres.`,
    )
    .optional(),
});

export type CreateAppointmentReservationInput = z.infer<typeof createAppointmentReservationSchema>;
