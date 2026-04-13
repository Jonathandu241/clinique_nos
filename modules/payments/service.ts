/// Service de gestion des paiements (Simulation pour V1).
import { updateAppointmentPaymentStatus } from "../appointments/repository";
import type { PaymentProcessResult } from "./types";

/**
 * Simule un processus de paiement.
 * Dans une version réelle, cela appellerait un PSP (Stripe, etc.) 
 * ou vérifierait un jeton de session.
 */
export async function processFakePayment(appointmentId: string): Promise<PaymentProcessResult> {
  // Simulation d'un délai réseau/traitement
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Pour cette V1 "Fake", on considère que tout paiement initié est réussi.
  const success = await updateAppointmentPaymentStatus(appointmentId, 'paid');

  if (!success) {
    return {
      success: false,
      error: "Impossible de mettre à jour le statut de paiement du rendez-vous.",
    };
  }

  return {
    success: true,
    transactionId: `fake_txn_${crypto.randomUUID().slice(0, 8)}`,
  };
}
