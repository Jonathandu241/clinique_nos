# Clinique V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construire une V1 Next.js pour une seule clinique couvrant authentification, disponibilites, reservation, paiement avant consultation, notifications et annulation automatique pour non-paiement.

**Architecture:** Application Next.js App Router avec logique metier cote serveur via Server Actions et Route Handlers, base MySQL en local via XAMPP, authentification centralisee, et jobs planifies pour rappels et expirations. L'architecture privilegie des modules simples par domaine, des frontieres client minimales et des integrations externes encapsulees derriere des adaptateurs.

**Tech Stack:** Next.js App Router, TypeScript, React Server Components, Server Actions, Route Handlers, MySQL via XAMPP en local, Prisma, NextAuth ou Auth provider equivalent, Zod, Tailwind CSS, shadcn/ui, Vitest, Playwright, Vercel Cron ou cron equivalent, fournisseur de paiement abstrait, fournisseur de notifications abstrait.

---

## 1. Principes techniques de la V1

### Choix d'architecture recommandes

- Utiliser `App Router` par defaut.
- Garder la logique metier et l'acces base de donnees cote serveur.
- Utiliser `Server Actions` pour les mutations declenchees depuis l'UI.
- Utiliser `Route Handlers` uniquement pour:
  - webhooks de paiement ;
  - jobs internes appeles par cron ;
  - endpoints necessitant une interface HTTP stable.
- Eviter une API REST interne complete en V1.
- Isoler les integrations externes derriere des interfaces `payments` et `notifications`.

### Arbitrage principal

Recommandation:

- architecture monolithique modulaire dans un seul projet Next.js.

Tradeoff:

- plus rapide a lancer et a faire evoluer en petite equipe ;
- moins flexible qu'une architecture en microservices, mais largement suffisante pour la V1.

## 2. Architecture cible

### Couches

#### Presentation

- pages App Router
- layouts par espace fonctionnel
- composants UI serveur par defaut
- composants client uniquement pour formulaires, calendrier interactif, etats pending et feedback utilisateur

#### Application

- Server Actions par domaine
- services metier purs
- validations Zod
- policy checks pour auth et permissions

#### Data

- Prisma pour schema, migrations et acces base
- MySQL comme source unique de verite
- transactions pour les reservations et changements critiques
- XAMPP comme environnement local de base de donnees

#### Integrations

- adaptateur paiement
- adaptateur notification
- cron runner
- webhook handler

## 3. Structure de projet proposee

```text
app/
  (public)/
    page.tsx
    login/page.tsx
    register/page.tsx
  (patient)/
    patient/layout.tsx
    patient/dashboard/page.tsx
    patient/appointments/page.tsx
    patient/appointments/[id]/page.tsx
    patient/book/page.tsx
    patient/payments/[appointmentId]/page.tsx
  (staff)/
    staff/layout.tsx
    staff/dashboard/page.tsx
    staff/appointments/page.tsx
    staff/appointments/[id]/page.tsx
    staff/doctors/page.tsx
    staff/availability/page.tsx
  api/
    health/route.ts
    webhooks/payments/route.ts
    cron/payment-reminders/route.ts
    cron/payment-expirations/route.ts
components/
  ui/
  forms/
  appointments/
  availability/
  payments/
  notifications/
lib/
  auth/
  db/
  validation/
  utils/
modules/
  users/
  auth/
  doctors/
  availability/
  appointments/
  payments/
  notifications/
  audit/
prisma/
  schema.prisma
  migrations/
tests/
  unit/
  integration/
  e2e/
```

## 4. Domaines fonctionnels a implementer

### 4.1 Authentification et roles

Roles V1:

- `patient`
- `doctor`
- `secretary`
- `clinic_admin`

Decision:

- un seul modele utilisateur avec role principal ;
- relations metier separees pour `DoctorProfile` et `PatientProfile`.

### 4.2 Disponibilites

- un medecin possede des blocs de disponibilite ;
- les creneaux reservables sont derives ou stockes explicitement selon le niveau de simplicite souhaite.

