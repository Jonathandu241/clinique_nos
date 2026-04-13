/// Tests d'intégration pour la lecture des rendez-vous et la sécurité des données.

import { beforeEach, describe, expect, it, vi } from "vitest";

const mysqlMocks = vi.hoisted(() => {
  const state = {
    appointments: [
      { id: "app_1", patient_id: "p_1", doctor_id: "d_1", status: "confirmed", booked_at: new Date(), starts_at: new Date(), ends_at: new Date(), patient_first_name: "Alice", patient_last_name: "Patient", doctor_first_name: "Bob", doctor_last_name: "Doctor" },
      { id: "app_2", patient_id: "p_2", doctor_id: "d_1", status: "pending", booked_at: new Date(), starts_at: new Date(), ends_at: new Date(), patient_first_name: "Charlie", patient_last_name: "Other", doctor_first_name: "Bob", doctor_last_name: "Doctor" },
    ],
  };

  const pool = {
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      const normalizedSql = sql.replace(/\s+/g, " ").trim().toLowerCase();

      // Détail d'un rendez-vous (vérifier rv.id = ? en priorité)
      if (normalizedSql.includes("where rv.id = ?")) {
        const [id] = params as [string];
        const app = state.appointments.find(a => a.id === id);
        return [app ? [app] : []];
      }

      // Liste globale pour le staff
      if (normalizedSql.includes("from rendezvous rv") && normalizedSql.includes("inner join profils_patients pp")) {
        // Simulation du SELECT enrichi
        return [state.appointments.map(a => ({
          ...a,
          starts_at: a.starts_at,
          ends_at: a.ends_at
        }))];
      }

      return [[]];
    }),
  };

  return { pool, state };
});

vi.mock("mysql2/promise", () => ({
  default: { createPool: vi.fn(() => mysqlMocks.pool) },
}));

// Mock du pool interne utilisé par le repository
vi.mock("../../../lib/db/mysql", () => ({
  mysqlPool: mysqlMocks.pool,
}));

describe("Lecture des rendez-vous (Consultation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Tâche 6.1 & 6.4 : listAllAppointmentsWithProfiles", () => {
    it("doit retourner la liste complète des rendez-vous avec les noms des profils", async () => {
      const { listAllAppointmentsWithProfiles } = await import("../../../modules/appointments/repository");
      
      const results = await listAllAppointmentsWithProfiles();
      
      expect(results).toHaveLength(2);
      expect(results[0].patientLastName).toBe("Patient");
      expect(results[1].patientLastName).toBe("Other");
      expect(results[0].doctorLastName).toBe("Doctor");
    });
  });

  describe("Tâche 6.1 & 6.3.1 : getAppointmentDetailById", () => {
    it("doit retourner les détails complets d'un rendez-vous existant", async () => {
      const { getAppointmentDetailById } = await import("../../../modules/appointments/repository");
      
      const result = await getAppointmentDetailById("app_1");
      
      expect(result).not.toBeNull();
      expect(result?.patientFirstName).toBe("Alice");
      expect(result?.id).toBe("app_1");
    });

    it("doit retourner null pour un identifiant inexistant", async () => {
      const { getAppointmentDetailById } = await import("../../../modules/appointments/repository");
      
      const result = await getAppointmentDetailById("app_inconnu");
      
      expect(result).toBeNull();
    });
  });

  describe("Tâche 6.5 : Sécurité de lecture (Logique application)", () => {
    it("simule la vérification d'accès patient : un patient ne doit voir que ses rendez-vous", async () => {
      const { getAppointmentDetailById } = await import("../../../modules/appointments/repository");
      
      const currentPatientId = "p_1"; // ID du patient connecté simulé
      const appointment = await getAppointmentDetailById("app_1");
      
      // La logique de sécurité dans la page :
      const hasAccess = appointment && appointment.patientId === currentPatientId;
      
      expect(hasAccess).toBe(true);

      const otherAppointment = await getAppointmentDetailById("app_2");
      const hasAccessToOther = otherAppointment && otherAppointment.patientId === currentPatientId;
      
      expect(hasAccessToOther).toBe(false);
    });
  });
});
