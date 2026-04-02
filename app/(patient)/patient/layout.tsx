/// Layout protege pour l'espace patient.

import type { ReactNode } from "react";
import { requirePatientAccess } from "@/lib/auth/permissions";

export default async function PatientLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requirePatientAccess();

  return <>{children}</>;
}
