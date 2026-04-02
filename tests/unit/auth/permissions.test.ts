/// Tests unitaires des permissions Clinique NOS.

import { describe, expect, it } from "vitest";
import { hasRole } from "../../../lib/auth/permissions";

describe("hasRole", () => {
  it("autorise un role present", () => {
    expect(hasRole("patient", ["patient", "doctor"])).toBe(true);
  });

  it("refuse un role absent", () => {
    expect(hasRole("patient", ["doctor"])).toBe(false);
  });
});
