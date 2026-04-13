/// Actions Serveur pour la gestion des opérations Staff.

"use server";

import { requireStaffAccess } from "../../lib/auth/permissions";
import { staffCancelAppointment, staffRescheduleAppointment } from "./service-staff";
import { revalidatePath } from "next/cache";

/**
 * Action pour annuler un rendez-vous par le staff.
 */
export async function staffCancelAppointmentAction(formData: FormData) {
  try {
    await requireStaffAccess();

    const appointmentId = String(formData.get("appointmentId") ?? "");
    const reason = String(formData.get("reason") ?? "Annulation administrative");

    if (!appointmentId) throw new Error("ID du rendez-vous manquant.");

    await staffCancelAppointment(appointmentId, reason);

    // Audit annulation
    const { auditService } = await import("../audit/service");
    const session = await import("../../lib/auth/session").then(m => m.getAuthSession());
    auditService.log({
      entityType: "appointment",
      entityId: appointmentId,
      action: "CANCELLED_BY_STAFF",
      actorUserId: session?.id,
      metadata: { reason }
    }).catch(console.error);

    // Rafraîchir la page de détail pour voir le nouveau statut
    revalidatePath(`/staff/appointments/${appointmentId}`);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erreur lors de l'annulation." 
    };
  }
}

/**
 * Action pour reprogrammer un rendez-vous.
 */
export async function staffRescheduleAppointmentAction(formData: FormData) {
  try {
    await requireStaffAccess();

    const appointmentId = String(formData.get("appointmentId") ?? "");
    const newSlotId = String(formData.get("newSlotId") ?? "");

    if (!appointmentId || !newSlotId) throw new Error("Données manquantes.");

    await staffRescheduleAppointment(appointmentId, newSlotId);

    // Audit reprogrammation
    const { auditService } = await import("../audit/service");
    const session = await import("../../lib/auth/session").then(m => m.getAuthSession());
    auditService.log({
      entityType: "appointment",
      entityId: appointmentId,
      action: "RESCHEDULED",
      actorUserId: session?.id,
      metadata: { newSlotId }
    }).catch(console.error);

    revalidatePath(`/staff/appointments/${appointmentId}`);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erreur lors de la reprogrammation." 
    };
  }
}
