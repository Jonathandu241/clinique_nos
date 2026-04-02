import { describe, expect, it } from "vitest";
import { buildAvailabilityDraft, generateAvailabilitySlots } from "../../../modules/availability/service";

describe("generateAvailabilitySlots", () => {
  it("genere des creneaux consecutifs sans chevauchement", () => {
    const slots = generateAvailabilitySlots({
      doctorId: "doctor_1",
      startsAt: new Date("2026-04-03T08:00:00.000Z"),
      endsAt: new Date("2026-04-03T10:00:00.000Z"),
      slotDurationMinutes: 30,
      source: "staff_manual",
      status: "active",
    });

    expect(slots).toHaveLength(4);
    expect(slots[0]).toMatchObject({
      startsAt: new Date("2026-04-03T08:00:00.000Z"),
      endsAt: new Date("2026-04-03T08:30:00.000Z"),
      status: "open",
    });
    expect(slots[3]).toMatchObject({
      startsAt: new Date("2026-04-03T09:30:00.000Z"),
      endsAt: new Date("2026-04-03T10:00:00.000Z"),
      status: "open",
    });
  });

  it("refuse une plage trop courte pour creer un creneau", () => {
    expect(() =>
      generateAvailabilitySlots({
        doctorId: "doctor_1",
        startsAt: new Date("2026-04-03T08:00:00.000Z"),
        endsAt: new Date("2026-04-03T08:10:00.000Z"),
        slotDurationMinutes: 30,
        source: "staff_manual",
        status: "active",
      }),
    ).toThrow("La plage ne permet pas de generer de creneau.");
  });

  it("refuse une plage dont la fin precede le debut", () => {
    expect(() =>
      generateAvailabilitySlots({
        doctorId: "doctor_1",
        startsAt: new Date("2026-04-03T10:00:00.000Z"),
        endsAt: new Date("2026-04-03T08:00:00.000Z"),
        slotDurationMinutes: 30,
        source: "staff_manual",
        status: "active",
      }),
    ).toThrow("La plage de disponibilite est invalide.");
  });

  it("refuse une duree de creneau en dehors des bornes V1", () => {
    expect(() =>
      generateAvailabilitySlots({
        doctorId: "doctor_1",
        startsAt: new Date("2026-04-03T08:00:00.000Z"),
        endsAt: new Date("2026-04-03T10:00:00.000Z"),
        slotDurationMinutes: 10,
        source: "staff_manual",
        status: "active",
      }),
    ).toThrow("La duree du creneau est invalide.");
  });
});

describe("buildAvailabilityDraft", () => {
  it("prepare la disponibilite et ses creneaux", () => {
    const draft = buildAvailabilityDraft({
      doctorId: "doctor_1",
      startsAt: new Date("2026-04-03T08:00:00.000Z"),
      endsAt: new Date("2026-04-03T09:00:00.000Z"),
      slotDurationMinutes: 30,
      source: "staff_manual",
      status: "active",
    });

    expect(draft.availability.doctorId).toBe("doctor_1");
    expect(draft.availability.source).toBe("staff_manual");
    expect(draft.slots).toHaveLength(2);
  });

  it("normalise la source vide avant de generer les creneaux", () => {
    const draft = buildAvailabilityDraft({
      doctorId: "doctor_1",
      startsAt: new Date("2026-04-03T08:00:00.000Z"),
      endsAt: new Date("2026-04-03T09:00:00.000Z"),
      slotDurationMinutes: 30,
      source: "   ",
      status: "active",
    });

    expect(draft.availability.source).toBeUndefined();
    expect(draft.slots).toHaveLength(2);
  });
});
