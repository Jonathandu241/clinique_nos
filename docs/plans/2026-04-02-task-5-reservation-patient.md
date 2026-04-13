# Task 5 - Reservation Patient Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permettre a un patient de reserver un creneau disponible avec une transaction serveur simple, coherente et protege.

**Architecture:** Cette task relie le module des disponibilites a la reservation patient. On garde la logique de reservation cote serveur, avec validations strictes, verrouillage transactionnel et acces base encapsule. L'objectif est d'assurer qu'un seul patient reserve un creneau donne, sans introduire encore le paiement, les notifications ou les jobs automatiques.

**Tech Stack:** Next.js App Router, TypeScript, React Server Components, Server Actions, Prisma ou acces SQL deja etabli, Zod, Vitest, composants UI existants, Tailwind CSS.

---

## Statut attendu avant de commencer

- La Task 1 est terminee.
- La Task 2 est terminee.
- La Task 3 est terminee.
- La Task 4 est terminee.
- La base MySQL locale est disponible et synchronisee.
- Les disponibilites et leurs creneaux sont persistes en base.
- L'espace patient est protege par authentification et RBAC.

## Contexte

La Task 5 doit permettre au patient de choisir un creneau ouvert, de lancer une reservation et de creer un rendez-vous avec un statut initial cohérent. Elle doit reposer sur les creneaux generes a la Task 4 et sur les regles du schema deja en place. Cette task ne doit pas encore traiter le paiement ni les notifications.

## Principes de decision

- Garder la reservation totalement cote serveur.
- Utiliser une transaction base pour eviter les doubles reservations.
- Verifier le creneau juste avant insertion, pas seulement dans l'UI.
- Isoler les validations dans `lib/validation/appointments.ts`.
- Encapsuler l'acces SQL dans un repository ou un service fin.
- Garder la page patient simple et orientee action.
- Faire en sorte que la logique de conflit soit testable et explicite.

## Ce que la Task 5 doit inclure

- un module de validation des reservations ;
- un repository ou service pour lire les creneaux ouverts ;
- une logique transactionnelle de creation de rendez-vous ;
- une page patient de reservation ;
- un formulaire UI de reservation ;
- des tests unitaires sur la logique de conflit ;
- un test d'integration de reservation transactionnelle.

## Ce que la Task 5 ne doit pas inclure

- pas de paiement ;
- pas de webhook ;
- pas de notifications ;
- pas de cron ;
- pas de dashboard complet ;
- pas de reprogrammation ;
- pas de logique admin avancee.

## Hypotheses de travail

- `[hypothese]` Un patient reserve un creneau ouvert unique.
- `[hypothese]` La reservation cree un rendez-vous avec statut initial `pending`.
- `[hypothese]` Le statut de paiement initial reste `unpaid` ou `due` selon la regle retenue.
- `[hypothese]` Le creneau passe en `reserved` des que la transaction est validee.
- `[hypothese]` Une reservation doit calculer une echeance de paiement plus tard utile pour la Task 7.

## Structure cible de la Task 5

```text
modules/
  appointments/
    repository.ts
    service.ts
    actions.ts
lib/
  validation/
    appointments.ts
app/
  (patient)/
    patient/
      book/page.tsx
components/
  appointments/
    booking-form.tsx
tests/
  unit/
    appointments/
  integration/
    appointments/
```

## Regles metier V1

- un rendez-vous reference un patient, un medecin et un creneau ;
- un creneau ne peut etre reserve qu'une seule fois ;
- la reservation doit etre atomique ;
- un creneau deja reserve doit etre refuse avec un message clair ;
- une reservation invalide ne doit laisser aucune donnees partielle ;
- le patient ne doit voir que les creneaux ouverts pertinents.

## Decision recommandee

Recommendation:

- exposer une fonction de reservation purement metier dans le service ;
- garder les requetes SQL dans un repository ;
- utiliser une Server Action pour lier le formulaire au service ;
- rendre le formulaire minimal, avec seulement les champs utiles.

