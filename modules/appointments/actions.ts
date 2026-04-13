/// Server Actions minimales pour les reservations Clinique NOS.

"use server";

import { requirePatientAccess } from "../../lib/auth/permissions";
import { createAppointmentReservationSchema } from "../../lib/validation/appointments";
import { reserveAppointment } from "./service";
import type { CreateAppointmentReservationActionState } from "./types";

/// Extrait une entree brute depuis un formulaire HTML classique.
function extractAppointmentReservationFormData(formData: FormData) {
  return {
    availabilitySlotId: String(formData.get("availabilitySlotId") ?? ""),
    doctorId: String(formData.get("doctorId") ?? ""),
    notesInternal: String(formData.get("notesInternal") ?? ""),
  };
}

/// Transforme une erreur metier en message simple pour l'interface.
function getAppointmentReservationErrorMessage(error: unknown): string {
  // Reutilise le message metier si l'erreur est deja connue.
  if (error instanceof Error) {
    // Renvoie directement les erreurs metier explicites pour la reservation.
    return error.message;
  }

  return "La reservation n'a pas pu etre enregistree.";
}

/// Valide et enregistre une reservation patient avec la transaction metier.
export async function createAppointmentReservationAction(
  _previousState: CreateAppointmentReservationActionState,
  formData: FormData,
): Promise<CreateAppointmentReservationActionState> {
  const session = await requirePatientAccess();

  // Construit l'entree brute a partir du formulaire pour Zod.
  const rawInput = extractAppointmentReservationFormData(formData);
  const parsedInput = createAppointmentReservationSchema.safeParse(rawInput);

  // Retourne les erreurs de champ si la validation echoue.
  if (!parsedInput.success) {
    return {
      status: "error",
      message: "Les informations de reservation sont invalides.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    const reservationResult = await reserveAppointment(parsedInput.data, session.id);

    // Audit de réservation
    const { auditService } = await import("../audit/service");
    auditService.log({
      entityType: "appointment",
      entityId: reservationResult.appointment.id,
      action: "BOOKED",
      actorUserId: session.id,
      metadata: { slotId: parsedInput.data.availabilitySlotId }
    }).catch(console.error);

    // Déclenchement de la notification (Simulation asynchrone)
    const { notifyPatientReservationPending } = await import("../notifications/events");
    notifyPatientReservationPending(reservationResult.appointment.id).catch(console.error);

    return {
      status: "success",
      message: "Le creneau a bien ete reserve.",
      createdAppointment: {
        appointmentId: reservationResult.appointment.id,
        doctorId: reservationResult.appointment.doctorId,
        availabilitySlotId: reservationResult.appointment.availabilitySlotId,
        status: reservationResult.appointment.status,
        paymentStatus: reservationResult.appointment.paymentStatus,
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: getAppointmentReservationErrorMessage(error),
    };
  }
}
