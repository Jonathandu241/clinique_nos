/// Schemas Zod de validation pour les disponibilites Clinique NOS.

import { z } from "zod";

/// Duree par defaut d'un creneau V1 en minutes.
export const DEFAULT_SLOT_DURATION_MINUTES = 30;
/// Duree minimale acceptee pour rester sur des creneaux utiles.
export const MIN_SLOT_DURATION_MINUTES = 15;
/// Duree maximale acceptee pour garder une planification simple.
export const MAX_SLOT_DURATION_MINUTES = 180;

/// Valide les statuts simples de disponibilite.
export const availabilityStatusSchema = z.enum(["active", "inactive"]);

/// Valide une date provenant d'un formulaire ou d'un appel serveur.
export const availabilityDateSchema = z.coerce.date({
  error: "Une date valide est requise.",
});

/// Valide l'entree brute de creation d'une disponibilite.
const availabilityCoreSchema = z
  .object({
    doctorId: z.string().trim().min(1, "Le medecin est requis."),
    startsAt: availabilityDateSchema,
    endsAt: availabilityDateSchema,
    slotDurationMinutes: z.coerce
      .number()
      .int("La duree du creneau doit etre un entier.")
      .min(MIN_SLOT_DURATION_MINUTES, "La duree minimale est de 15 minutes.")
      .max(MAX_SLOT_DURATION_MINUTES, "La duree maximale est de 180 minutes.")
      .default(DEFAULT_SLOT_DURATION_MINUTES),
    source: z
      .string()
      .trim()
      .max(100, "La source ne doit pas depasser 100 caracteres.")
      .optional(),
    status: availabilityStatusSchema.default("active"),
  });

/// Valide l'entree brute de creation d'une disponibilite.
export const createAvailabilitySchema = availabilityCoreSchema.superRefine((value, context) => {
  const durationInMilliseconds = value.endsAt.getTime() - value.startsAt.getTime();

  // Refuse les plages dont la fin precede ou egale le debut.
  if (durationInMilliseconds <= 0) {
    context.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "La fin doit etre apres le debut.",
    });
  }

  // Refuse les plages trop courtes pour produire un seul creneau.
  if (durationInMilliseconds < value.slotDurationMinutes * 60 * 1000) {
    context.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "La plage doit couvrir au moins un creneau complet.",
    });
  }
});

/// Valide une mise a jour simple de disponibilite.
export const updateAvailabilitySchema = availabilityCoreSchema.partial().extend({
  id: z.string().trim().min(1, "L'identifiant de disponibilite est requis."),
});

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