Recommendation V1:

- stocker des `availability_slots` explicites plutot que recalculer dynamiquement a chaque requete.

Tradeoff:

- plus de donnees a gerer ;
- logique de reservation et de verrouillage beaucoup plus simple.

### 4.3 Rendez-vous

- un rendez-vous reference un patient, un medecin et un creneau ;
- il porte un statut et un statut de paiement ;
- il conserve les dates critiques et un minimum de trace.

### 4.4 Paiement

- le module calcul l'echeance ;
- cree une tentative de paiement ;
- met a jour le rendez-vous apres confirmation webhook ;
- annule automatiquement si l'echeance est depassee.

### 4.5 Notifications

- notifications transactionnelles synchrones pour les evenements critiques ;
- rappels et expirations via cron.

### 4.6 Audit

- journaliser au minimum creation, confirmation, paiement, annulation, reprogrammation et expiration.

## 5. Modele de donnees recommande

### Contexte de stockage

- En local, la base sera exposee par XAMPP.
- Prisma devra utiliser un `provider = "mysql"` dans `schema.prisma`.
- La connexion applicative passera par `DATABASE_URL`.
- Recommendation: garder une compatibilite MySQL stricte des maintenant pour eviter une derive entre local et production.

### Tables principales

- `users`
- `patient_profiles`
- `doctor_profiles`
- `availabilities`
- `availability_slots`
- `appointments`
- `payment_transactions`
- `notification_events`
- `audit_logs`

### Schema logique minimal

#### `users`

- `id`
- `email`
- `password_hash` ou identifiant fournisseur auth
- `role`
- `first_name`
- `last_name`
- `phone`
- `created_at`
- `updated_at`

#### `doctor_profiles`

- `id`
- `user_id`
- `specialty` `[hypothese]`
- `is_active`

#### `patient_profiles`

- `id`
- `user_id`
- `date_of_birth` `[hypothese]`
- `gender` `[hypothese]`

#### `availabilities`

- `id`
- `doctor_id`
- `created_by_user_id`
- `starts_at`
- `ends_at`
- `source`
- `status`

#### `availability_slots`

- `id`
- `availability_id`
- `doctor_id`
- `starts_at`
- `ends_at`
- `status` (`open`, `reserved`, `blocked`, `expired`)

#### `appointments`

- `id`
- `patient_id`
- `doctor_id`
- `availability_slot_id`
- `status` (`pending`, `confirmed`, `cancelled`, `completed`, `expired_unpaid`)
- `payment_status` (`unpaid`, `due`, `paid`, `failed`, `refunded`)
- `payment_due_at`
- `booked_at`
- `confirmed_at`
- `cancelled_at`
- `completed_at`
- `cancellation_reason`
- `notes_internal` `[hypothese]`

#### `payment_transactions`

- `id`
- `appointment_id`
- `provider`
- `provider_reference`
- `amount`
- `currency`
- `status`
- `initiated_at`
- `confirmed_at`
- `payload_json`

#### `notification_events`

- `id`
- `appointment_id`
- `channel`
- `template`
- `recipient`
- `status`
- `sent_at`
- `provider_reference`

#### `audit_logs`

- `id`
- `entity_type`
- `entity_id`
- `action`
- `actor_user_id`
- `metadata_json`
- `created_at`

### Contraintes critiques

- unicite sur un slot reserve par un seul rendez-vous actif ;
- transactions obligatoires lors de la reservation ;
- index sur `appointments.payment_due_at`, `appointments.status`, `availability_slots.starts_at` ;
- dates stockees en UTC ;
- montants stockes en `DECIMAL`, jamais en flottants.

## 6. Flux techniques critiques

### 6.1 Reservation d'un creneau

1. Charger les slots `open`.
2. Soumettre le formulaire de reservation.
3. Valider l'entree avec Zod.
4. Verifier la session patient.
5. Ouvrir une transaction base:
   - relire le slot ;
   - verifier qu'il est toujours `open` ;
   - creer le rendez-vous ;
   - passer le slot en `reserved`.
