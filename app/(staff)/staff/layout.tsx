/// Layout protege pour l'espace staff.

import type { ReactNode } from "react";
import { requireStaffAccess } from "@/lib/auth/permissions";

export default async function StaffLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Verifie l'acces staff avant d'afficher le layout.
  await requireStaffAccess();

  // Rend uniquement le contenu accessible au staff.
  return <>{children}</>;
}
