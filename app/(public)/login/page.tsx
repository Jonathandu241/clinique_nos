/// Page de connexion Clinique NOS.

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { type AuthRole } from "../../../auth";
import { createAuthSession } from "@/lib/auth/session";
import { mysqlPool } from "@/lib/db/mysql";
import type { RowDataPacket } from "mysql2/promise";

// Vérifie un mot de passe avec le hash PBKDF2 stocké en base.
function verifyPassword(password: string, storedHash: string) {
  // Sépare le sel du hash enregistrés dans la même chaîne.
  const [salt, hash] = storedHash.split("$");

  // Refuse les formats de hash incomplets.
  if (!salt || !hash) {
    return false;
  }

  const derived = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");

  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

/// Traite l'envoi du formulaire de connexion.
async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  // Réclame les deux champs obligatoires avant d'interroger la base.
  if (!email || !password) {
    redirect("/login?error=missing");
  }

  // Récupère l'utilisateur correspondant à l'email saisi.
  const [rows] = await mysqlPool.query<(RowDataPacket & {
    id: string;
    email: string;
    role: AuthRole;
    password_hash: string | null;
  })[]>("SELECT id, email, role, password_hash FROM utilisateurs WHERE email = ? LIMIT 1", [email]);

  // Prend le premier résultat car l'email est unique.
  // Prend la première ligne car l'email est unique.
  const user = rows[0];

  // Refuse les comptes inconnus ou incomplets.
  if (!user || !user.password_hash) {
    redirect("/login?error=invalid");
  }

  // Refuse les mauvais mots de passe sans révéler d'information.
  if (!verifyPassword(password, user.password_hash)) {
    redirect("/login?error=invalid");
  }

  await createAuthSession({
    id: user.id,
    email: user.email,
    role: user.role as AuthRole,
  });

  redirect(user.role === "patient" ? "/patient" : "/staff");
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // Affiche un message simple selon le paramètre d'erreur reçu.
  const errorMessage =
    searchParams?.error === "missing"
      ? "Email et mot de passe sont requis."
      : searchParams?.error === "invalid"
        ? "Identifiants invalides."
        : undefined;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
      <div className="mx-auto max-w-md space-y-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-emerald-700">Clinique NOS</p>
          <h1 className="text-3xl font-semibold tracking-tight">Connexion</h1>
          <p className="text-sm text-slate-600">Accedez a votre espace patient ou staff.</p>
        </div>
        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        <form action={loginAction} className="space-y-4">
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
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-emerald-200 focus:ring-4"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-800"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
