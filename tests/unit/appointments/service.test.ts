import { describe, expect, it, vi } from "vitest";
import { buildAppointmentReservationDraft, reserveAppointment } from "../../../modules/appointments/service";
import type {
  AppointmentAvailabilitySlotRecord,
  AppointmentRecord,
  PatientProfileRecord,
} from "../../../modules/appointments/types";

/// Cree un creneau de base pour les tests du service.
function createSlot(overrides: Partial<AppointmentAvailabilitySlotRecord> = {}): AppointmentAvailabilitySlotRecord {
  return {
    id: "slot_1",
    availabilityId: "availability_1",
    doctorId: "doctor_1",
    startsAt: new Date("2026-04-04T08:00:00.000Z"),
    endsAt: new Date("2026-04-04T08:30:00.000Z"),
    status: "open",
    createdAt: new Date("2026-04-03T08:00:00.000Z"),
    updatedAt: new Date("2026-04-03T08:00:00.000Z"),
    ...overrides,
  };
}

/// Cree un rendez-vous de base pour les tests du service.
function createAppointmentRecord(overrides: Partial<AppointmentRecord> = {}): AppointmentRecord {
  return {
    id: "appointment_1",
    patientId: "patient_profile_1",
    doctorId: "doctor_1",
    availabilitySlotId: "slot_1",
    status: "pending",
    paymentStatus: "unpaid",
    bookedAt: new Date("2026-04-03T08:00:00.000Z"),
    createdAt: new Date("2026-04-03T08:00:00.000Z"),
    updatedAt: new Date("2026-04-03T08:00:00.000Z"),
    ...overrides,
  };
}

/// Cree un profil patient simple pour les tests.
function createPatientProfile(): PatientProfileRecord {
  return {
    id: "patient_profile_1",
    userId: "patient_user_1",
  };
}

/// Cree des dependances de test avec des espions simples.
function createDependencies() {
  const connection = {
    beginTransaction: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
    release: vi.fn(),
  };

  return {
    connection,
    dependencies: {
      createConnection: vi.fn().mockResolvedValue(connection),
      getPatientProfileByUserId: vi.fn().mockResolvedValue(createPatientProfile()),
      lockAvailabilitySlotForReservation: vi.fn().mockResolvedValue(createSlot()),
      createAppointment: vi.fn().mockResolvedValue(createAppointmentRecord()),
      reserveAvailabilitySlot: vi.fn().mockResolvedValue(createSlot({ status: "reserved" })),
    },
  };
}

describe("buildAppointmentReservationDraft", () => {
  it("prepare un draft de reservation simple", () => {
    const draft = buildAppointmentReservationDraft(
      {
        availabilitySlotId: "slot_1",
        doctorId: "doctor_1",
        notesInternal: "  Premier rendez-vous  ",
      },
      "patient_user_1",
    );

    expect(draft.patientUserId).toBe("patient_user_1");
    expect(draft.appointment).toMatchObject({
      availabilitySlotId: "slot_1",
      doctorId: "doctor_1",
      status: "pending",
      paymentStatus: "unpaid",
      notesInternal: "Premier rendez-vous",
    });
  });
});

describe("reserveAppointment", () => {
  it("reserve un creneau ouvert dans une transaction", async () => {
    const { connection, dependencies } = createDependencies();

    const result = await reserveAppointment(
      {
        availabilitySlotId: "slot_1",
        doctorId: "doctor_1",
        notesInternal: "Besoin d'un suivi",
      },
      "patient_user_1",
      dependencies,
    );

    expect(dependencies.getPatientProfileByUserId).toHaveBeenCalledWith("patient_user_1");
    expect(dependencies.lockAvailabilitySlotForReservation).toHaveBeenCalledWith(connection, "slot_1");
    expect(dependencies.createAppointment).toHaveBeenCalledWith(
      {
        patientId: "patient_profile_1",
        appointment: expect.objectContaining({
          availabilitySlotId: "slot_1",
          doctorId: "doctor_1",
          status: "pending",
          paymentStatus: "unpaid",
        }),
      },
      connection,
    );
    expect(dependencies.reserveAvailabilitySlot).toHaveBeenCalledWith("slot_1", connection);
    expect(connection.beginTransaction).toHaveBeenCalledOnce();
    expect(connection.commit).toHaveBeenCalledOnce();
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledOnce();
    expect(result.reservedSlot.status).toBe("reserved");
  });

  it("refuse la reservation si le profil patient est introuvable", async () => {
    const { dependencies } = createDependencies();
    dependencies.getPatientProfileByUserId.mockResolvedValueOnce(null);

    await expect(
      reserveAppointment(
        {
          availabilitySlotId: "slot_1",
          doctorId: "doctor_1",
        },
        "patient_user_1",
        dependencies,
      ),
    ).rejects.toThrow("Le profil patient est introuvable.");

    expect(dependencies.createConnection).not.toHaveBeenCalled();
  });

  it("annule la transaction si le creneau est deja reserve", async () => {
    const { connection, dependencies } = createDependencies();
    dependencies.lockAvailabilitySlotForReservation.mockResolvedValueOnce(
      createSlot({ status: "reserved" }),
    );

    await expect(
      reserveAppointment(
        {
          availabilitySlotId: "slot_1",
          doctorId: "doctor_1",
        },
        "patient_user_1",
        dependencies,
      ),
    ).rejects.toThrow("Ce creneau n'est plus disponible.");

    expect(connection.beginTransaction).toHaveBeenCalledOnce();
    expect(connection.rollback).toHaveBeenCalledOnce();
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledOnce();
  });

  it("annule la transaction si le creneau ne correspond pas au medecin choisi", async () => {
    const { connection, dependencies } = createDependencies();
    dependencies.lockAvailabilitySlotForReservation.mockResolvedValueOnce(
      createSlot({ doctorId: "doctor_2" }),
    );

    await expect(
      reserveAppointment(
        {
          availabilitySlotId: "slot_1",
          doctorId: "doctor_1",
        },
        "patient_user_1",
        dependencies,
      ),
    ).rejects.toThrow("Le creneau ne correspond pas au medecin selectionne.");

    expect(connection.rollback).toHaveBeenCalledOnce();
    expect(connection.release).toHaveBeenCalledOnce();
  });
});
