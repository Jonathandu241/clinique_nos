# Task 4 - Gestion des disponibilites Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permettre au staff de creer, visualiser et maintenir les disponibilites d'un medecin avec generation simple et fiable de creneaux reservables.

**Architecture:** Cette task se concentre uniquement sur la partie disponibilites. On introduit une couche metier simple en dessous de l'interface staff, avec validations cote serveur, generation de creneaux deterministe et acces base isole dans un repository. Le but est de preparer la reservation patient sans ajouter de logique de reservation, de paiement ou de notification dans cette task.

**Tech Stack:** Next.js App Router, TypeScript, React Server Components, Server Actions, Prisma ou acces SQL deja etabli, Zod pour les validations, Vitest pour les tests unitaires, Tailwind CSS et composants UI existants pour la page staff.

---

## Statut attendu avant de commencer

- La Task 1 est terminee.
- La Task 2 est terminee.
- La Task 3 est terminee.
- La base MySQL locale est disponible et synchronisee.
- Les noms de tables et de champs suivent la nomenclature francaise.
- L'espace staff est deja protege par authentification et RBAC.

## Contexte

La Task 4 prepare le terrain pour la reservation patient. Elle doit permettre au staff de declarer des plages de disponibilite et de produire des creneaux reservables simples, lisibles et coherents avec le schema de donnees. Cette task ne doit pas encore exposer la reservation, le paiement ou les regles de non-paiement.

## Principes de decision

- Garder une generation de creneaux previsible et testable.
- Stocker les creneaux explicitement si le schema le permet deja.
- Centraliser les validations dans `lib/validation/availability.ts`.
- Encapsuler l'acces base dans un repository pour limiter la logique SQL dans les pages.
- Rendre la page staff simple, sans calendrier complexe ni drag and drop pour la V1.
- Faire en sorte que les operations soient idempotentes autant que possible.

## Ce que la Task 4 doit inclure

- un module de validation des disponibilites ;
- un repository pour lire et ecrire les donnees de disponibilite ;
- un service metier pour la creation et la generation de creneaux ;
- une action serveur pour creer ou mettre a jour une disponibilite ;
- une page staff pour consulter et creer les disponibilites ;
- un formulaire UI simple pour la saisie ;
- des tests unitaires pour la generation des creneaux ;
- un test d'integration ou d'e2e leger pour la creation de disponibilite.

## Ce que la Task 4 ne doit pas inclure

- pas de reservation patient ;
- pas de paiement ;
- pas de webhook ;
- pas de notifications ;
- pas de cron ;
- pas d'interface calendrier avancee ;
- pas de reprogrammation de rendez-vous.

## Hypotheses de travail

- `[hypothese]` Un medecin possede des plages de disponibilite definies par debut et fin.
- `[hypothese]` Les creneaux reservables ont une duree fixe en V1.
- `[hypothese]` La duree d'un creneau peut etre une constante de configuration au niveau du module.
- `[hypothese]` Les creneaux sont generes de facon deterministe a partir d'une plage de disponibilite.
- `[hypothese]` Les fuseaux horaires sont geres cote serveur en UTC ou via une convention unique.

## Structure cible de la Task 4

```text
modules/
  availability/
    repository.ts
    service.ts
    actions.ts
lib/
  validation/
    availability.ts
app/
  (staff)/
    staff/
      availability/page.tsx
components/
  availability/
    availability-form.tsx
tests/
  unit/
    availability/
```

## Regles metier V1

- une disponibilite appartient a un medecin ;
- une disponibilite possede une date ou une plage de debut et de fin ;
- les creneaux se calculent par pas fixe ;
- un creneau doit toujours appartenir a une disponibilite existante ;
- une disponibilite ne doit pas generer de creneaux qui se chevauchent ;
- une disponibilite invalide doit etre refusee cote serveur avant toute ecriture.

## Decision recommandee

Recommendation:

