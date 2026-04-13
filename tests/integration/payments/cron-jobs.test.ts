/// Tests d'intégration pour les Jobs Cron (Expirations et Rappels).

import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { mysqlPool } from "../../../lib/db/mysql";
import { processExpiredAppointments, sendPaymentReminders } from "../../../modules/payments/jobs";

describe("Cron Jobs Integration Tests", () => {
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

    // 1. Création Users
    await mysqlPool.query(
      "INSERT INTO utilisateurs (id, email, role, first_name, last_name, created_at, updated_at) VALUES (?, ?, 'doctor', 'Test', 'Doctor', NOW(), NOW())",
      [testDoctorUserId, `doctor-${testDoctorUserId}@example.com`]
    );
    await mysqlPool.query(
      "INSERT INTO utilisateurs (id, email, role, first_name, last_name, created_at, updated_at) VALUES (?, ?, 'patient', 'Test', 'Patient', NOW(), NOW())",
      [testPatientUserId, `patient-${testPatientUserId}@example.com`]
    );

    // 2. Création Profiles
    await mysqlPool.query(
      "INSERT INTO profils_medecins (id, user_id, specialty, created_at, updated_at) VALUES (?, ?, 'General', NOW(), NOW())",
      [testDoctorProfileId, testDoctorUserId]
    );
    await mysqlPool.query(
      "INSERT INTO profils_patients (id, user_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [testPatientProfileId, testPatientUserId]
    );

    // 3. Création Disponibilité (Parent) - Colonne correcte : created_by_user_id
    await mysqlPool.query(
      "INSERT INTO disponibilites (id, doctor_id, created_by_user_id, starts_at, ends_at, created_at, updated_at) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), NOW())",
      [testAvailabilityId, testDoctorProfileId, testDoctorUserId]
    );

    // 4. Création créneau 'booked'
    await mysqlPool.query(
      "INSERT INTO creneaux_disponibilite (id, availability_id, doctor_id, starts_at, ends_at, status) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'booked')",
      [testSlotId, testAvailabilityId, testDoctorProfileId]
    );

    // 5. Création rdv expiré
    await mysqlPool.query(
      `INSERT INTO rendezvous (id, patient_id, doctor_id, availability_slot_id, status, payment_status, booked_at, payment_due_at) 
       VALUES (?, ?, ?, ?, 'pending', 'unpaid', NOW(), DATE_SUB(NOW(), INTERVAL 1 MINUTE))`,
      [testAppointmentId, testPatientProfileId, testDoctorProfileId, testSlotId]
    );
  });

  afterAll(async () => {
    // Nettoyage en cascade
    try {
      await mysqlPool.query("DELETE FROM evenements_notification WHERE appointment_id = ?", [testAppointmentId]);
      await mysqlPool.query("DELETE FROM rendezvous WHERE id = ?", [testAppointmentId]);
      await mysqlPool.query("DELETE FROM creneaux_disponibilite WHERE id = ?", [testSlotId]);
      await mysqlPool.query("DELETE FROM disponibilites WHERE id = ?", [testAvailabilityId]);
      await mysqlPool.query("DELETE FROM profils_patients WHERE id = ?", [testPatientProfileId]);
      await mysqlPool.query("DELETE FROM profils_medecins WHERE id = ?", [testDoctorProfileId]);
      await mysqlPool.query("DELETE FROM utilisateurs WHERE id IN (?, ?)", [testDoctorUserId, testPatientUserId]);
    } catch (e) {
      console.error("Erreur nettoyage test :", e);
    }
  });

  it("doit expirer le rendez-vous et libérer le créneau", async () => {
    const result = await processExpiredAppointments();
    
    expect(result.expiredCount).toBeGreaterThanOrEqual(1);

    const [rdv] = await mysqlPool.query<any[]>("SELECT status FROM rendezvous WHERE id = ?", [testAppointmentId]);
    const [slot] = await mysqlPool.query<any[]>("SELECT status FROM creneaux_disponibilite WHERE id = ?", [testSlotId]);

    expect(rdv[0].status).toBe('expired_unpaid');
    expect(slot[0].status).toBe('open');
  });

  it("ne doit pas envoyer de rappel si le rdv n'est pas trouvé ou déjà expiré", async () => {
    const result = await sendPaymentReminders();
    
    const [logs] = await mysqlPool.query<any[]>(
      "SELECT id FROM evenements_notification WHERE appointment_id = ? AND template = 'patient_payment_reminder'",
      [testAppointmentId]
    );
    
    expect(logs.length).toBe(0);
  });
});
