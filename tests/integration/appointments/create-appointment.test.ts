/// Test d'integration transactionnel pour la reservation de rendez-vous Clinique NOS.

import { beforeEach, describe, expect, it, vi } from "vitest";

const mysqlMocks = vi.hoisted(() => {
  type SlotRow = {
    id: string;
    doctor_id: string;
    status: string;
    starts_at: Date;
    ends_at: Date;
  };

  type AppointmentRow = {
    id: string;
    patient_id: string;
    doctor_id: string;
    availability_slot_id: string;
    status: string;
    payment_status: string;
    notes_internal?: string | null;
  };

  const state = {
    patients: [{ id: "patient_1", user_id: "user_patient_1" }],
    slots: [
      {
        id: "slot_open",
        doctor_id: "doctor_1",
        status: "open",
        starts_at: new Date("2026-04-13T14:00:00Z"),
        ends_at: new Date("2026-04-13T14:30:00Z"),
      },
      {
        id: "slot_reserved",
        doctor_id: "doctor_1",
        status: "reserved",
        starts_at: new Date("2026-04-13T15:00:00Z"),
        ends_at: new Date("2026-04-13T15:30:00Z"),
      },
    ] as SlotRow[],
    appointments: [] as AppointmentRow[],
  };

  function normalizeSql(sql: string): string {
    return sql.replace(/\s+/g, " ").trim().toLowerCase();
  }

  const connection = {
    beginTransaction: vi.fn(async () => undefined),
    commit: vi.fn(async () => undefined),
    rollback: vi.fn(async () => undefined),
    release: vi.fn(() => undefined),
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      const normalizedSql = normalizeSql(sql);

      // Simule le verrouillage du creneau (FOR UPDATE)
      if (normalizedSql.includes("from creneaux_disponibilite") && normalizedSql.includes("for update")) {
        const [id] = params as [string];
        const slot = state.slots.find((s) => s.id === id);
        return [slot ? [slot] : []];
      }

      // Simule l'insertion du rendez-vous
      if (normalizedSql.includes("insert into rendezvous")) {
        const [id, patientId, doctorId, slotId, status, paymentStatus, _, notes] = params as [
          string,
          string,
          string,
          string,
          string,
          string,
          Date | null,
          string | null,
        ];
        const appointment = {
          id,
          patient_id: patientId,
          doctor_id: doctorId,
          availability_slot_id: slotId,
          status,
          payment_status: paymentStatus,
          notes_internal: notes,
          booked_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        };
        state.appointments.push(appointment);
        return [{ affectedRows: 1 }];
      }

      // Simule la mise a jour du statut du creneau
      if (normalizedSql.includes("update creneaux_disponibilite") && normalizedSql.includes("set status = 'reserved'")) {
        const [id] = params as [string];
        const slot = state.slots.find((s) => s.id === id);
        if (slot) {
          slot.status = "reserved";
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }

      // Simule la relecture d'un rendez-vous par id
      if (normalizedSql.includes("from rendezvous") && normalizedSql.includes("where id = ?")) {
        const [id] = params as [string];
        const appointment = state.appointments.find((a) => a.id === id);
        return [appointment ? [appointment] : []];
      }

      // Simule la relecture d'un creneau par id
      if (normalizedSql.includes("from creneaux_disponibilite") && normalizedSql.includes("where id = ?")) {
        const [id] = params as [string];
        const slot = state.slots.find((s) => s.id === id);
        return [slot ? [slot] : []];
      }

      throw new Error(`Requete non geree: ${normalizedSql}`);
    }),
  };

  const pool = {
    getConnection: vi.fn(async () => connection),
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      const normalizedSql = normalizeSql(sql);

      // Simule la recherche du profil patient
      if (normalizedSql.includes("from profils_patients") && normalizedSql.includes("where user_id = ?")) {
        const [userId] = params as [string];
        const patient = state.patients.find((p) => p.user_id === userId);
        return [patient ? [patient] : []];
      }

      throw new Error(`Requete pool non geree: ${normalizedSql}`);
    }),
  };

  return {
    connection,
    pool,
    state,
  };
});

vi.mock("mysql2/promise", () => {
  return {
    default: {
      createPool: vi.fn(() => mysqlMocks.pool),
    },
  };
});

describe("reserveAppointment integration", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "mysql://test:test@localhost:3306/test";
    vi.clearAllMocks();
    // Reset state
    mysqlMocks.state.appointments = [];
    mysqlMocks.state.slots[0].status = "open";
    mysqlMocks.state.slots[1].status = "reserved";
  });

  it("reserve avec succes un creneau ouvert et cree le rendez-vous correspondant", async () => {
    const { reserveAppointment } = await import("../../../modules/appointments/service");

    const result = await reserveAppointment(
      {
        doctorId: "doctor_1",
        availabilitySlotId: "slot_open",
        notesInternal: "Besoin d'un checkup complet.",
      },
      "user_patient_1",
    );

    expect(result.appointment.status).toBe("pending");
    expect(result.appointment.patientId).toBe("patient_1");
    expect(result.reservedSlot.status).toBe("reserved");
    expect(mysqlMocks.state.appointments).toHaveLength(1);
    expect(mysqlMocks.connection.commit).toHaveBeenCalled();
    expect(mysqlMocks.connection.rollback).not.toHaveBeenCalled();
  });

  it("echoue et annule la transaction si le creneau est deja reserve", async () => {
    const { reserveAppointment } = await import("../../../modules/appointments/service");

    await expect(
      reserveAppointment(
        {
          doctorId: "doctor_1",
          availabilitySlotId: "slot_reserved",
        },
        "user_patient_1",
      ),
    ).rejects.toThrow("Ce creneau n'est plus disponible.");

    expect(mysqlMocks.state.appointments).toHaveLength(0);
    expect(mysqlMocks.connection.rollback).toHaveBeenCalled();
  });

  it("echoue si le patient n'a pas de profil", async () => {
    const { reserveAppointment } = await import("../../../modules/appointments/service");

    await expect(
      reserveAppointment(
        {
          doctorId: "doctor_1",
          availabilitySlotId: "slot_open",
        },
        "user_inconnu",
      ),
    ).rejects.toThrow("Le profil patient est introuvable.");

    expect(mysqlMocks.connection.rollback).not.toHaveBeenCalled(); // L'erreur arrive avant la transaction
  });
});