- creer un service `availability` qui fabrique les creneaux ;
- garder la page staff comme simple couche de presentation ;
- utiliser un repository pour toute lecture ou ecriture base ;
- isoler la logique de generation dans une fonction pure testable.

Tradeoff:

- un peu plus de fichiers qu'une logique concentree dans la page ;
- beaucoup plus simple a tester, a relire et a faire evoluer.

## Task 4.1: Definir les validations et le contrat de donnees

**Files:**
- Create: `lib/validation/availability.ts`
- Modify: `modules/availability/service.ts`
- Modify: `modules/availability/actions.ts`

**Step 1: Definir les DTO de disponibilite**

Precisier les champs attendus pour la creation d'une disponibilite, par exemple:

- `medecinId`
- `debut`
- `fin`
- `dureeCreneauMinutes`
- `joursActifs` ou equivalent si le besoin existe dans la V1

Expected:

- un contrat unique pour toutes les entrees ;
- pas de champ ambigu ;
- pas de logique de formulaire repartie dans plusieurs fichiers.

**Step 2: Ecrire les schemas Zod**

Ajouter les regles minimales:

- presence des champs obligatoires ;
- debut inferieur a fin ;
- duree de creneau positive ;
- medecin valide ;
- dates valides.

Expected:

- les erreurs de saisie sont detectees avant l'acces base ;
- les messages restent simples et exploitables.

**Step 3: Verifier le typecheck**

Run:

```bash
npm run typecheck
```

Expected:

- PASS ;
- les types de la task sont coherents.

**Step 4: Commit**

```bash
git add lib/validation/availability.ts modules/availability/service.ts modules/availability/actions.ts
git commit -m "feat: add availability validation contract"
```

## Task 4.2: Creer le repository de disponibilite

**Files:**
- Create: `modules/availability/repository.ts`

**Step 1: Definir les operations de base**

Ajouter au minimum:

- creation d'une disponibilite ;
- lecture des disponibilites par medecin ;
- lecture des creneaux associes ;
- eventuelle suppression ou desactivation simple si necessaire.

Expected:

- le SQL ou Prisma reste cache derriere un objet clair ;
- les operations base sont reutilisables par le service.

**Step 2: Garder le repository fin**

Ne pas mettre de regle metier lourde dans le repository.

Expected:

