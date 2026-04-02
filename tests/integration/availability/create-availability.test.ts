/// Test d'integration leger du flux de creation de disponibilite.

import { beforeEach, describe, expect, it, vi } from "vitest";

const mysqlMocks = vi.hoisted(() => {
  type AvailabilityRow = {
    id: string;
    doctor_id: string;
    created_by_user_id: string;
    starts_at: Date;
    ends_at: Date;
    source: string | null;
    status: "active" | "inactive";
    created_at: Date;
    updated_at: Date;
  };

  type AvailabilitySlotRow = {
    id: string;
    availability_id: string;
    doctor_id: string;
    starts_at: Date;
    ends_at: Date;
    status: "open" | "reserved" | "blocked" | "expired";
    created_at: Date;
    updated_at: Date;
  };

  // Conserve un etat en memoire pour simuler la base pendant le test.
  const state = {
    availabilities: [] as AvailabilityRow[],
    slots: [] as AvailabilitySlotRow[],
  };

  const fixedNow = new Date("2026-04-03T07:45:00.000Z");

  function normalizeSql(sql: string): string {
    return sql.replace(/\s+/g, " ").trim().toLowerCase();
  }

  function resetState(): void {
    state.availabilities = [];
    state.slots = [];
  }

  const connection = {
    beginTransaction: vi.fn(async () => undefined),
    commit: vi.fn(async () => undefined),
    rollback: vi.fn(async () => undefined),
    release: vi.fn(() => undefined),
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      const normalizedSql = normalizeSql(sql);

      // Simule l'insertion d'une disponibilite dans la base.
      if (normalizedSql.includes("insert into disponibilites")) {
        const [id, doctorId, createdByUserId, startsAt, endsAt, source, status] = params as [
          string,
          string,
          string,
          Date,
          Date,
          string | null,
          "active" | "inactive",
        ];

        state.availabilities.push({
          id,
          doctor_id: doctorId,
          created_by_user_id: createdByUserId,
          starts_at: new Date(startsAt),
          ends_at: new Date(endsAt),
          source,
          status,
          created_at: fixedNow,
          updated_at: fixedNow,
        });

        return [{ affectedRows: 1 }];
      }

      // Relit une disponibilite apres creation.
      if (
        normalizedSql.includes("from disponibilites") &&
        normalizedSql.includes("where id = ?")
      ) {
        const [availabilityId] = params as [string];

        return [state.availabilities.filter((row) => row.id === availabilityId)];
      }

      // Simule l'insertion en lot des creneaux generes.
      if (normalizedSql.includes("insert into creneaux_disponibilite")) {
        const [values] = params as [Array<[string, string, string, Date, Date, AvailabilitySlotRow["status"]]>];

        for (const [id, availabilityId, doctorId, startsAt, endsAt, status] of values) {
          state.slots.push({
            id,
            availability_id: availabilityId,
            doctor_id: doctorId,
            starts_at: new Date(startsAt),
            ends_at: new Date(endsAt),
            status,
            created_at: fixedNow,
            updated_at: fixedNow,
          });
        }

        return [{ affectedRows: values.length }];
      }

      // Relit les creneaux d'une disponibilite dans l'ordre chronologique.
      if (
        normalizedSql.includes("from creneaux_disponibilite") &&
        normalizedSql.includes("where availability_id = ?")
      ) {
        const [availabilityId] = params as [string];

        return [
          state.slots
            .filter((row) => row.availability_id === availabilityId)
            .sort((left, right) => left.starts_at.getTime() - right.starts_at.getTime()),
        ];
      }

      throw new Error(`Requete non geree par le mock: ${normalizedSql}`);
    }),
  };

  const pool = {
    getConnection: vi.fn(async () => connection),
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      const normalizedSql = normalizeSql(sql);

      // Liste les disponibilites pour un medecin.
      if (
        normalizedSql.includes("from disponibilites") &&
        normalizedSql.includes("where doctor_id = ?")
      ) {
        const [doctorId] = params as [string];

        return [
          state.availabilities
            .filter((row) => row.doctor_id === doctorId)
            .sort((left, right) => left.starts_at.getTime() - right.starts_at.getTime()),
        ];
      }

      throw new Error(`Requete pool non geree par le mock: ${normalizedSql}`);
    }),
  };

  return {
    connection,
    pool,
    resetState,
  };
});

