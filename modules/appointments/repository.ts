/// Repository SQL simple pour les reservations Clinique NOS.

import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { mysqlPool } from "../../lib/db/mysql";
import type {
  AppointmentAvailabilitySlotRecord,
  AppointmentPersistenceInput,
  AppointmentRecord,
  OpenAppointmentSlotRecord,
  PatientProfileRecord,
} from "./types";

type AppointmentSlotRow = RowDataPacket & {
  id: string;
  availability_id: string;
  doctor_id: string;
  starts_at: Date;
  ends_at: Date;
  status: AppointmentAvailabilitySlotRecord["status"];
  created_at: Date;
  updated_at: Date;
  doctor_first_name: string | null;
  doctor_last_name: string | null;
  doctor_specialty: string | null;
};

type AppointmentRow = RowDataPacket & {
  id: string;
  patient_id: string;
  doctor_id: string;
  availability_slot_id: string;
  status: AppointmentRecord["status"];
  payment_status: AppointmentRecord["paymentStatus"];
  payment_due_at: Date | null;
  booked_at: Date;
  confirmed_at: Date | null;
  cancelled_at: Date | null;
  completed_at: Date | null;
  cancellation_reason: string | null;
  notes_internal: string | null;
  created_at: Date;
  updated_at: Date;
};

type PatientProfileRow = RowDataPacket & {
  id: string;
  user_id: string;
};

