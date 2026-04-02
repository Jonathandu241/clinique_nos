/// Layout protege pour l'espace staff.

import type { ReactNode } from "react";
import { requireStaffAccess } from "@/lib/auth/permissions";

export default async function StaffLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireStaffAccess();

  return <>{children}</>;
}
