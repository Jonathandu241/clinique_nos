"use server";

/// Actions serveur pour la gestion des paiements.
import { requirePatientAccess } from "@/lib/auth/permissions";
import { getAppointmentById } from "../appointments/repository";
import { processFakePayment } from "./service";
import { revalidatePath } from "next/cache";

/**
 * Action pour traiter un paiement fictif.
 * Vérifie que le rendez-vous appartient à l'utilisateur et déclenche la confirmation.
 */
export async function confirmFakePayment(appointmentId: string) {
  // 1. Sécurité : Vérifier que l'utilisateur est un patient connecté.
  const profile = await requirePatientAccess();

  // 2. Vérifier l'existence et la propriété du rendez-vous.
  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    throw new Error("Rendez-vous introuvable.");
  }

  if (appointment.patientId !== profile.id) {
    throw new Error("Vous n'êtes pas autorisé à payer pour ce rendez-vous.");
  }

  // 3. Vérifier si le paiement est déjà effectué
  if (appointment.paymentStatus === 'paid') {
    return { success: true };
  }

  // 4. Traiter le paiement simulé.
  const result = await processFakePayment(appointmentId);

  if (result.success) {
    // 5. Revalider les caches pour mettre à jour les dashboards et listes.
    revalidatePath(`/patient/appointments/${appointmentId}`);
    revalidatePath("/patient/appointments");
    revalidatePath("/patient/dashboard");
    revalidatePath("/staff/appointments");
    revalidatePath("/staff/dashboard");
  }

  return result;
}
