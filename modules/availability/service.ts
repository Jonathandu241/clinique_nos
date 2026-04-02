/// Service metier simple pour preparer les disponibilites Clinique NOS.

import {
  DEFAULT_SLOT_DURATION_MINUTES,
  MAX_SLOT_DURATION_MINUTES,
  MIN_SLOT_DURATION_MINUTES,
  type CreateAvailabilityInput,
} from "../../lib/validation/availability";
import type { AvailabilityDraft, AvailabilitySlotDraft } from "./types";

/// Duree d'une minute en millisecondes pour les calculs horaires.
const MINUTE_IN_MILLISECONDS = 60 * 1000;

/// Verifie que la duree de creneau reste dans les bornes V1.
function assertSlotDurationMinutes(slotDurationMinutes: number): void {
  // Refuse une duree incoherente meme si la validation amont a deja filtre.
  if (
    slotDurationMinutes < MIN_SLOT_DURATION_MINUTES ||
    slotDurationMinutes > MAX_SLOT_DURATION_MINUTES
  ) {
    throw new Error("La duree du creneau est invalide.");
  }
}

/// Verifie que la plage de disponibilite est strictement croissante.
function assertAvailabilityRange(startsAt: Date, endsAt: Date): void {
  // Refuse les plages de disponibilite inversees.
  if (endsAt.getTime() <= startsAt.getTime()) {
    throw new Error("La plage de disponibilite est invalide.");
  }
}

/// Genere des creneaux consecutifs a partir d'une plage validee.
export function generateAvailabilitySlots(input: CreateAvailabilityInput): AvailabilitySlotDraft[] {
  const slots: AvailabilitySlotDraft[] = [];
  // Conserve la duree du slot dans une variable claire pour la boucle.
  const slotDurationInMilliseconds = input.slotDurationMinutes * MINUTE_IN_MILLISECONDS;
  // Demarre la generation a partir du debut de la plage.
  let currentStartsAt = input.startsAt.getTime();

  assertSlotDurationMinutes(input.slotDurationMinutes);
  assertAvailabilityRange(input.startsAt, input.endsAt);

  while (currentStartsAt + slotDurationInMilliseconds <= input.endsAt.getTime()) {
    const slotStartsAt = new Date(currentStartsAt);
    const slotEndsAt = new Date(currentStartsAt + slotDurationInMilliseconds);

    slots.push({
      startsAt: slotStartsAt,
      endsAt: slotEndsAt,
      status: "open",
    });

    currentStartsAt += slotDurationInMilliseconds;
  }

  // Refuse les plages qui ne produisent aucun creneau exploitable.
  if (slots.length === 0) {
    throw new Error("La plage ne permet pas de generer de creneau.");
  }

  return slots;
}

/// Prepare une disponibilite complete avant son enregistrement.
export function buildAvailabilityDraft(input: CreateAvailabilityInput): AvailabilityDraft {
  // Conserve un statut explicite pour les prochaines etapes du flux.
  const status = input.status ?? "active";
  // Utilise une duree par defaut si le lot suivant omet encore ce champ.
  const slotDurationMinutes = input.slotDurationMinutes ?? DEFAULT_SLOT_DURATION_MINUTES;
  // Normalise la source pour garder un contrat simple en sortie.
  const source = input.source?.trim() || undefined;
  // Centralise les donnees normalisees pour la disponibilite et la generation.
  const normalizedInput = {
    ...input,
    source,
    status,
    slotDurationMinutes,
  };

  return {
    availability: normalizedInput,
    slots: generateAvailabilitySlots(normalizedInput),
  };
}