Tradeoff:

- un peu plus de separation entre fichiers ;
- beaucoup plus de securite et de lisibilite pour les flux critiques.

## Task 5.1: Definir les validations et le contrat de reservation

**Files:**
- Create: `lib/validation/appointments.ts`
- Modify: `modules/appointments/service.ts`
- Modify: `modules/appointments/actions.ts`

**Step 1: Definir le DTO de reservation**

Precisier les champs attendus, par exemple:

- `patientId`
- `doctorId`
- `availabilitySlotId`
- `notes` ou `motif` si necessaire en V1

Expected:

- contrat unique pour la reservation ;
- pas de confusion entre creneau, disponibilite et rendez-vous.

**Step 2: Ecrire les schemas Zod**

Ajouter les regles minimales:

- identifiants obligatoires ;
- champs texte limites ;
- valeurs non vides ;
- format exploitable pour le serveur.

Expected:

- les entrees invalides sont rejetees avant la transaction ;
- les messages restent simples.

**Step 3: Verifier le typecheck**

Run:

```bash
npm run typecheck
```

Expected:

- PASS ;
- contrats de reservation coherents.

**Step 4: Commit**

```bash
git add lib/validation/appointments.ts modules/appointments/service.ts modules/appointments/actions.ts
git commit -m "feat: add appointment reservation contract"
```

## Task 5.2: Creer le repository de reservation

**Files:**
- Create: `modules/appointments/repository.ts`

**Step 1: Definir les lectures utiles**

Ajouter au minimum:

- lecture d'un creneau par id ;
- lecture des creneaux ouverts ;
- lecture d'un rendez-vous par id ;
- lecture des rendez-vous d'un patient si utile pour la page de confirmation.

Expected:

- le repository expose le strict necessaire au flux patient.

**Step 2: Definir les ecritures transactionnelles**

Ajouter au minimum:

- creation du rendez-vous ;
- passage du creneau en `reserved` ;
- eventuelle lecture verrouillee du creneau dans la transaction.

Expected:

- le repository reste fin ;
- la logique de conflit reste exploitable par le service.

**Step 3: Verifier lint et typecheck**

Run:

```bash
npm run lint
npm run typecheck
```

Expected:

- PASS ;
- repository propre et typé.

**Step 4: Commit**

```bash
git add modules/appointments/repository.ts
git commit -m "feat: add appointment repository"
```

## Task 5.3: Implementer la reservation transactionnelle dans le service

**Files:**
- Create: `modules/appointments/service.ts`

**Step 1: Ecrire la fonction de reservation**

Construire une fonction qui:

- valide le creneau ;
- relit le creneau en transaction ;
- refuse si le creneau n'est plus ouvert ;
- cree le rendez-vous ;
- reserve le creneau ;
- retourne le rendez-vous cree.

Expected:

- une seule source de verite ;
- pas de double reservation possible dans le flux normal.

**Step 2: Ajouter les garde-fous metier**

Refuser:

- un creneau inexistant ;
- un creneau deja reserve ;
- un patient non autorise ;
- un medecin ou creneau incoherent ;
- une reservation sans identifiant valide.

Expected:

- les erreurs de conflit sont explicites ;
- la transaction reste saine.

**Step 3: Ecrire les tests unitaires**

Run:

```bash
npm run test -- --run tests/unit/appointments
```

Expected:

- les conflits de reservation sont couverts ;
- la logique transactionnelle est testable.

**Step 4: Commit**

```bash
git add modules/appointments/service.ts tests/unit/appointments
git commit -m "feat: add appointment reservation service"
```

## Task 5.4: Ajouter l'action serveur de reservation

**Files:**
- Create: `modules/appointments/actions.ts`

**Step 1: Ecrire l'action de reservation**

L'action doit:

- verifier l'acces patient ;
- valider l'entree ;
- appeler le service ;
- renvoyer un etat exploitable par l'UI.

Expected:

- mutation serveur simple ;
- aucune logique critique cote client.

**Step 2: Gérer les erreurs**