6. Calculer `payment_due_at`.
7. Ecrire l'audit log.
8. Declencher les notifications.
9. Revalider la page patient et la vue staff.

### 6.2 Paiement

1. Le patient ouvre la page de paiement.
2. Le serveur cree une intention de paiement chez le fournisseur.
3. Le patient finalise le paiement.
4. Le fournisseur appelle le webhook.
5. Le webhook verifie signature et idempotence.
6. Le systeme passe le `payment_status` a `paid`.
7. Le rendez-vous reste actif.
8. Le systeme journalise et notifie.

### 6.3 Expiration automatique pour non-paiement

1. Un job cron appelle `app/api/cron/payment-expirations/route.ts`.
2. Le handler verifie un secret interne.
3. Il charge les rendez-vous dus et non payes.
4. Pour chaque rendez-vous:
   - verifier statut actuel ;
   - passer le rendez-vous en `expired_unpaid` ;
   - liberer le slot ;
   - ecrire audit ;
   - envoyer notification.

### 6.4 Rappels de paiement

1. Un job cron appelle `app/api/cron/payment-reminders/route.ts`.
2. Le handler selectionne les rendez-vous proches de l'echeance.
3. Il dedoublonne les rappels deja envoyes.
4. Il envoie la notification appropriee.

## 7. Choix UX et routage

### Espaces

- espace public: accueil, connexion, inscription
- espace patient: dashboard, reservation, detail rendez-vous, paiement
- espace staff: dashboard, rendez-vous, disponibilites, medecins

### Route groups recommandes

- `app/(public)/...`
- `app/(patient)/patient/...`
- `app/(staff)/staff/...`

### Components

Server Components par defaut pour:

- tableaux de bord ;
- listes de rendez-vous ;
- details ;
- recuperation de donnees.

Client Components uniquement pour:

- selecteurs de date/heure ;
- formulaires interactifs ;
- retours utilisateur temps reel ;
- dialogues de confirmation.

## 8. Securite et controle d'acces

### Regles minimales

- authentification obligatoire pour tous les espaces prives ;
- controle de role a l'entree des layouts staff et patient ;
- verification d'autorisation dans chaque Server Action et Route Handler ;
- validation Zod systematique de toute entree ;
- verification de signature pour les webhooks ;
- secret interne pour les routes cron ;
- modules sensibles marques `server-only`.

### Risques a couvrir

- un patient ne doit voir que ses rendez-vous ;
- un medecin ne doit voir que ses rendez-vous et disponibilites ;
- un secretaire peut voir les rendez-vous de la clinique ;
- aucune logique de droits ne doit reposer uniquement sur l'UI ;
- aucune cle de paiement ou secret fournisseur ne doit fuiter au client.

## 9. Strategie de test

### Unitaires

- calcul d'echeance de paiement ;
- transitions de statuts ;
- regles d'autorisation ;
- dedoublonnage de rappels ;
- adaptation des payloads fournisseurs.

### Integration

- reservation transactionnelle d'un slot ;
- paiement confirme via webhook ;
- expiration automatique libere le slot ;
- reprogrammation conserve la coherence rendez-vous/slot.

### E2E

- inscription patient puis reservation ;
- connexion staff puis consultation du planning ;
- paiement reussi ;
- chemin de non-paiement jusqu'a expiration. `[hypothese]`

### Outils recommandes

- Vitest pour unitaires et integration legere ;
- Playwright pour E2E ;
- base MySQL de test separee, distincte de la base XAMPP de developpement. `[hypothese]`

## 10. Observabilite et exploitation

### Logs

- reservation creee
- paiement initie
- webhook recu
- rappel envoye
- expiration automatique executee
- erreur de permission

### Monitoring minimal

- nombre de rendez-vous crees par jour ;
- nombre de paiements confirmes ;
- nombre d'expirations automatiques ;
- erreurs webhook ;
- erreurs cron.

## 11. Decisions techniques encore ouvertes