/// Convertit une ligne SQL de creneau vers le format du domaine.
function mapAppointmentSlotRow(row: AppointmentSlotRow): AppointmentAvailabilitySlotRecord {
  return {
    id: row.id,
    availabilityId: row.availability_id,
    doctorId: row.doctor_id,
    startsAt: new Date(row.starts_at),
    endsAt: new Date(row.ends_at),
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/// Convertit une ligne SQL de creneau ouvert avec informations medecin.
function mapOpenAppointmentSlotRow(row: AppointmentSlotRow): OpenAppointmentSlotRecord {
  return {
    ...mapAppointmentSlotRow(row),
    doctorFirstName: row.doctor_first_name ?? undefined,
    doctorLastName: row.doctor_last_name ?? undefined,
    doctorSpecialty: row.doctor_specialty ?? undefined,
  };
}

/// Convertit une ligne SQL de rendez-vous vers le format du domaine.
function mapAppointmentRow(row: AppointmentRow): AppointmentRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    availabilitySlotId: row.availability_slot_id,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentDueAt: row.payment_due_at ?? undefined,
    bookedAt: new Date(row.booked_at),
    confirmedAt: row.confirmed_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    cancellationReason: row.cancellation_reason ?? undefined,
    notesInternal: row.notes_internal ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/// Convertit une ligne SQL de profil patient vers le format du domaine.
function mapPatientProfileRow(row: PatientProfileRow): PatientProfileRecord {
  return {
    id: row.id,
    userId: row.user_id,
  };
}

/// Relit un creneau par identifiant sur une connexion donnee.
async function getAvailabilitySlotByIdWithConnection(
  connection: PoolConnection,
  availabilitySlotId: string,
): Promise<AppointmentAvailabilitySlotRecord | null> {
  const [rows] = await connection.query<AppointmentSlotRow[]>(
    `
      SELECT
        id,
        availability_id,
        doctor_id,
        starts_at,
        ends_at,
        status,
        created_at,
        updated_at,
        NULL AS doctor_first_name,
        NULL AS doctor_last_name,
        NULL AS doctor_specialty
      FROM creneaux_disponibilite
      WHERE id = ?
      LIMIT 1
    `,
    [availabilitySlotId],
  );

  // Retourne null si aucun creneau ne correspond.
  if (rows.length === 0) {
    return null;
  }

  return mapAppointmentSlotRow(rows[0]);
}

/// Relit un rendez-vous par identifiant sur une connexion donnee.
async function getAppointmentByIdWithConnection(
  connection: PoolConnection,
  appointmentId: string,
): Promise<AppointmentRecord | null> {
  const [rows] = await connection.query<AppointmentRow[]>(
    `
      SELECT
        id,
        patient_id,
        doctor_id,
        availability_slot_id,
        status,
        payment_status,
        payment_due_at,
        booked_at,
        confirmed_at,
        cancelled_at,
        completed_at,
        cancellation_reason,
        notes_internal,
        created_at,
        updated_at
      FROM rendezvous
      WHERE id = ?
      LIMIT 1
    `,
    [appointmentId],
  );

  // Retourne null si aucun rendez-vous ne correspond.
  if (rows.length === 0) {
    return null;
  }

  return mapAppointmentRow(rows[0]);
}

/// Lit le profil patient a partir de l'identifiant utilisateur connecte.
export async function getPatientProfileByUserId(userId: string): Promise<PatientProfileRecord | null> {
  const [rows] = await mysqlPool.query<PatientProfileRow[]>(
    `
      SELECT
        id,
        user_id
      FROM profils_patients
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId],
  );

  // Retourne null si aucun profil patient n'existe.
  if (rows.length === 0) {
    return null;
  }

  return mapPatientProfileRow(rows[0]);
}

/// Lit un creneau par identifiant.
export async function getAvailabilitySlotById(
  availabilitySlotId: string,
): Promise<AppointmentAvailabilitySlotRecord | null> {
  const connection = await mysqlPool.getConnection();

  try {
    return getAvailabilitySlotByIdWithConnection(connection, availabilitySlotId);
  } finally {
    connection.release();
  }
}

/// Liste les creneaux ouverts visibles par le patient.
export async function listOpenAvailabilitySlots(): Promise<OpenAppointmentSlotRecord[]> {
  const [rows] = await mysqlPool.query<AppointmentSlotRow[]>(
    `
      SELECT
        slots.id,
        slots.availability_id,
        slots.doctor_id,
        slots.starts_at,
        slots.ends_at,
        slots.status,
        slots.created_at,
        slots.updated_at,
        users.first_name AS doctor_first_name,
        users.last_name AS doctor_last_name,
        doctors.specialty AS doctor_specialty
      FROM creneaux_disponibilite slots
      INNER JOIN profils_medecins doctors
        ON doctors.id = slots.doctor_id
      INNER JOIN utilisateurs users
        ON users.id = doctors.user_id
      WHERE slots.status = 'open'
      ORDER BY slots.starts_at ASC
    `,
  );

  return rows.map(mapOpenAppointmentSlotRow);
}

/// Lit un rendez-vous par identifiant.
export async function getAppointmentById(appointmentId: string): Promise<AppointmentRecord | null> {
  const connection = await mysqlPool.getConnection();

  try {
    return getAppointmentByIdWithConnection(connection, appointmentId);
  } finally {
    connection.release();
  }
}

/// Liste les rendez-vous d'un patient dans l'ordre le plus recent.
export async function listAppointmentsByPatientId(patientId: string): Promise<AppointmentRecord[]> {
  const [rows] = await mysqlPool.query<AppointmentRow[]>(
    `
      SELECT
        id,
        patient_id,
        doctor_id,
        availability_slot_id,
        status,
        payment_status,
        payment_due_at,
        booked_at,
        confirmed_at,
        cancelled_at,
        completed_at,
        cancellation_reason,
        notes_internal,
        created_at,
        updated_at
      FROM rendezvous
      WHERE patient_id = ?
      ORDER BY booked_at DESC
    `,
    [patientId],
  );

  return rows.map(mapAppointmentRow);
}

/// Verrouille un creneau pour une reservation transactionnelle.
export async function lockAvailabilitySlotForReservation(
  connection: PoolConnection,
  availabilitySlotId: string,
): Promise<AppointmentAvailabilitySlotRecord | null> {
  const [rows] = await connection.query<AppointmentSlotRow[]>(
    `
      SELECT
        id,
        availability_id,
        doctor_id,
        starts_at,
        ends_at,
        status,
        created_at,
        updated_at,
        NULL AS doctor_first_name,
        NULL AS doctor_last_name,
        NULL AS doctor_specialty
      FROM creneaux_disponibilite
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [availabilitySlotId],
  );

  // Retourne null si aucun creneau n'existe a verrouiller.
  if (rows.length === 0) {
    return null;
  }

  return mapAppointmentSlotRow(rows[0]);
}

/// Cree un rendez-vous simple et relit la ligne inseree.
export async function createAppointment(
  input: AppointmentPersistenceInput,
  connection?: PoolConnection,
): Promise<AppointmentRecord> {
  const activeConnection = connection ?? (await mysqlPool.getConnection());
  // Genere l'identifiant texte avant insertion pour faciliter la relecture.
  const appointmentId = crypto.randomUUID();

  try {
    const [result] = await activeConnection.query<ResultSetHeader>(
      `
        INSERT INTO rendezvous (
          id,
          patient_id,
          doctor_id,
          availability_slot_id,
          status,
          payment_status,
          payment_due_at,
          notes_internal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        appointmentId,
        input.patientId,
        input.appointment.doctorId,
        input.appointment.availabilitySlotId,
        input.appointment.status,
        input.appointment.paymentStatus,
        input.paymentDueAt ?? null,
        input.appointment.notesInternal ?? null,
      ],
    );

    // Verifie qu'une ligne a bien ete ecrite.
    if (result.affectedRows !== 1) {
      throw new Error("Le rendez-vous n'a pas pu etre cree.");
    }

    const appointment = await getAppointmentByIdWithConnection(activeConnection, appointmentId);

    // Bloque si la ligne creee ne peut pas etre relue.
    if (!appointment) {
      throw new Error("Le rendez-vous cree n'a pas pu etre relu.");
    }

    return appointment;
  } finally {
    // Libere la connexion seulement si elle a ete ouverte ici.
    if (!connection) {
      activeConnection.release();
    }
  }
}

/// Passe un creneau en reserve dans une transaction.
export async function reserveAvailabilitySlot(
  availabilitySlotId: string,
  connection?: PoolConnection,
): Promise<AppointmentAvailabilitySlotRecord | null> {
  const activeConnection = connection ?? (await mysqlPool.getConnection());

  try {
    const [result] = await activeConnection.query<ResultSetHeader>(
      `
        UPDATE creneaux_disponibilite
        SET status = 'reserved'
        WHERE id = ?
      `,
      [availabilitySlotId],
    );

    // Retourne null si aucun creneau n'a ete mis a jour.
    if (result.affectedRows === 0) {
      return null;
    }

    return getAvailabilitySlotByIdWithConnection(activeConnection, availabilitySlotId);
  } finally {
    // Libere la connexion seulement si elle a ete ouverte ici.
    if (!connection) {
      activeConnection.release();
    }
  }
}