Prevoir:

- conflit de creneau ;
- validation ;
- refus d'acces ;
- erreur technique minimale.

Expected:

- messages clairs ;
- page patient simple a brancher.

**Step 3: Verifier lint et typecheck**

Run:

```bash
npm run lint
npm run typecheck
```

Expected:

- PASS ;
- action serveur stable.

**Step 4: Commit**

```bash
git add modules/appointments/actions.ts
git commit -m "feat: add appointment reservation action"
```

## Task 5.5: Construire la page patient de reservation

**Files:**
- Create: `app/(patient)/patient/book/page.tsx`
- Modify: `app/(patient)/patient/layout.tsx`

**Step 1: Afficher les creneaux ouverts**

La page doit charger les creneaux disponibles pour le patient.

Expected:

- liste claire des creneaux reservables ;
- tri lisible par date et heure.

**Step 2: Brancher le formulaire de reservation**

Utiliser le composant de reservation pour envoyer l'action serveur.

Expected:

- parcours simple ;
- UI minimale mais efficace.

**Step 3: Verifier la protection patient**

S'assurer que la page reste inaccessible hors espace patient.

Expected:

- pas d'acces public ;
- pas de contournement par URL.

**Step 4: Verifier le build**

Run:

```bash
npm run build
```

Expected:

- PASS ;
- page compatible avec le rendu Next.js.

**Step 5: Commit**

```bash
git add app/(patient)/patient/book/page.tsx app/(patient)/patient/layout.tsx
git commit -m "feat: add patient booking page"
```

## Task 5.6: Creer le formulaire UI de reservation

**Files:**
- Create: `components/appointments/booking-form.tsx`

**Step 1: Construire un formulaire simple**

Inclure:

- choix du creneau ;
- informations patient utiles ;
- bouton de validation.

Expected:

- formulaire lisible ;
- parcours direct pour le patient.

**Step 2: Gérer les etats de soumission**

Prevoir:

- etat pending ;
- retour erreur ;
- retour succes minimal.

Expected:

- UX fluide ;
- pas de complexite prematuree.

**Step 3: Verifier lint**

Run:

```bash
npm run lint
```

Expected:

- PASS ;
- composant propre.

**Step 4: Commit**

```bash
git add components/appointments/booking-form.tsx
git commit -m "feat: add booking form"
```

## Task 5.7: Tester le conflit de reservation et le flux complet

**Files:**
- Create: `tests/unit/appointments/service.test.ts`
- Create: `tests/integration/appointments/create-appointment.test.ts`

**Step 1: Ecrire les tests unitaires de conflit**

Tester:

- reservation reussie ;
- creneau deja reserve ;
- creneau manquant ;
- entree invalide.

Expected:

- les regles critiques sont couvertes.

**Step 2: Ecrire le test d'integration transactionnel**

Tester un flux complet:

- validation ;
- lecture du creneau ;
- creation du rendez-vous ;
- reservation du creneau ;
- verification du resultat en base.

Expected:

- le comportement transactionnel est prouve.

**Step 3: Verifier lint, typecheck et tests**

Run:

```bash
npm run lint
npm run typecheck
npm run test
```

Expected:

- PASS ;
- task stabilisee avant merge.

**Step 4: Commit**

```bash
git add tests/unit/appointments tests/integration/appointments
git commit -m "test: cover appointment reservation flow"
```

## Definition of Done

- un patient peut reserver un creneau ouvert ;
- la reservation est transactionnelle ;
- un creneau ne peut pas etre reserve deux fois ;
- la page patient de reservation existe ;
- le formulaire de reservation existe ;
- les tests de conflit et de flux passent ;
- `lint`, `typecheck` et `build` passent apres la Task 5.

## Risques a surveiller

- double reservation en cas de concurrence ;
- incoherence entre creneaux et rendez-vous ;
- verifications d'autorisation oubliees dans le service ;
- page patient trop lourde pour la V1 ;
- confusion entre statut de rendez-vous et statut de paiement.