vi.mock("mysql2/promise", () => {
  return {
    default: {
      createPool: vi.fn(() => mysqlMocks.pool),
    },
  };
});

describe("createAvailability integration", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "mysql://test:test@localhost:3306/clinique_nos_test";
    mysqlMocks.resetState();
    mysqlMocks.connection.beginTransaction.mockClear();
    mysqlMocks.connection.commit.mockClear();
    mysqlMocks.connection.rollback.mockClear();
    mysqlMocks.connection.release.mockClear();
    mysqlMocks.connection.query.mockClear();
    mysqlMocks.pool.getConnection.mockClear();
    mysqlMocks.pool.query.mockClear();
    vi.resetModules();
  });

  it("cree une disponibilite et relit ses creneaux a partir d'une entree validee", async () => {
    const randomUuidSpy = vi.spyOn(globalThis.crypto, "randomUUID");

    randomUuidSpy
      .mockReturnValueOnce("availability_1")
      .mockReturnValueOnce("slot_1")
      .mockReturnValueOnce("slot_2")
      .mockReturnValueOnce("slot_3");

    const { createAvailabilitySchema } = await import("../../../lib/validation/availability");
    const { buildAvailabilityDraft } = await import("../../../modules/availability/service");
    const {
      createAvailabilityWithSlots,
      listAvailabilitiesByDoctorId,
      listAvailabilitySlotsByAvailabilityId,
    } = await import("../../../modules/availability/repository");

    // Valide une entree proche d'un vrai formulaire staff.
    const parsedInput = createAvailabilitySchema.parse({
      doctorId: "doctor_1",
      startsAt: "2026-04-03T08:00:00.000Z",
      endsAt: "2026-04-03T09:30:00.000Z",
      slotDurationMinutes: "30",
      source: " staff_manual ",
      status: "active",
    });

    const draft = buildAvailabilityDraft(parsedInput);
    const createdAvailability = await createAvailabilityWithSlots({
      createdByUserId: "staff_1",
      draft,
    });
    const doctorAvailabilities = await listAvailabilitiesByDoctorId("doctor_1");
    const availabilitySlots = await listAvailabilitySlotsByAvailabilityId(
      createdAvailability.availability.id,
    );

    expect(createdAvailability.availability).toMatchObject({
      id: "availability_1",
      doctorId: "doctor_1",
      createdByUserId: "staff_1",
      source: "staff_manual",
      status: "active",
    });
    expect(createdAvailability.slots).toHaveLength(3);
    expect(createdAvailability.slots[0]).toMatchObject({
      id: "slot_1",
      availabilityId: "availability_1",
      doctorId: "doctor_1",
      status: "open",
    });
    expect(createdAvailability.slots[2]).toMatchObject({
      id: "slot_3",
      availabilityId: "availability_1",
      doctorId: "doctor_1",
      status: "open",
    });
    expect(doctorAvailabilities).toHaveLength(1);
    expect(doctorAvailabilities[0]?.id).toBe("availability_1");
    expect(availabilitySlots).toHaveLength(3);
    expect(availabilitySlots[1]?.startsAt.toISOString()).toBe("2026-04-03T08:30:00.000Z");
    expect(mysqlMocks.connection.beginTransaction).toHaveBeenCalledTimes(1);
    expect(mysqlMocks.connection.commit).toHaveBeenCalledTimes(1);
    expect(mysqlMocks.connection.rollback).not.toHaveBeenCalled();
    expect(mysqlMocks.pool.getConnection).toHaveBeenCalled();
    expect(mysqlMocks.pool.query).toHaveBeenCalledTimes(1);

    randomUuidSpy.mockRestore();
  });
});
