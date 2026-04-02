# Task 2 - Schema de donnees Prisma et MySQL Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mettre en place le schema de donnees MySQL/Prisma de la V1, avec une base locale compatible XAMPP, un client Prisma partage, des modeles metier stables et une premiere validation de connexion.

**Architecture:** Cette task pose uniquement la couche data. On garde une architecture monolithique modulaire, avec Prisma comme source de verite pour le schema et l'acces base, un dialecte MySQL strict, et un client partageable cote serveur. Les modeles restent volontairement limites au besoin V1, avec des enums et contraintes suffisants pour verrouiller les flux critiques sans surconstruire.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, MySQL via XAMPP, Node.js LTS, npm, Zod pour les futurs contrats de donnees, tests de validation via scripts et requetes SQL.

---

## Statut attendu avant de commencer

- Le socle applicatif Task 1 est termine.
- Le projet Next.js est a la racine.
- Les scripts `dev`, `build`, `lint`, `typecheck`, `format` existent.
- `components/`, `lib/` et `modules/` sont deja en place.

## Contexte

La Task 2 doit preparer le terrain data pour les tasks metier suivantes:

- auth et roles ;
- disponibilites ;
- reservation ;
- paiement ;
- notifications ;
- audit.

Cette task ne doit pas encore implementer la logique metier complete ni les flux UI fonctionnels au-dela de ce qui est necessaire pour valider le schema et la connexion.

## Principes de decision

- On cible MySQL des maintenant pour eviter une derive de dialecte entre local et production.
- Prisma est le point d'entree unique pour le schema et le client.
- Les modeles doivent rester simples, mais deja assez stricts pour les reservations transactionnelles futures.
- Les relations et contraintes critiques doivent etre exprimees dans le schema, pas seulement dans le code applicatif.
- Les secrets de connexion restent hors du code source via `.env`.

## Ce que la Task 2 doit inclure

- configuration Prisma pour MySQL ;
- schema de donnees initial pour la V1 ;
- client Prisma partage ;
- fichier `.env` et exemple `.env.example` ;
- migration initiale ;
- verification de connexion a la base locale ;
- premiers types utilitaires de domaine si utiles pour le reste du codebase.

## Ce que la Task 2 ne doit pas inclure

- aucune page metier ;
- aucune Server Action metier complete ;
- aucune logique d'auth ;
- aucun provider de paiement ;
- aucune notification ;
- aucun cron ;
- aucune UI de gestion des donnees.

## Hypotheses de travail

- `[hypothese]` XAMPP est disponible localement avec MySQL actif.
- `[hypothese]` La base locale sera creee manuellement ou via script avant la premiere migration.
- `[hypothese]` La V1 utilisera Prisma en mode classique, pas de multi-base ni de read replica.
- `[hypothese]` Les enums de statut sont preferables a des chaines libres.
- `[hypothese]` Les dates seront stockees en UTC.

## Schema cible de la Task 2

### Dossiers et fichiers attendus

```text
prisma/
  schema.prisma
  migrations/
lib/
  db/
    prisma.ts
.env
.env.example
modules/
  utilisateurs/
    types.ts
  auth/
    types.ts
  medecins/
    types.ts
  availability/
    types.ts
  rendezvous/
    types.ts
  payments/
    types.ts
  notifications/
    types.ts
  audit/
    types.ts
```

## Modèle de données V1

### Tables principales

- `utilisateurs`
- `profils_patients`
- `profils_medecins`
- `disponibilites`
- `creneaux_disponibilite`
- `rendezvous`
- `transactions_paiement`
- `evenements_notification`
- `journaux_audit`

### Enums recommandés

- `UserRole`
- `AvailabilityStatus`
- `AvailabilitySlotStatus`
- `AppointmentStatus`
- `PaymentStatus`
- `PaymentTransactionStatus`
- `NotificationChannel`
- `NotificationStatus`
- `AuditAction`

### Correspondance des champs

