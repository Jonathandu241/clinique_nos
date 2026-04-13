/// Service metier pour preparer et reserver les rendez-vous Clinique NOS.

import type { PoolConnection } from "mysql2/promise";
import type { CreateAppointmentReservationInput } from "../../lib/validation/appointments";
import type {
  AppointmentAvailabilitySlotRecord,
  AppointmentPersistenceInput,
  AppointmentRecord,
  AppointmentReservationDraft,
  AppointmentReservationInput,
  PatientProfileRecord,
} from "./types";

/// Resultat retourne apres une reservation transactionnelle reussie.
export type AppointmentReservationResult = {
  appointment: AppointmentRecord;
  reservedSlot: AppointmentAvailabilitySlotRecord;
};

/// Connexion transactionnelle minimale necessaire au service.
type AppointmentTransactionConnection = Pick<
  PoolConnection,
  "beginTransaction" | "commit" | "rollback" | "release"
>;

/// Dependances injectables pour tester le service sans vraie base.
type AppointmentServiceDependencies = {
  createConnection: () => Promise<AppointmentTransactionConnection>;
  getPatientProfileByUserId: (userId: string) => Promise<PatientProfileRecord | null>;
  lockAvailabilitySlotForReservation: (
    connection: AppointmentTransactionConnection,
    availabilitySlotId: string,
  ) => Promise<AppointmentAvailabilitySlotRecord | null>;
  createAppointment: (
    input: AppointmentPersistenceInput,
    connection: AppointmentTransactionConnection,
  ) => Promise<AppointmentRecord>;
  reserveAvailabilitySlot: (
    availabilitySlotId: string,
    connection: AppointmentTransactionConnection,
  ) => Promise<AppointmentAvailabilitySlotRecord | null>;
};

/// Charge le pool MySQL seulement quand une vraie connexion est necessaire.
async function createDefaultAppointmentConnection(): Promise<PoolConnection> {
  const { mysqlPool } = await import("../../lib/db/mysql");

  return mysqlPool.getConnection();
}

/// Charge la lecture du profil patient uniquement quand le service reel en a besoin.
async function defaultGetPatientProfileByUserId(userId: string): Promise<PatientProfileRecord | null> {
  const repository = await import("./repository");

  return repository.getPatientProfileByUserId(userId);
}

/// Charge le verrouillage du creneau uniquement quand la transaction reelle s'execute.
async function defaultLockAvailabilitySlotForReservation(
  connection: AppointmentTransactionConnection,
  availabilitySlotId: string,
): Promise<AppointmentAvailabilitySlotRecord | null> {
  const repository = await import("./repository");

  return repository.lockAvailabilitySlotForReservation(connection as PoolConnection, availabilitySlotId);
}

/// Charge la creation du rendez-vous uniquement quand la transaction reelle s'execute.
async function defaultCreateAppointment(
  input: AppointmentPersistenceInput,
  connection: AppointmentTransactionConnection,
): Promise<AppointmentRecord> {
  const repository = await import("./repository");

  return repository.createAppointment(input, connection as PoolConnection);
}

/// Charge la reservation du creneau uniquement quand la transaction reelle s'execute.
async function defaultReserveAvailabilitySlot(
  availabilitySlotId: string,
  connection: AppointmentTransactionConnection,
): Promise<AppointmentAvailabilitySlotRecord | null> {
  const repository = await import("./repository");

  return repository.reserveAvailabilitySlot(availabilitySlotId, connection as PoolConnection);
}

/// Dependances reelles utilisees par defaut en production.
const defaultAppointmentServiceDependencies: AppointmentServiceDependencies = {
  createConnection: createDefaultAppointmentConnection,
  getPatientProfileByUserId: defaultGetPatientProfileByUserId,
  lockAvailabilitySlotForReservation: defaultLockAvailabilitySlotForReservation,
  createAppointment: defaultCreateAppointment,
  reserveAvailabilitySlot: defaultReserveAvailabilitySlot,
};

/// Normalise les notes pour eviter de conserver une chaine vide.
function normalizeAppointmentNotes(notesInternal?: string): string | undefined {
  return notesInternal?.trim() || undefined;
}

/// Construit un draft de reservation avant la transaction base.
export function buildAppointmentReservationDraft(
  input: CreateAppointmentReservationInput,
  patientUserId: string,
): AppointmentReservationDraft {
  // Conserve un objet de reservation lisible pour la suite du flux.
  const appointment: AppointmentReservationInput = {
    doctorId: input.doctorId,
    availabilitySlotId: input.availabilitySlotId,
    status: "pending",
    paymentStatus: "unpaid",
    notesInternal: normalizeAppointmentNotes(input.notesInternal),
  };

  return {
    patientUserId,
    appointment,
  };
}

/// Resout le profil patient a partir de l'utilisateur connecte.
async function resolvePatientProfile(
  patientUserId: string,
  dependencies: AppointmentServiceDependencies,
): Promise<PatientProfileRecord> {
  const patientProfile = await dependencies.getPatientProfileByUserId(patientUserId);

  // Refuse la reservation si aucun profil patient n'existe encore.
  if (!patientProfile) {
    throw new Error("Le profil patient est introuvable.");
  }

  return patientProfile;
}

/// Verifie qu'un creneau verrouille reste reservable.
function validateLockedSlot(
  slot: AppointmentAvailabilitySlotRecord | null,
  draft: AppointmentReservationDraft,
): AppointmentAvailabilitySlotRecord {
  // Refuse la reservation si le creneau n'existe plus.
  if (!slot) {
    throw new Error("Le creneau demande est introuvable.");
  }

  // Refuse la reservation si le creneau n'est plus ouvert.
  if (slot.status !== "open") {
    throw new Error("Ce creneau n'est plus disponible.");
  }

  // Refuse la reservation si le medecin cible ne correspond pas au creneau verrouille.
  if (slot.doctorId !== draft.appointment.doctorId) {
    throw new Error("Le creneau ne correspond pas au medecin selectionne.");
  }

  return slot;
}

/// Reserve un creneau pour un patient avec protection transactionnelle.
export async function reserveAppointment(
  input: CreateAppointmentReservationInput,
  patientUserId: string,
  dependencies: AppointmentServiceDependencies = defaultAppointmentServiceDependencies,
): Promise<AppointmentReservationResult> {
  // Prepare le draft avant d'ouvrir la transaction afin de garder le flux lisible.
  const draft = buildAppointmentReservationDraft(input, patientUserId);
  const patientProfile = await resolvePatientProfile(draft.patientUserId, dependencies);
  const connection = await dependencies.createConnection();

  try {
    await connection.beginTransaction();

    const lockedSlot = await dependencies.lockAvailabilitySlotForReservation(
      connection,
      draft.appointment.availabilitySlotId,
    );
    const validSlot = validateLockedSlot(lockedSlot, draft);
    const appointment = await dependencies.createAppointment(
      {
        patientId: patientProfile.id,
        appointment: draft.appointment,
      },
      connection,
    );
    const reservedSlot = await dependencies.reserveAvailabilitySlot(validSlot.id, connection);

    // Bloque si le creneau ne peut plus etre passe en reserve.
    if (!reservedSlot) {
      throw new Error("Le creneau n'a pas pu etre reserve.");
    }

    await connection.commit();

    return {
      appointment,
      reservedSlot,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
