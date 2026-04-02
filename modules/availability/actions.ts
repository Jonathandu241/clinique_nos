/// Server Actions minimales pour les disponibilites Clinique NOS.

"use server";

import { requireStaffAccess } from "../../lib/auth/permissions";
import { createAvailabilitySchema } from "../../lib/validation/availability";
import { buildAvailabilityDraft } from "./service";

/// Etat de retour simple pour brancher le formulaire au lot suivant.
export type CreateAvailabilityActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  generatedSlotCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

/// Etat initial reutilisable par le futur formulaire React.
export const INITIAL_CREATE_AVAILABILITY_ACTION_STATE: CreateAvailabilityActionState = {
  status: "idle",
};

/// Extrait une entree brute depuis un formulaire HTML classique.
function extractAvailabilityFormData(formData: FormData) {
  return {
    doctorId: String(formData.get("doctorId") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    endsAt: String(formData.get("endsAt") ?? ""),
    slotDurationMinutes: String(formData.get("slotDurationMinutes") ?? ""),
    source: String(formData.get("source") ?? ""),
    status: String(formData.get("status") ?? "active"),
  };
}

/// Transforme une erreur metier en message simple pour l'interface.
function getAvailabilityErrorMessage(error: unknown): string {
  // Reutilise le message metier si l'erreur est deja connue.
  if (error instanceof Error) {
    return error.message;
  }

  return "La disponibilite n'a pas pu etre preparee.";
}

/// Valide une creation de disponibilite sans encore persister en base.
export async function createAvailabilityAction(
  _previousState: CreateAvailabilityActionState,
  formData: FormData,
): Promise<CreateAvailabilityActionState> {
  await requireStaffAccess();

  // Construit l'entree brute a partir du formulaire pour Zod.
  const rawInput = extractAvailabilityFormData(formData);
  const parsedInput = createAvailabilitySchema.safeParse(rawInput);

  // Retourne les erreurs de champ si la validation echoue.
  if (!parsedInput.success) {
    return {
      status: "error",
      message: "Les informations de disponibilite sont invalides.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    const draft = buildAvailabilityDraft(parsedInput.data);

    return {
      status: "success",
      message: "La disponibilite est validee et prete a etre enregistree.",
      generatedSlotCount: draft.slots.length,
    };
  } catch (error) {
    return {
      status: "error",
      message: getAvailabilityErrorMessage(error),
    };
  }
}
