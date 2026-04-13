/// Types partages pour les disponibilites Clinique NOS.

export type AvailabilityStatus = "active" | "inactive";

export type AvailabilitySlotStatus = "open" | "reserved" | "blocked" | "expired";

/// Donnees minimales necessaires pour creer une disponibilite.
export type AvailabilityCreateInput = {
  doctorId: string;
  startsAt: Date;
  endsAt: Date;
  slotDurationMinutes: number;
  source?: string;
  status?: AvailabilityStatus;
};

/// Representation d'un creneau genere avant persistence.
export type AvailabilitySlotDraft = {
  startsAt: Date;
  endsAt: Date;
  status: AvailabilitySlotStatus;
};

/// Resultat metier retourne avant l'ecriture en base.
export type AvailabilityDraft = {
  availability: AvailabilityCreateInput & {
    status: AvailabilityStatus;
  };
  slots: AvailabilitySlotDraft[];
};

/// Donnees necessaires pour persister une disponibilite.
export type AvailabilityPersistenceInput = {
  createdByUserId: string;
  availability: AvailabilityDraft["availability"];
};

/// Representation d'une disponibilite relue depuis la base.
export type AvailabilityRecord = {
  id: string;
  doctorId: string;
  createdByUserId: string;
  startsAt: Date;
  endsAt: Date;
  source?: string;
  status: AvailabilityStatus;
  createdAt: Date;
  updatedAt: Date;
};

/// Representation d'un creneau relu depuis la base.
export type AvailabilitySlotRecord = {
  id: string;
  availabilityId: string;
  doctorId: string;
  startsAt: Date;
  endsAt: Date;
  status: AvailabilitySlotStatus;
  createdAt: Date;
  updatedAt: Date;
};

/// Etat de retour pour l'action de création de disponibilité.
export type CreateAvailabilityActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  generatedSlotCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

/// Valeur initiale pour les formulaires de disponibilité.
export const INITIAL_CREATE_AVAILABILITY_ACTION_STATE: CreateAvailabilityActionState = {
  status: "idle",
};
