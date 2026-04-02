/// Repository SQL simple pour les disponibilites Clinique NOS.

import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { mysqlPool } from "../../lib/db/mysql";
import type {
  AvailabilityDraft,
  AvailabilityPersistenceInput,
  AvailabilityRecord,
  AvailabilitySlotDraft,
  AvailabilitySlotRecord,
} from "./types";

type AvailabilityRow = RowDataPacket & {
  id: string;
  doctor_id: string;
  created_by_user_id: string;
  starts_at: Date;
  ends_at: Date;
  source: string | null;
  status: AvailabilityRecord["status"];
  created_at: Date;
  updated_at: Date;
};

type AvailabilitySlotRow = RowDataPacket & {
  id: string;
  availability_id: string;
  doctor_id: string;
  starts_at: Date;
  ends_at: Date;
  status: AvailabilitySlotRecord["status"];
  created_at: Date;
  updated_at: Date;
};

/// Convertit une ligne SQL de disponibilite vers le format du domaine.
function mapAvailabilityRow(row: AvailabilityRow): AvailabilityRecord {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    createdByUserId: row.created_by_user_id,
    startsAt: new Date(row.starts_at),
    endsAt: new Date(row.ends_at),
    source: row.source ?? undefined,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/// Convertit une ligne SQL de creneau vers le format du domaine.
function mapAvailabilitySlotRow(row: AvailabilitySlotRow): AvailabilitySlotRecord {
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

/// Relit une disponibilite par identifiant sur une connexion donnee.
async function getAvailabilityByIdWithConnection(
  connection: PoolConnection,
  availabilityId: string,
): Promise<AvailabilityRecord | null> {
  const [rows] = await connection.query<AvailabilityRow[]>(
    `
      SELECT
        id,
        doctor_id,
        created_by_user_id,
        starts_at,
        ends_at,
        source,
        status,
        created_at,
        updated_at
      FROM disponibilites
      WHERE id = ?
      LIMIT 1
    `,
    [availabilityId],
  );

  // Retourne null si aucune disponibilite n'existe pour cet identifiant.
  if (rows.length === 0) {
    return null;
  }

  return mapAvailabilityRow(rows[0]);
}

/// Relit les creneaux d'une disponibilite sur une connexion donnee.
async function listAvailabilitySlotsByAvailabilityIdWithConnection(
  connection: PoolConnection,
  availabilityId: string,
): Promise<AvailabilitySlotRecord[]> {
  const [rows] = await connection.query<AvailabilitySlotRow[]>(
    `
      SELECT
        id,
        availability_id,
        doctor_id,
        starts_at,
        ends_at,
        status,
        created_at,
        updated_at
      FROM creneaux_disponibilite
      WHERE availability_id = ?
      ORDER BY starts_at ASC
    `,
    [availabilityId],
  );

  return rows.map(mapAvailabilitySlotRow);
}

/// Cree une disponibilite simple et retourne son identifiant relu.
export async function createAvailability(
  input: AvailabilityPersistenceInput,
  connection?: PoolConnection,
): Promise<AvailabilityRecord> {
  const activeConnection = connection ?? (await mysqlPool.getConnection());
  // Genere l'identifiant texte avant l'insertion pour pouvoir relire la ligne sans ambiguite.
  const availabilityId = crypto.randomUUID();

  try {
    const [result] = await activeConnection.query<ResultSetHeader>(
      `
        INSERT INTO disponibilites (
          id,
          doctor_id,
          created_by_user_id,
          starts_at,
          ends_at,
          source,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        availabilityId,
        input.availability.doctorId,
        input.createdByUserId,
        input.availability.startsAt,
        input.availability.endsAt,
        input.availability.source ?? null,
        input.availability.status,
      ],
    );

    // Verifie qu'une ligne a bien ete ecrite avant de relire la disponibilite.
    if (result.affectedRows !== 1) {
      throw new Error("La disponibilite n'a pas pu etre creee.");
    }

    const availability = await getAvailabilityByIdWithConnection(activeConnection, availabilityId);

    // Bloque si la ligne creee ne peut pas etre relue.
    if (!availability) {
      throw new Error("La disponibilite creee n'a pas pu etre relue.");
    }

    return availability;
  } finally {
    // Libere la connexion seulement si elle a ete ouverte par cette fonction.
    if (!connection) {
      activeConnection.release();
    }
  }
}

/// Cree plusieurs creneaux rattaches a une disponibilite.
export async function createAvailabilitySlots(
  availabilityId: string,
  doctorId: string,
  slots: AvailabilitySlotDraft[],
  connection?: PoolConnection,
): Promise<AvailabilitySlotRecord[]> {
  const activeConnection = connection ?? (await mysqlPool.getConnection());

  try {
    // Evite une ecriture SQL vide quand aucun creneau n'est fourni.
    if (slots.length === 0) {
      return [];
    }

    const values = slots.map((slot) => [
      crypto.randomUUID(),
      availabilityId,
      doctorId,
      slot.startsAt,
      slot.endsAt,
      slot.status,
    ]);

    await activeConnection.query(
      `
        INSERT INTO creneaux_disponibilite (
          id,
          availability_id,
          doctor_id,
          starts_at,
          ends_at,
          status
        ) VALUES ?
      `,
      [values],
    );

    return listAvailabilitySlotsByAvailabilityIdWithConnection(activeConnection, availabilityId);
  } finally {
    // Libere la connexion seulement si elle a ete ouverte par cette fonction.
    if (!connection) {
      activeConnection.release();
    }
  }
}

/// Cree une disponibilite et ses creneaux dans une seule transaction.
export async function createAvailabilityWithSlots(
  input: {
    createdByUserId: string;
    draft: AvailabilityDraft;
  },
): Promise<{
  availability: AvailabilityRecord;
  slots: AvailabilitySlotRecord[];
}> {
  const connection = await mysqlPool.getConnection();

  try {
    await connection.beginTransaction();

    const availability = await createAvailability(
      {
        createdByUserId: input.createdByUserId,
        availability: input.draft.availability,
      },
      connection,
    );
    const slots = await createAvailabilitySlots(
      availability.id,
      availability.doctorId,
      input.draft.slots,
      connection,
    );

    await connection.commit();

    return {
      availability,
      slots,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/// Liste les disponibilites d'un medecin dans l'ordre chronologique.
export async function listAvailabilitiesByDoctorId(
  doctorId: string,
): Promise<AvailabilityRecord[]> {
  const [rows] = await mysqlPool.query<AvailabilityRow[]>(
    `
      SELECT
        id,
        doctor_id,
        created_by_user_id,
        starts_at,
        ends_at,
        source,
        status,
        created_at,
        updated_at
      FROM disponibilites
      WHERE doctor_id = ?
      ORDER BY starts_at ASC
    `,
    [doctorId],
  );

  return rows.map(mapAvailabilityRow);
}

/// Liste les creneaux d'une disponibilite.
export async function listAvailabilitySlotsByAvailabilityId(
  availabilityId: string,
): Promise<AvailabilitySlotRecord[]> {
  const connection = await mysqlPool.getConnection();

  try {
    return listAvailabilitySlotsByAvailabilityIdWithConnection(connection, availabilityId);
  } finally {
    connection.release();
  }
}

/// Liste les creneaux de tous les blocs d'un medecin.
export async function listAvailabilitySlotsByDoctorId(
  doctorId: string,
): Promise<AvailabilitySlotRecord[]> {
  const [rows] = await mysqlPool.query<AvailabilitySlotRow[]>(
    `
      SELECT
        id,
        availability_id,
        doctor_id,
        starts_at,
        ends_at,
        status,
        created_at,
        updated_at
      FROM creneaux_disponibilite
      WHERE doctor_id = ?
      ORDER BY starts_at ASC
    `,
    [doctorId],
  );

  return rows.map(mapAvailabilitySlotRow);
}

/// Desactive une disponibilite sans supprimer son historique.
export async function deactivateAvailability(availabilityId: string): Promise<AvailabilityRecord | null> {
  const [result] = await mysqlPool.query<ResultSetHeader>(
    `
      UPDATE disponibilites
      SET status = 'inactive'
      WHERE id = ?
    `,
    [availabilityId],
  );

  // Retourne null si aucune ligne n'a ete mise a jour.
  if (result.affectedRows === 0) {
    return null;
  }

  const connection = await mysqlPool.getConnection();

  try {
    return getAvailabilityByIdWithConnection(connection, availabilityId);
  } finally {
    connection.release();
  }
}
