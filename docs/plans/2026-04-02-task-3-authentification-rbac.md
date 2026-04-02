# Task 3 - Authentification et RBAC Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mettre en place une authentification simple et sure pour Clinique NOS, avec gestion de session, controle d'acces par role et protection des espaces patient et staff.

**Architecture:** Cette task reste volontairement compacte. On utilise une couche auth serveur claire, un seul modele de session utilisateur et des gardes de role reutilisables dans les layouts et les points sensibles. Le but est de rendre les zones privees impermeables sans introduire un systeme d'auth trop complexe ni multiplier les abstractions.

**Tech Stack:** Next.js App Router, TypeScript, MySQL via Prisma, React Server Components, Server Actions si necessaires, Zod pour les formulaires, cookies/secrets cote serveur, Tailwind CSS pour les ecrans de connexion.

---

## Statut attendu avant de commencer

- La Task 1 est terminee.
- La Task 2 est terminee.
- Prisma est configure et la base locale est synchronisee.
- Les noms de tables et champs utilisent la nomenclature francaise.
- Le dossier `app/` contient deja la home publique.

## Contexte

La Task 3 doit preparer les espaces prives pour les prochaines etapes du produit:

- espace patient ;
- espace staff ;
- futures pages de reservation, disponibilites et rendez-vous.

Cette task doit fournir une base d'authentification fonctionnelle mais minimaliste. Elle ne doit pas encore implementer de logique metier lourde ni de redirections complexes inutiles.

## Principes de decision

- Garder un seul flux d'authentification simple pour la V1.
- Eviter les options premium ou les integrations multiples tant que le besoin n'est pas confirme.
- Centraliser les checks de session et de role dans des helpers reutilisables.
- Proteger les layouts privees par defaut, pas seulement les pages.
- Faire en sorte que le code reste lisible et testable.

## Ce que la Task 3 doit inclure

- un provider d'authentification decide et configure ;
- un module de session serveur ;
- un module de permissions / RBAC ;
- une page de connexion ;
- une page d'inscription ;
- un layout patient protege ;
- un layout staff protege ;
- des tests de permissions ou verifications equivalentes.

## Ce que la Task 3 ne doit pas inclure

- pas de page dashboard complete ;
- pas de reservation ;
- pas de disponibilites ;
- pas de paiement ;
- pas de notifications ;
- pas de cron ;
- pas d'UI admin complete.

## Hypotheses de travail

- `[hypothese]` Les roles V1 sont `patient`, `doctor`, `secretary`, `clinic_admin`.
- `[hypothese]` Le compte utilisateur principal reste le point d'entree de l'auth.
- `[hypothese]` Les profils metier `profils_patients` et `profils_medecins` sont rattaches a `utilisateurs`.
- `[hypothese]` Le choix final du provider d'auth doit rester simple et compatible App Router.
- `[hypothese]` Les flux de connexion et d'inscription peuvent etre servis par des pages simples et des actions serveur.

## Structure cible de la Task 3

```text
auth.ts
lib/
  auth/
    session.ts
    permissions.ts
app/
  (public)/
    login/page.tsx
    register/page.tsx
  (patient)/
    patient/layout.tsx
  (staff)/
    staff/layout.tsx
tests/
  unit/
    auth/
```

## Roles V1

- `patient`
- `doctor`
- `secretary`
- `clinic_admin`

## Decision d'auth recommandee

Recommendation:

- un provider d'auth simple et largement compatible avec Next.js App Router ;
- une session serveur lisible depuis les layouts et les actions ;
- un helper unique pour verifier `requireAuth` ;
- un helper unique pour verifier `requireRole`.

Tradeoff:

- moins de flexibilité qu'un montage multi-provider ;
- beaucoup plus simple a maintenir pour une V1 clinique.

## Task 3.1: Choisir et configurer le provider d'auth

**Files:**
- Create: `auth.ts`
- Modify: `package.json`
- Modify: `.env`
- Modify: `.env.example`

**Step 1: Choisir le provider**

Valider un provider simple compatible App Router et sessions serveur.

Expected:

- un seul choix d'auth pour la V1 ;
- pas de fragmentation entre plusieurs solutions.

**Step 2: Installer les dependances necessaires**

Run:

```bash
npm install
```

ou les dependances du provider retenu si elles ne sont pas deja presentes.

Expected:

- dependances d'auth disponibles ;
- aucun conflit avec Next.js ou Prisma.

**Step 3: Configurer les secrets**

Ajouter les variables d'environnement necessaires dans `.env` et `.env.example`.

Expected:

- configuration explicite ;
- pas de secret hardcode.

**Step 4: Verifier la configuration**

Run:

```bash
npm run typecheck
```

Expected:

- PASS ;
- configuration auth coherent.

**Step 5: Commit**

```bash
git add auth.ts package.json package-lock.json .env.example
git commit -m "chore: configure authentication foundation"
```

## Task 3.2: Creer la gestion de session serveur

**Files:**
- Create: `lib/auth/session.ts`

