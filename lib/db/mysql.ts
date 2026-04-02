/// Acces SQL direct minimal pour les besoins d'authentification.

import mysql from "mysql2/promise";

function getDatabaseUrl() {
  // Récupère l'URL de connexion fournie par l'environnement.
  const databaseUrl = process.env.DATABASE_URL;

  // Bloque le démarrage si la base n'est pas configurée.
  if (!databaseUrl) {
    throw new Error("DATABASE_URL manquante.");
  }

  return databaseUrl;
}

/// Cree un pool MySQL partage pour les operations simples.
export const mysqlPool = mysql.createPool(getDatabaseUrl());
