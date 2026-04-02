/// Layout protege pour l'espace patient.

import type { ReactNode } from "react";
import { requirePatientAccess } from "@/lib/auth/permissions";

export default async function PatientLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Verifie l'acces avant de rendre l'espace patient.
  await requirePatientAccess();

  // Rend uniquement le contenu autorise.
  return <>{children}</>;
}