**Step 1: Ecrire le helper de lecture de session**

Centraliser la lecture de l'utilisateur courant cote serveur.

Expected:

- une seule porte d'entree pour la session ;
- reusable dans layouts, pages et actions.

**Step 2: Exposer un type de session minimal**

Limiter les donnees a l'identite et au role.

Expected:

- pas de surcharge de donnees ;
- pas d'exposition involontaire.

**Step 3: Verifier le typecheck**

Run:

```bash
npm run typecheck
```

Expected:

- PASS ;
- types de session coherents.

**Step 4: Commit**

```bash
git add lib/auth/session.ts
git commit -m "chore: add server session helper"
```

## Task 3.3: Creer le module RBAC

**Files:**
- Create: `lib/auth/permissions.ts`

**Step 1: Definir les helpers de permissions**

Ajouter au minimum:

- `requireAuth`
- `requireRole`
- `hasRole`

Expected:

- les checks de droits sont centralises ;
- les futures pages n'ont pas a reinventer la logique.

**Step 2: Garder les helpers simples**

Utiliser des retours clairs et des erreurs explicites.

Expected:

- lecture facile ;
- comportements previsibles.

**Step 3: Ajouter des tests unitaires**

Run:

```bash
npm run typecheck
```

et ajouter un test minimal si le cadre du projet le permet.

Expected:

- logique RBAC verifiee ;
- pas de regressions evidentes.

**Step 4: Commit**

```bash
git add lib/auth/permissions.ts
git commit -m "chore: add rbac helpers"
```

## Task 3.4: Creer les pages publiques de connexion et d'inscription

**Files:**
- Create: `app/(public)/login/page.tsx`
- Create: `app/(public)/register/page.tsx`

**Step 1: Dessiner des pages simples**

Fournir des formulaires clairs, sobres et compatibles mobile.

Expected:

- pages lisibles ;
- interface propre autour du vert et du blanc clinique.

**Step 2: Garder l'interaction minimale**

N'ajouter que le strict necessaire pour la V1.

Expected:

- pas de complexite d'UX prematuree ;
- bons points d'entree pour les prochaines tasks.

**Step 3: Verifier lint**

Run:

```bash
npm run lint
```

Expected:

- PASS ;
- pas d'erreurs de composants.

**Step 4: Commit**

```bash
git add app/(public)/login/page.tsx app/(public)/register/page.tsx
git commit -m "feat: add public auth pages"
```

## Task 3.5: Proteger les layouts patient et staff

**Files:**
- Create: `app/(patient)/patient/layout.tsx`
- Create: `app/(staff)/staff/layout.tsx`

**Step 1: Proteger l'espace patient**

Verifier la session et le role avant de rendre les pages privees.

Expected:

- un patient non connecte est bloque ;
- un role non autorise est refuse.

**Step 2: Proteger l'espace staff**

Verifier les roles `doctor`, `secretary` et `clinic_admin` selon la regle choisie.

Expected:

- staff isole ;
- controle d'acces en profondeur, pas seulement dans l'UI.

**Step 3: Ajouter les redirections ou erreurs appropriees**

Privilégier une sortie claire et simple.

Expected:

- comportement previsible ;
- pas de boucles de redirection.

**Step 4: Verifier le build**

Run:

```bash
npm run build
```

Expected:

- PASS ;
- layouts prives compatibles avec le rendu Next.js.

**Step 5: Commit**

```bash
git add app/(patient)/patient/layout.tsx app/(staff)/staff/layout.tsx
git commit -m "feat: protect private layouts"
```

## Task 3.6: Valider les permissions et les flux de base

**Files:**
- Modify: `lib/auth/permissions.ts`
- Modify: `lib/auth/session.ts`
- Create: `tests/unit/auth/permissions.test.ts`
- Create: `tests/unit/auth/session.test.ts`

**Step 1: Ecrire les tests de permissions**

Tester les cas de base:

- utilisateur connecte ;
- utilisateur non connecte ;
- role autorise ;
- role refuse.

Expected:

- les comportements critiques sont couverts.

**Step 2: Verifier la stabilite**

Run:

```bash
npm run typecheck
npm run lint
```

Expected:

- PASS ;
- auth et RBAC stables.

**Step 3: Commit**

```bash
git add lib/auth/permissions.ts lib/auth/session.ts tests/unit/auth
git commit -m "test: cover auth and rbac basics"
```

## Definition of Done

- l'authentification est configuree ;
- les sessions serveur sont lisibles ;
- les permissions sont centralisees ;
- les layouts patient et staff sont proteges ;
- les pages login et register existent ;
- les tests de permissions passent ;
- `lint`, `typecheck` et `build` passent apres la Task 3.

## Risques a surveiller

- un provider d'auth trop complexe pour la V1 ;
- des checks de role disperses dans plusieurs fichiers ;
- des pages privees rendues sans verification serveur ;
- des secrets exposes dans le bundle client ;
- des redirections trop agressives ou incoherentes.