- `password_hash` -> `mot_de_passe_hash`
- `first_name` -> `prenom`
- `last_name` -> `nom`
- `phone` -> `telephone`
- `created_at` -> `date_creation`
- `updated_at` -> `date_mise_a_jour`
- `user_id` -> `utilisateur_id`
- `specialty` -> `specialite`
- `is_active` -> `actif`
- `date_of_birth` -> `date_naissance`
- `gender` -> `sexe`
- `doctor_id` -> `medecin_id`
- `created_by_user_id` -> `cree_par_utilisateur_id`
- `starts_at` -> `date_debut`
- `ends_at` -> `date_fin`
- `availability_id` -> `disponibilite_id`
- `availability_slot_id` -> `creneau_disponibilite_id`
- `payment_status` -> `etat_paiement`
- `payment_due_at` -> `date_echeance_paiement`
- `booked_at` -> `date_reservation`
- `confirmed_at` -> `date_confirmation`
- `cancelled_at` -> `date_annulation`
- `completed_at` -> `date_fin`
- `cancellation_reason` -> `motif_annulation`
- `notes_internal` -> `notes_internes`
- `appointment_id` -> `rendezvous_id`
- `provider_reference` -> `reference_fournisseur`
- `initiated_at` -> `date_initiation`
- `sent_at` -> `date_envoi`
- `entity_type` -> `type_entite`
- `entity_id` -> `identifiant_entite`
- `actor_user_id` -> `utilisateur_acteur_id`
- `metadata_json` -> `metadonnees_json`

## Contraintes minimales

- un email utilisateur unique ;
- un creneau de disponibilite ne peut etre reserve que par un seul rendez-vous actif ;
- les dates critiques sont indexees ;
- les montants sont en `DECIMAL`, jamais en flottant ;
- les relations metier principales sont explicites et indexees ;
- les suppressions destructrices doivent etre utilisees avec prudence, en preferant les relations et contraintes adaptées.

## Task 2.1: Installer et configurer Prisma

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/migrations/.gitkeep` ou migration initiale via Prisma
- Modify: `package.json`
- Create: `.env`
- Create: `.env.example`

**Step 1: Ajouter les dependances Prisma**

Run:

```bash
npm install @prisma/client
npm install -D prisma
```

Expected:

- Prisma CLI disponible ;
- client Prisma installe ;
- aucun conflit de dependances.

**Step 2: Initialiser le schema Prisma**

Run:

```bash
npx prisma init
```

Expected:

- `prisma/schema.prisma` cree ;
- `.env` referencee ;
- base de configuration Prisma presente.

**Step 3: Configurer MySQL**

Dans `schema.prisma`, definir:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

Expected:

- Prisma pointe vers MySQL ;
- la connexion depend de `DATABASE_URL`.

**Step 4: Ajouter les variables d'environnement**

Dans `.env.example` et `.env`, documenter au minimum:

```txt
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/clinique_nos"
```

Expected:

- la connexion locale est explicite ;
- le futur contributeur sait quoi renseigner.

**Step 5: Verifier la configuration Prisma**

Run:

```bash
npx prisma validate
```

Expected:

- configuration valide ;
- pas d'erreur de schema.

**Step 6: Commit**

```bash
git add prisma/schema.prisma package.json package-lock.json .env.example
git commit -m "chore: initialize prisma mysql foundation"
```

## Task 2.2: Definir le schema metier initial

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Ecrire d'abord le schema minimal complet**

Ajouter les modeles:

```prisma
enum UserRole {
  patient
  doctor
  secretary
  clinic_admin
}

enum AvailabilityStatus {
  active
  inactive
}

enum AvailabilitySlotStatus {
  open
  reserved
  blocked
  expired
}

enum AppointmentStatus {
  pending
  confirmed
  cancelled
  completed
  expired_unpaid
}

enum PaymentStatus {
  unpaid
  due
  paid
  failed
  refunded
}

enum PaymentTransactionStatus {
  initiated
  confirmed
  failed
  cancelled
}

enum NotificationChannel {
  email
  sms
  whatsapp
}

enum NotificationStatus {
  pending
  sent
  failed
}

enum AuditAction {
  create
  confirm
  pay
  cancel
  reschedule
  expire
}
```

Puis les modeles `User`, `PatientProfile`, `DoctorProfile`, `Availability`, `AvailabilitySlot`, `Appointment`, `PaymentTransaction`, `NotificationEvent`, `AuditLog`.

Expected:

- tout le domaine V1 est representable ;
- les enums couvrent les flux critiques.

**Step 2: Ajouter les relations et indexes**

Definir:

- unicite des emails ;
- relations 1:1 entre user et profils metier si requis ;
- indexes sur `date_echeance_paiement`, `statut`, `date_debut` ;
- foreign keys sur les references metier ;
- timestamps `createdAt` / `updatedAt`.

Expected:

- le schema supporte les futures transactions ;
- les recherches principales restent efficaces.

**Step 3: Verifier le schema**

Run:

```bash
npx prisma format
npx prisma validate
```

Expected:

- schema valide ;
- formatage Prisma applique.

**Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: define initial clinique data model"
```

## Task 2.3: Creer le client Prisma partage

