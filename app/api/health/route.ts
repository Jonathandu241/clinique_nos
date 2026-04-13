/// Endpoint de santé pour monitorer l'application et la base de données.

import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db/mysql";

export async function GET() {
  try {
    // 1. Vérifie la connexion à la base de données
    const [rows] = await mysqlPool.query("SELECT 1 as status");
    
    if (!(rows as any)[0] || (rows as any)[0].status !== 1) {
      throw new Error("Base de données non réactive");
    }

    return NextResponse.json({
      status: "UP",
      timestamp: new Date().toISOString(),
      services: {
        database: "CONNECTED",
        api: "HEALTHY"
      }
    }, { status: 200 });

  } catch (error) {
    console.error("[HEALTH_CHECK_ERROR]", error);
    
    return NextResponse.json({
      status: "DOWN",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 503 });
  }
}
