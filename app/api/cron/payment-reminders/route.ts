/// Endpoint sécurisé pour déclencher l'envoi de rappels de paiement.

import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/utils/cron-auth";
import { sendPaymentReminders } from "@/modules/payments/jobs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Vérification de l'autorisation
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Exécution du job
    const result = await sendPaymentReminders();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CRON_API] Erreur fatale :", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