- fournisseur d'auth exact ;
- fournisseur de paiement exact ;
- canal de notification prioritaire ;
- mode d'hebergement cible ;
- format exact des disponibilites ;
- niveau de reporting admin attendu en V1.

## 12. Plan d'implementation recommande

### Task 1: Initialiser le socle applicatif

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/(public)/page.tsx`
- Create: `components/ui/`

**Steps:**

1. Initialiser une application Next.js App Router TypeScript.
2. Installer le socle UI minimal.
3. Ajouter le layout racine et la page d'accueil.
4. Configurer lint, format et scripts.
5. Verifier qu'un build vide fonctionne.

### Task 2: Poser le schema de donnees

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/migrations/`
- Create: `lib/db/prisma.ts`
- Create: `.env`
- Create: `.env.example`
- Create: `modules/appointments/types.ts`

**Steps:**

1. Configurer Prisma avec `provider = "mysql"`.
2. Definir les modeles Prisma.
3. Ajouter les enums de statuts.
4. Creer la base locale dans XAMPP et renseigner `DATABASE_URL`.
5. Creer la premiere migration.
6. Exposer le client Prisma partage.
7. Verifier la creation de la base locale.

### Task 3: Mettre en place l'authentification et le RBAC

**Files:**
- Create: `auth.ts`
- Create: `lib/auth/session.ts`
- Create: `lib/auth/permissions.ts`
- Create: `app/(public)/login/page.tsx`
- Create: `app/(public)/register/page.tsx`
- Create: `app/(patient)/patient/layout.tsx`
- Create: `app/(staff)/staff/layout.tsx`

**Steps:**

1. Choisir le provider d'auth.
2. Implementer login et inscription.
3. Proteger les layouts patient et staff.
4. Ajouter les helpers `requireRole` et `requireAuth`.
5. Ecrire des tests de permissions.

### Task 4: Implementer la gestion des disponibilites

**Files:**
- Create: `modules/availability/repository.ts`
- Create: `modules/availability/service.ts`
- Create: `modules/availability/actions.ts`
- Create: `lib/validation/availability.ts`
- Create: `app/(staff)/staff/availability/page.tsx`
- Create: `components/availability/availability-form.tsx`

**Steps:**

1. Definir les DTO et validations.
2. Creer la logique de generation de slots.
3. Ajouter la page staff de gestion des disponibilites.
4. Ecrire les tests unitaires de generation.
5. Ecrire un test d'integration de creation de disponibilite.

### Task 5: Implementer la reservation patient

**Files:**
- Create: `modules/appointments/repository.ts`
- Create: `modules/appointments/service.ts`
- Create: `modules/appointments/actions.ts`
- Create: `lib/validation/appointments.ts`
- Create: `app/(patient)/patient/book/page.tsx`
- Create: `components/appointments/booking-form.tsx`

**Steps:**

1. Lire les slots ouverts cote serveur.
2. Ajouter le formulaire de reservation.
3. Ecrire la transaction de reservation.
4. Calculer `payment_due_at`.
5. Revalider les vues impactees.
6. Tester le conflit de reservation.

### Task 6: Construire les espaces de suivi patient et staff

**Files:**
- Create: `app/(patient)/patient/dashboard/page.tsx`
- Create: `app/(patient)/patient/appointments/page.tsx`
- Create: `app/(patient)/patient/appointments/[id]/page.tsx`
- Create: `app/(staff)/staff/dashboard/page.tsx`
- Create: `app/(staff)/staff/appointments/page.tsx`
- Create: `app/(staff)/staff/appointments/[id]/page.tsx`
- Create: `components/appointments/appointment-status-badge.tsx`

**Steps:**

1. Construire les listes et details cote serveur.
2. Filtrer selon le role.
3. Ajouter les badges de statuts.
4. Ajouter actions staff de base.
5. Tester les droits de lecture.

### Task 7: Integrer le paiement

**Files:**
- Create: `modules/payments/provider.ts`
- Create: `modules/payments/service.ts`
- Create: `modules/payments/actions.ts`
- Create: `app/(patient)/patient/payments/[appointmentId]/page.tsx`
- Create: `app/api/webhooks/payments/route.ts`

