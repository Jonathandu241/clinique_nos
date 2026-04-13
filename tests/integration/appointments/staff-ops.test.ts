/// Tests d'intégration pour les opérations Staff (Annulation).

import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { mysqlPool } from "../../../lib/db/mysql";
import { staffCancelAppointment } from "../../../modules/appointments/service-staff";

describe("Staff Operations Integration Tests", () => {
  let testAppointmentId: string;
  let testSlotId: string;
  let testAvailabilityId: string;
  let testDoctorProfileId: string;
  let testPatientProfileId: string;
  let testDoctorUserId: string;
  let testPatientUserId: string;

  beforeAll(async () => {
    testDoctorUserId = crypto.randomUUID();
    testPatientUserId = crypto.randomUUID();
    testDoctorProfileId = crypto.randomUUID();
    testPatientProfileId = crypto.randomUUID();
    testAvailabilityId = crypto.randomUUID();
    testSlotId = crypto.randomUUID();
    testAppointmentId = crypto.randomUUID();

    // Setup DB minimal
    await mysqlPool.query("INSERT INTO utilisateurs (id, email, role, first_name, last_name) VALUES (?, ?, 'doctor', 'Dr', 'Staff')", [testDoctorUserId, `doctor-${testDoctorUserId}@test.com`]);
    await mysqlPool.query("INSERT INTO utilisateurs (id, email, role, first_name, last_name) VALUES (?, ?, 'patient', 'P', 'Test')", [testPatientUserId, `patient-${testPatientUserId}@test.com`]);
    await mysqlPool.query("INSERT INTO profils_medecins (id, user_id, specialty) VALUES (?, ?, 'General')", [testDoctorProfileId, testDoctorUserId]);
    await mysqlPool.query("INSERT INTO profils_patients (id, user_id) VALUES (?, ?)", [testPatientProfileId, testPatientUserId]);
    await mysqlPool.query("INSERT INTO disponibilites (id, doctor_id, created_by_user_id, starts_at, ends_at) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY))", [testAvailabilityId, testDoctorProfileId, testDoctorUserId]);
    
    // Créneau occupé
    await mysqlPool.query("INSERT INTO creneaux_disponibilite (id, availability_id, doctor_id, starts_at, ends_at, status) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'booked')", [testSlotId, testAvailabilityId, testDoctorProfileId]);
    
    // Rendez-vous confirmé
    await mysqlPool.query(
      "INSERT INTO rendezvous (id, patient_id, doctor_id, availability_slot_id, status, payment_status, booked_at) VALUES (?, ?, ?, ?, 'confirmed', 'paid', NOW())",
      [testAppointmentId, testPatientProfileId, testDoctorProfileId, testSlotId]
    );
  });

  afterAll(async () => {
    await mysqlPool.query("DELETE FROM evenements_notification WHERE appointment_id = ?", [testAppointmentId]);
    await mysqlPool.query("DELETE FROM rendezvous WHERE id = ?", [testAppointmentId]);
    await mysqlPool.query("DELETE FROM creneaux_disponibilite WHERE id = ?", [testSlotId]);
    await mysqlPool.query("DELETE FROM disponibilites WHERE id = ?", [testAvailabilityId]);
    await mysqlPool.query("DELETE FROM profils_patients WHERE id = ?", [testPatientProfileId]);
    await mysqlPool.query("DELETE FROM profils_medecins WHERE id = ?", [testDoctorProfileId]);
    await mysqlPool.query("DELETE FROM utilisateurs WHERE id IN (?, ?)", [testDoctorUserId, testPatientUserId]);
  });

  it("doit annuler le rendez-vous et libérer le créneau", async () => {
    const result = await staffCancelAppointment(testAppointmentId, "Désistement médecin");
    
    expect(result.success).toBe(true);

    const [rdv] = await mysqlPool.query<any[]>("SELECT status FROM rendezvous WHERE id = ?", [testAppointmentId]);
    const [slot] = await mysqlPool.query<any[]>("SELECT status FROM creneaux_disponibilite WHERE id = ?", [testSlotId]);

    expect(rdv[0].status).toBe('cancelled_by_staff');
    expect(slot[0].status).toBe('open');
  });

  it("doit renvoyer une erreur si le rdv n'existe pas", async () => {
    await expect(staffCancelAppointment("non-existent", "test")).rejects.toThrow("Rendez-vous non trouvé.");
  });
});
