/// Page d'inscription Clinique NOS.

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { type AuthRole } from "../../../auth";
import { createAuthSession } from "@/lib/auth/session";
import { mysqlPool } from "@/lib/db/mysql";
import type { RowDataPacket } from "mysql2/promise";

// Hache un mot de passe avec un sel unique avant stockage.
function hashPassword(password: string) {
  // Génère un sel aléatoire pour renforcer le hash.
  const salt = crypto.randomBytes(16).toString("hex");
  // Dérive un hash PBKDF2 robuste pour le stockage.
  const derived = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");

  // Conserve le sel et le hash dans une seule chaîne simple.
  return `${salt}$${derived}`;
}

/// Traite l'inscription d'un nouvel utilisateur.
async function registerAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  // Récupère le rôle demandé, avec patient par défaut.
  const role = String(formData.get("role") ?? "patient") as AuthRole;

  // Bloque les inscriptions incomplètes avant toute écriture.
  if (!email || !password || !firstName || !lastName) {
    redirect("/register?error=missing");
  }

  // Valide le rôle choisi côté serveur.
  if (!["patient", "doctor", "secretary", "clinic_admin"].includes(role)) {
    redirect("/register?error=role");
  }

  // Vérifie qu'aucun utilisateur n'existe déjà avec cet email.
  const [existingRows] = await mysqlPool.query<(RowDataPacket & { id: string })[]>(
    "SELECT id FROM utilisateurs WHERE email = ? LIMIT 1",
    [email],
  );

  if (existingRows.length > 0) {
    redirect("/register?error=duplicate");
  }

  // Génère l'identifiant avant l'insertion pour rester explicite.
  const userId = crypto.randomUUID();
  // Hache le mot de passe avant stockage en base.
  const hashedPassword = hashPassword(password);

  await mysqlPool.execute(
    "INSERT INTO utilisateurs (id, email, password_hash, role, first_name, last_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
    [userId, email, hashedPassword, role, firstName, lastName],
  );

  await createAuthSession({
    id: userId,
    email,
    role,
  });

  redirect(role === "patient" ? "/patient" : "/staff");
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // Affiche un message simple selon le paramètre d'erreur reçu.
  const errorMessage =
    searchParams?.error === "missing"
      ? "Tous les champs obligatoires doivent etre renseignes."
      : searchParams?.error === "role"
        ? "Role invalide."
        : searchParams?.error === "duplicate"
          ? "Un compte existe deja avec cet email."
          : undefined;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
      <div className="mx-auto max-w-md space-y-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-emerald-700">Clinique NOS</p>
          <h1 className="text-3xl font-semibold tracking-tight">Inscription</h1>
          <p className="text-sm text-slate-600">Creer un compte patient ou staff pour la V1.</p>
        </div>
        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        <form action={registerAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Prenom</span>
              <input
                name="firstName"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-emerald-200 focus:ring-4"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Nom</span>
              <input
                name="lastName"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-emerald-200 focus:ring-4"
              />
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-emerald-200 focus:ring-4"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Mot de passe</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-emerald-200 focus:ring-4"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Role</span>
            <select
              name="role"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-emerald-200 focus:ring-4"
              defaultValue="patient"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Medecin</option>
              <option value="secretary">Secretaire</option>
              <option value="clinic_admin">Administrateur</option>
            </select>
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-800"
          >
            Creer le compte
          </button>
        </form>
      </div>
    </main>
  );
}
