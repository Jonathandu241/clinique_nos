import { describe, expect, it } from "vitest";
import { canCancel, canReschedule } from "../../../modules/appointments/policies";

describe("Appointment Policies", () => {
  it("doit autoriser l'annulation d'un rdv en attente ou confirmé", () => {
    expect(canCancel("pending")).toBe(true);
    expect(canCancel("confirmed")).toBe(true);
  });

  it("doit refuser l'annulation d'un rdv déjà terminé ou expiré", () => {
    expect(canCancel("completed")).toBe(false);
    expect(canCancel("expired_unpaid")).toBe(false);
  });

  it("doit autoriser la reprogrammation uniquement pour les rdv actifs", () => {
    // Note: Dans les types actuels, nous devrions aussi avoir 'cancelled_by_staff' etc.
    // Pour l'instant on teste la logique de base.
    expect(canReschedule("confirmed")).toBe(true);
    expect(canReschedule("completed")).toBe(false);
  });
});