- les tests de service restent simples ;
- la logique d'affaire reste dans `service.ts`.

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
git add modules/availability/repository.ts
git commit -m "feat: add availability repository"
```

## Task 4.3: Implementer la generation de creneaux dans le service

**Files:**
- Create: `modules/availability/service.ts`

**Step 1: Ecrire la fonction pure de generation**

Construire une fonction qui prend:

- une plage de debut ;
- une plage de fin ;
- une duree de creneau ;
- et retourne une liste de creneaux normalises.

Expected:

- generation deterministe ;
- pas de chevauchement ;
- pas de creneau en dehors de la plage.

**Step 2: Ajouter les regles de validation metier**

Refuser:

- les plages inverses ;
- les durees invalides ;
- les creneaux trop courts pour produire au moins un slot ;
- les plages incompatibles avec la configuration.

Expected:

- le service protege les donnees avant ecriture ;
- les erreurs restent explicites.

**Step 3: Preparer la creation de disponibilite complete**

Orchestrer:

- validation ;
- creation de la disponibilite ;
- generation des creneaux ;
- ecriture des creneaux.

Expected:

- une seule entree metier ;
- comportement coherent et simple.

**Step 4: Ecrire les tests unitaires**

Run:

```bash
npm run test -- --run tests/unit/availability
```

Expected:

- generation des creneaux couverte ;
- cas limite verifies.

**Step 5: Commit**

```bash
git add modules/availability/service.ts tests/unit/availability
git commit -m "feat: add availability slot generation"
```

## Task 4.4: Ajouter l'action serveur de creation

**Files:**
- Create: `modules/availability/actions.ts`

**Step 1: Ecrire l'action de creation**

Ajouter une Server Action qui:

- verifie la session staff ;
- valide l'entree ;
- appelle le service ;
- renvoie un resultat simple ou une redirection.

Expected:

- la mutation est declenchee cote serveur ;
- aucune logique sensible ne fuit au client.

**Step 2: Gérer les erreurs de maniere simple**

Prevoir:

- messages de validation ;
- refus d'autorisation ;
- erreurs techniques minimales.

Expected:

- UX claire ;
- debug possible en cas de souci.

**Step 3: Verifier lint et typecheck**

Run:

```bash
npm run lint
npm run typecheck
```

Expected:

- PASS ;
- action serveur integree proprement.

**Step 4: Commit**

```bash
git add modules/availability/actions.ts
git commit -m "feat: add availability server action"
```

## Task 4.5: Construire la page staff de gestion des disponibilites

**Files:**
- Create: `app/(staff)/staff/availability/page.tsx`
- Modify: `app/(staff)/staff/layout.tsx`

**Step 1: Afficher les disponibilites existantes**

Construire une page staff qui:

- charge les disponibilites du medecin ou de la clinique ;
- affiche les creneaux generes ;
- montre l'etat des plages de maniere lisible.

Expected:

- page utile sans surcharge visuelle ;
- lecture rapide pour le staff.

**Step 2: Integrer le formulaire de creation**

Brancher le formulaire simple a la Server Action.

Expected:

- creation directe depuis l'interface ;
- pas de couche intermediaire inutile.

**Step 3: Verifier l'acces staff**

S'assurer que la page reste protegee par le layout.

Expected:

- pas d'acces hors staff ;
- pas de contournement par URL directe.

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
git add app/(staff)/staff/availability/page.tsx app/(staff)/staff/layout.tsx
git commit -m "feat: add staff availability page"
```

## Task 4.6: Creer le formulaire UI de disponibilite

**Files:**
- Create: `components/availability/availability-form.tsx`

**Step 1: Construire un formulaire simple**

Inclure les champs necessaires a la saisie des plages de disponibilite.

Expected:

- formulaire court ;
- UI claire autour du vert et du blanc clinique.

**Step 2: Gérer les etats de soumission**

Prevoir:

- etat pending ;
- affichage des erreurs ;
- retour de succes minimal.

Expected:

- experience fluide ;
- pas de complexite superflue.

**Step 3: Verifier lint**

Run:

```bash
npm run lint
```

Expected:

- PASS ;
- composant UI propre.

**Step 4: Commit**

```bash
git add components/availability/availability-form.tsx
git commit -m "feat: add availability form"
```

## Task 4.7: Tester l'integration de creation de disponibilite

**Files:**
- Create: `tests/unit/availability/service.test.ts`
- Create: `tests/integration/availability/create-availability.test.ts`

**Step 1: Ecrire un test unitaire de generation**

Tester:

- cas nominal ;
- plage trop courte ;
- duree invalide ;
- slots consecutifs sans chevauchement.

Expected:

- la generation est couverte de facon fiable.

**Step 2: Ecrire un test d'integration de creation**

Tester un flux complet:

- validation ;
- creation disponibilite ;
- creation des creneaux ;
- persistance en base de test.

Expected:

- le flux metier principal est verifie ;
- la regression est plus facile a detecter.

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
git add tests/unit/availability tests/integration/availability
git commit -m "test: cover availability creation flow"
```

## Definition of Done

- un staff peut creer une disponibilite ;
- des creneaux reservables sont generes correctement ;
- la page staff affiche les disponibilites ;
- la validation serveur empeche les entrees invalides ;
- les tests unitaires de generation passent ;
- le test d'integration de creation passe ;
- `lint`, `typecheck` et `build` passent apres la Task 4.

## Risques a surveiller

- generation de creneaux avec chevauchement ;
- fuseaux horaires mal geres ;
- logique de disponibilite mise dans la page au lieu du service ;
- creneaux non synchronises avec la base ;
- surface UI trop complexe pour la V1.
