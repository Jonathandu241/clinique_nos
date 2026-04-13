/// Tests d'intégration pour le cycle de paiement simulé.

import { beforeEach, describe, expect, it, vi } from "vitest";

const mysqlMocks = vi.hoisted(() => {
  const state = {
    appointments: [
      { id: "app_pending", patient_id: "p_1", status: "pending", payment_status: "unpaid" },
      { id: "app_paid", patient_id: "p_1", status: "confirmed", payment_status: "paid" },
    ],
  };

  const pool = {
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      const normalizedSql = sql.replace(/\s+/g, " ").trim().toLowerCase();

      // Simulation de l'UPDATE de paiement
      if (normalizedSql.includes("update rendezvous") && normalizedSql.includes("set payment_status = ?")) {
        const [paymentStatus, id] = params as [string, string, string, string]; // params: [status, status_case, confirmed_case, id]
        // Note: Le repository utilise 4 params à cause du CASE WHEN
        const actualId = params![3] as string;
        const actualStatus = params![0] as string;

        const app = state.appointments.find(a => a.id === actualId);
        if (app && app.payment_status !== 'paid') {
          app.payment_status = actualStatus as any;
          if (actualStatus === 'paid') {
            app.status = 'confirmed';
          }
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }

      return [[]];
    }),
  };

  return { pool, state };
});

vi.mock("mysql2/promise", () => ({
  default: { createPool: vi.fn(() => mysqlMocks.pool) },
}));

vi.mock("../../../lib/db/mysql", () => ({
  mysqlPool: mysqlMocks.pool,
}));

describe("Cycle de Paiement (Fake Payment)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset state
    mysqlMocks.state.appointments[0].payment_status = "unpaid";
    mysqlMocks.state.appointments[0].status = "pending";
  });

  describe("Tâche 7.1 : updateAppointmentPaymentStatus", () => {
    it("doit confirmer le rendez-vous quand le paiement est marqué 'paid'", async () => {
      const { updateAppointmentPaymentStatus } = await import("../../../modules/appointments/repository");
      
      const success = await updateAppointmentPaymentStatus("app_pending", "paid");
      
      expect(success).toBe(true);
      expect(mysqlMocks.state.appointments[0].payment_status).toBe("paid");
      expect(mysqlMocks.state.appointments[0].status).toBe("confirmed");
    });

    it("ne doit pas mettre à jour un rendez-vous déjà payé", async () => {
      const { updateAppointmentPaymentStatus } = await import("../../../modules/appointments/repository");
      
      const success = await updateAppointmentPaymentStatus("app_paid", "paid");
      
      expect(success).toBe(false);
    });
  });

  describe("Tâche 7.2 : processFakePayment service", () => {
    it("doit réussir le processus complet de paiement fictif", async () => {
      const { processFakePayment } = await import("../../../modules/payments/service");
      
      const result = await processFakePayment("app_pending");
      
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(mysqlMocks.state.appointments[0].payment_status).toBe("paid");
    });
  });
});
