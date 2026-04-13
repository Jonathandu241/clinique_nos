/// Endpoint sécurisé pour déclencher l'expiration des rendez-vous impayés.

import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/utils/cron-auth";
import { processExpiredAppointments } from "@/modules/payments/jobs";

// On force l'exécution dynamique pour les routes API cron
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Vérification de l'autorisation
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Exécution du job
    const result = await processExpiredAppointments();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CRON_API] Erreur fatale :", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
