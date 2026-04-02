/// Acces SQL direct minimal pour les besoins d'authentification.

import mysql from "mysql2/promise";

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL manquante.");
  }

  return databaseUrl;
}

/// Cree un pool MySQL partage pour les operations simples.
export const mysqlPool = mysql.createPool(getDatabaseUrl());
