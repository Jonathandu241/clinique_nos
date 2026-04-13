/// Tests pour les requêtes patient.

import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { mysqlPool } from "../../../lib/db/mysql";
import { getAppointmentsByPatientId, getPatientProfileByUserId } from "../../../modules/appointments/repository";

describe("Patient Queries Integration Tests", () => {
  let testUserId: string;
  let testPatientProfileId: string;

  beforeAll(async () => {
    testUserId = crypto.randomUUID();
    testPatientProfileId = crypto.randomUUID();

    await mysqlPool.query("INSERT INTO utilisateurs (id, email, role, first_name, last_name) VALUES (?, ?, 'patient', 'P', 'Test')", [testUserId, `patient-${testUserId}@test.com`]);
    await mysqlPool.query("INSERT INTO profils_patients (id, user_id) VALUES (?, ?)", [testPatientProfileId, testUserId]);
  });

  afterAll(async () => {
    await mysqlPool.query("DELETE FROM profils_patients WHERE id = ?", [testPatientProfileId]);
    await mysqlPool.query("DELETE FROM utilisateurs WHERE id = ?", [testUserId]);
  });

  it("doit retrouver le profil patient par son user_id avec prénom", async () => {
    const profile = await getPatientProfileByUserId(testUserId);
    expect(profile).not.toBeNull();
    if (profile) {
      expect(profile.id).toBe(testPatientProfileId);
      expect(profile.firstName).toBe("P");
    }
  });

  it("doit retourner une liste vide pour un patient sans rdv", async () => {
    const appointments = await getAppointmentsByPatientId(testPatientProfileId);
    expect(Array.isArray(appointments)).toBe(true);
    expect(appointments.length).toBe(0);
  });
});