**Files:**
- Create: `lib/db/prisma.ts`

**Step 1: Ecrire un singleton Prisma**

Utiliser un pattern compatible Next.js dev pour eviter les multiples instances en hot reload.

Expected:

- une seule instance Prisma en dev ;
- reutilisable dans les services serveur.

**Step 2: Restreindre l'usage cote serveur**

Marquer le fichier comme serveur uniquement si necessaire et eviter toute importation cote client.

Expected:

- pas de fuite dans le bundle client ;
- separation claire des couches.

**Step 3: Verifier le typecheck**

Run:

```bash
npm run typecheck
```

Expected:

- PASS ;
- aucune erreur d'import ou de typage.

**Step 4: Commit**

```bash
git add lib/db/prisma.ts
git commit -m "chore: add shared prisma client"
```

## Task 2.4: Initialiser la base locale MySQL

**Files:**
- Modify: `.env`
- Create: `.env.example`

**Step 1: Creer la base MySQL locale**

Utiliser XAMPP/MySQL pour creer une base nommee `clinique_nos`.

Expected:

- base disponible localement ;
- identifiants connus et documentes.

**Step 2: Renseigner `DATABASE_URL`**

Verifier que la variable pointe bien vers la base locale.

Expected:

- Prisma peut se connecter ;
- aucune ambiguite sur l'environnement.

**Step 3: Tester la connexion**

Run:

```bash
npx prisma db pull
```

ou, si le schema n'est pas encore pousse:

```bash
npx prisma migrate dev --name initial_schema
```

Expected:

- la connexion MySQL fonctionne ;
- la base accepte les migrations.

**Step 4: Commit**

```bash
git add .env.example
git commit -m "docs: document local mysql configuration"
```

## Task 2.5: Ajouter les types de domaine minimum

**Files:**
- Create: `modules/appointments/types.ts`
- Create: `modules/payments/types.ts`
- Create: `modules/notifications/types.ts`
- Create: `modules/audit/types.ts`
- Create: `modules/users/types.ts`
- Create: `modules/auth/types.ts`
- Create: `modules/doctors/types.ts`
- Create: `modules/availability/types.ts`

**Step 1: Definir les types partages**

Ajouter des types simples alignes sur le schema Prisma:

- ids ;
- statuts ;
- DTO de base ;
- valeurs enum reutilisables.

Expected:

- les futurs services n'auront pas a redefinir les memes structures ;
- le domaine reste lisible.

**Step 2: Eviter la logique prematuree**

Ne pas ajouter de repository ni de service metier complet dans cette task.

Expected:

- la Task 2 reste centrée sur le modele et non sur les flux.

**Step 3: Verifier le typecheck**

Run:

```bash
npm run typecheck
```

Expected:

- PASS ;
- types partages coherents.

**Step 4: Commit**

```bash
git add modules/**/types.ts
git commit -m "chore: add initial domain types"
```

## Task 2.6: Valider la migration initiale et la readiness data

**Files:**
- Create: `prisma/migrations/<generated>`
- Modify: `README.md`

**Step 1: Creer la migration initiale**

Run:

```bash
npx prisma migrate dev --name initial_schema
```

Expected:

- migration initiale creee ;
- tables et enums presentes en base ;
- Prisma Client regenere.

**Step 2: Verifier l'etat de la base**

Run:

```bash
npx prisma studio
```

ou une requete de verification equivalente.

Expected:

- les modeles sont visibles ;
- le schema est bien applique.

**Step 3: Documenter le demarrage local**

Mettre a jour le README avec:

- configuration MySQL locale ;
- variable `DATABASE_URL` ;
- commandes Prisma principales.

Expected:

- un nouveau contributeur peut demarrer la base sans deviner.

**Step 4: Verification finale**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected:

- les commandes passent ;
- la couche data n'a pas casse le socle.

**Step 5: Commit**

```bash
git add prisma/migrations README.md
git commit -m "chore: finalize initial database schema"
```

## Definition of Done

- Prisma est configure pour MySQL ;
- le schema V1 est defini ;
- le client Prisma partage existe ;
- la base locale XAMPP est connectee ;
- la migration initiale est appliquee ;
- les types de domaine minimum existent ;
- `lint`, `typecheck` et `build` passent apres la Task 2.

## Risques a surveiller

- installer Prisma sans `.env` correctement configure ;
- oublier la compatibilite MySQL dans les relations ou types ;
- introduire trop de logique metier dans le schema ;
- creer des modeles ou enums inutiles avant les tasks suivantes ;
- ne pas generer de migration propre apres le schema.
