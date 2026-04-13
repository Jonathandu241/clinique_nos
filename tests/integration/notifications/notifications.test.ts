/// Tests d'intégration pour le système de notifications (Version MySQL2).

import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { mysqlPool } from "../../../lib/db/mysql";
import { notifyPatientReservationPending, notifyAppointmentConfirmed } from "../../../modules/notifications/events";
import { NotificationStatus } from "../../../modules/notifications/types";

describe("Notifications Integration Tests", () => {
  let testAppointmentId: string;

  beforeAll(async () => {
    // On récupère ou crée des IDs de test
    const [patients] = await mysqlPool.query<any[]>("SELECT id FROM profils_patients LIMIT 1");
    const [doctors] = await mysqlPool.query<any[]>("SELECT id FROM profils_medecins LIMIT 1");
    const [slots] = await mysqlPool.query<any[]>("SELECT id FROM creneaux_disponibilite WHERE status = 'open' LIMIT 1");

    if (patients.length === 0 || doctors.length === 0 || slots.length === 0) {
      throw new Error("Données de test insuffisantes.");
    }

    testAppointmentId = crypto.randomUUID();
    
    // Création d'un rdv de test
    await mysqlPool.query(
      "INSERT INTO rendezvous (id, patient_id, doctor_id, availability_slot_id, status, payment_status, booked_at) VALUES (?, ?, ?, ?, 'pending', 'unpaid', NOW())",
      [testAppointmentId, patients[0].id, doctors[0].id, slots[0].id]
    );
  });

  afterAll(async () => {
    // Nettoyage
    await mysqlPool.query("DELETE FROM evenements_notification WHERE appointment_id = ?", [testAppointmentId]);
    await mysqlPool.query("DELETE FROM rendezvous WHERE id = ?", [testAppointmentId]);
  });

  it("doit enregistrer un log de notification lors de la réservation en attente", async () => {
    const result = await notifyPatientReservationPending(testAppointmentId);
    
    expect(result).toBeDefined();
    expect(result?.success).toBe(true);

    const [rows] = await mysqlPool.query<any[]>(
      "SELECT * FROM evenements_notification WHERE appointment_id = ? AND template = ?",
      [testAppointmentId, 'patient_reservation_pending']
    );

    expect(rows.length).toBe(1);
    expect(rows[0].status).toBe(NotificationStatus.sent);
  });

  it("doit enregistrer deux logs (patient + docteur) lors de la confirmation", async () => {
    await notifyAppointmentConfirmed(testAppointmentId);

    const [rows] = await mysqlPool.query<any[]>(
      "SELECT * FROM evenements_notification WHERE appointment_id = ?",
      [testAppointmentId]
    );

    // 1 (réservation) + 2 (confirmation) = 3
    expect(rows.length).toBe(3);
    
    const templates = rows.map(r => r.template);
    expect(templates).toContain('patient_payment_confirmed');
    expect(templates).toContain('doctor_new_appointment');
  });
});