**Steps:**

1. Definir l'interface fournisseur.
2. Implementer un premier fournisseur de paiement.
3. Ajouter la page de paiement patient.
4. Ajouter le webhook de confirmation.
5. Tester idempotence et securite du webhook.

### Task 8: Integrer les notifications

**Files:**
- Create: `modules/notifications/provider.ts`
- Create: `modules/notifications/service.ts`
- Create: `modules/notifications/templates.ts`
- Create: `modules/notifications/events.ts`

**Steps:**

1. Definir l'interface fournisseur notification.
2. Implementer les templates transactionnels.
3. Appeler les notifications depuis les evenements metier.
4. Journaliser les envois.
5. Tester les dedoublonnages critiques.

### Task 9: Ajouter les jobs cron pour rappels et expirations

**Files:**
- Create: `app/api/cron/payment-reminders/route.ts`
- Create: `app/api/cron/payment-expirations/route.ts`
- Create: `modules/payments/jobs.ts`
- Create: `lib/utils/cron-auth.ts`

**Steps:**

1. Implementer les handlers cron securises.
2. Ajouter la selection des rendez-vous concernes.
3. Implementer les expirations transactionnelles.
4. Implementer les rappels dedoublonnes.
5. Ajouter les tests d'integration correspondants.

### Task 10: Ajouter annulation et reprogrammation staff

**Files:**
- Create: `modules/appointments/policies.ts`
- Modify: `modules/appointments/service.ts`
- Modify: `modules/appointments/actions.ts`
- Modify: `app/(staff)/staff/appointments/[id]/page.tsx`
- Create: `components/appointments/reschedule-form.tsx`

**Steps:**

1. Ajouter les transitions metier autorisees.
2. Implementer annulation staff.
3. Implementer reprogrammation staff.
4. Mettre a jour slot et audit.
5. Notifier patient et equipe si necessaire.

### Task 11: Ajouter audit et observabilite minimale

**Files:**
- Create: `modules/audit/service.ts`
- Create: `modules/audit/repository.ts`
- Create: `lib/utils/logger.ts`
- Modify: modules relies on creation of key hooks across appointments, payments, notifications

**Steps:**

1. Centraliser l'ecriture des audit logs.
2. Logger les evenements critiques.
3. Ajouter un endpoint `health`.
4. Verifier les traces dans les flux critiques.

### Task 12: Mettre en place les tests E2E et la readiness production

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/patient-booking.spec.ts`
- Create: `tests/e2e/staff-operations.spec.ts`
- Create: `tests/e2e/payment-expiration.spec.ts`
- Create: `.env.example`
- Create: `README.md`

**Steps:**

1. Configurer Playwright.
2. Ecrire les scenarii critiques.
3. Documenter variables d'environnement et scripts.
4. Ajouter la checklist de deploiement.
5. Verifier un run complet pre-release.

## 13. Ordre de livraison recommande

### Sprint 0

- socle Next.js
- schema MySQL
- auth et roles

### Sprint 1

- disponibilites
- reservation
- dashboards basiques

### Sprint 2

- paiement
- webhook
- notifications

### Sprint 3

- rappels
- expiration automatique
- reprogrammation staff
- tests E2E

## 14. Definition of Done V1

- un patient peut creer un compte, reserver et payer ;
- un secretaire peut suivre, annuler et reprogrammer ;
- un medecin peut consulter ses rendez-vous et ses disponibilites ;
- un rendez-vous non paye expire automatiquement ;
- les notifications critiques sont envoyees ;
- les tests critiques passent ;
- le systeme produit des logs exploitables en cas d'incident.

## 15. Note environnement

- XAMPP est retenu pour le developpement local.
- Le plan ne suppose pas que XAMPP sera utilise en production.
- La production devra reutiliser le meme schema Prisma et le meme dialecte MySQL, avec une configuration separee, sauvegardes, supervision et secrets dedies.
