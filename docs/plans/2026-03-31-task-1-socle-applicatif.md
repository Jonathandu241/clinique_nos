# Task 1 - Socle Applicatif Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Initialiser un socle Next.js propre, minimal et evolutif pour la V1 clinique, avec App Router, TypeScript, Tailwind, structure de base, shell UI initial et outils de qualite.

**Architecture:** Le socle doit rester volontairement mince: un projet Next.js App Router unique, organise par espaces fonctionnels, avec Server Components par defaut et une frontiere client minimale. Cette premiere fondation ne contient pas encore la logique metier, mais elle doit deja imposer des conventions stables de structure, de style, de scripts et de verification.

**Tech Stack:** Next.js App Router, TypeScript, React Server Components, Tailwind CSS, shadcn/ui, ESLint, Prettier, TypeScript strict mode, npm, Node.js LTS.

---

## Contexte

Le workspace est vide hors dossier `docs/`. Cette task doit donc:

- initialiser le projet Next.js a la racine ;
- preparer l'arborescence cible du produit ;
- poser un premier shell visuel tres simple ;
- rendre possible un `dev`, un `lint` et un `build` propres ;
- laisser le terrain pret pour les tasks suivantes.

## Decision de mise en oeuvre

### Ce que le socle doit inclure

- un projet Next.js App Router TypeScript fonctionnel ;
- Tailwind CSS configure ;
- un layout racine ;
- une page d'accueil publique tres simple ;
- un espace de composants UI ;
- une structure de dossiers coherente avec le plan technique ;
- des scripts npm standards ;
- une base de qualite minimale.

### Ce que le socle ne doit pas inclure

- authentification ;
- base de donnees ;
- logique metier ;
- pages patient/staff completes ;
- paiement ;
- notifications ;
- API ou Server Actions fonctionnelles.

Tradeoff:

- on va plus vite et on limite les decisions prematurees ;
- on accepte un socle visuel encore tres leger tant que la structure est saine.

## Arborescence cible apres la Task 1

```text
app/
  (public)/
    page.tsx
  favicon.ico
  globals.css
  layout.tsx
components/
  ui/
lib/
  utils/
modules/
public/
.gitignore
eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
postcss.config.mjs
tsconfig.json
```

## Hypotheses de travail

- `[hypothese]` Le projet sera cree avec `npm`.
- `[hypothese]` Vous partez sur une version recente de Next.js 16 via `create-next-app`.
- `[hypothese]` Le code restera a la racine du repo, sans dossier `src/`.
- `[hypothese]` Tailwind est accepte comme base de styling.

## Tache detaillee

### Task 1.1: Initialiser le projet Next.js

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Create: `next-env.d.ts`
- Create: `.gitignore`

**Step 1: Initialiser le projet via l'outil officiel**

Run:

```bash
npx create-next-app@latest . --ts --app --tailwind --eslint --use-npm --import-alias "@/*"
```

Expected:

- creation des fichiers Next.js standards ;
- App Router active ;
- Tailwind configure ;
- scripts `dev`, `build`, `start`, `lint` presents dans `package.json`.

**Step 2: Verifier les scripts generes**

Verifier que `package.json` contient au minimum:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

Expected:

- les scripts standards existent ;
- aucune dependance obsolete ou non desiree n'est ajoutee a ce stade.

**Step 3: Verifier la configuration TypeScript**

Verifier dans `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Expected:

- mode strict actif ;
- alias `@/*` disponible ;
- configuration compatible App Router.

**Step 4: Installer les dependances**

Run:

```bash
npm install
```

Expected:

- `node_modules` installe ;
- aucun conflit de dependances ;
- lockfile genere.

**Step 5: Verifier que l'application demarre**

Run:

```bash
npm run dev
```

Expected:

- le serveur demarre sans erreur ;
- la page par defaut Next.js est accessible ;
- aucune erreur TypeScript ou Tailwind au boot.

**Step 6: Commit**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json eslint.config.mjs postcss.config.mjs next-env.d.ts .gitignore
git commit -m "chore: initialize nextjs application shell"
```

### Task 1.2: Nettoyer le scaffold et poser la structure minimale

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `app/(public)/page.tsx`
- Create: `components/ui/.gitkeep`
- Create: `lib/utils/.gitkeep`
- Create: `modules/.gitkeep`

**Step 1: Remplacer la page par defaut par une page d'accueil propre**

Remplacer le contenu de `app/page.tsx` ou le deplacer en `app/(public)/page.tsx` selon l'arborescence retenue, avec un squelette minimal:

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-6 px-6 py-16">
        <span className="w-fit rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">
          Clinique NOS
        </span>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Gestion de rendez-vous pour clinique
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Socle applicatif V1 en cours d'initialisation.
          </p>
        </div>
      </section>
    </main>
  );
}
```

Expected:

- plus de contenu marketing ou demo par defaut Next.js ;
- une home simple et propre existe.

**Step 2: Mettre en place un layout racine lisible**

Modifier `app/layout.tsx` vers une version simple:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinique NOS",
  description: "Application de gestion de rendez-vous pour clinique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
```

Expected:

- `lang="fr"` ;
- metadata minimale correcte ;
- pas de logique non necessaire dans le layout racine.

**Step 3: Nettoyer `globals.css`**

Garder un fichier simple, par exemple:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
}
```

Expected:

- base CSS saine ;
- pas de styles de demo inutiles ;
- un fond et des couleurs neutres.

**Step 4: Creer les dossiers structurants vides**

Run:

```bash
mkdir components
mkdir components\\ui
mkdir lib
mkdir lib\\utils
mkdir modules
```

Puis creer les marqueurs vides:

```bash
type nul > components\\ui\\.gitkeep
type nul > lib\\utils\\.gitkeep
type nul > modules\\.gitkeep
```

Expected:

- structure minimale deja prete pour les tasks suivantes ;
- pas de fichiers metier prematures.

**Step 5: Verifier le rendu**

Run:

```bash
npm run dev
```

Expected:

- home affichee proprement ;
- aucun import mort ni fichier manquant.

**Step 6: Commit**

```bash
git add app/layout.tsx app/globals.css app/page.tsx app/(public)/page.tsx components/ui/.gitkeep lib/utils/.gitkeep modules/.gitkeep
git commit -m "chore: add minimal application structure"
```

### Task 1.3: Ajouter le socle UI minimal

**Files:**
- Create: `components/ui/container.tsx`
- Create: `components/ui/page-header.tsx`
- Create: `components/ui/status-pill.tsx`
- Modify: `app/(public)/page.tsx`

**Step 1: Creer un composant `Container`**

```tsx
type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={["mx-auto w-full max-w-6xl px-6", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
```

Expected:

- composant reutilisable pour les pages futures ;
- pas de dependance externe.

**Step 2: Creer un composant `PageHeader`**

```tsx
type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="space-y-3">
      {eyebrow ? (
        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">
          {eyebrow}
        </span>
      ) : null}
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
        {description ? <p className="max-w-2xl text-slate-600">{description}</p> : null}
      </div>
    </header>
  );
}
```

Expected:

- composant de tete de page simple et reutilisable.

**Step 3: Creer un composant `StatusPill`**

```tsx
type StatusPillProps = {
  label: string;
};

export function StatusPill({ label }: StatusPillProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
      {label}
    </span>
  );
}
```

Expected:

- une premiere primitive visuelle utile pour les futurs statuts.

**Step 4: Recomposer la home avec ces primitives**

Exemple cible pour `app/(public)/page.tsx`:

```tsx
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";

export default function HomePage() {
  return (
    <main className="min-h-screen py-16">
      <Container className="space-y-8">
        <PageHeader
          eyebrow="Clinique NOS"
          title="Socle applicatif V1"
          description="Base technique initiale pour la gestion de rendez-vous des patients."
        />
        <div className="flex flex-wrap gap-3">
          <StatusPill label="Next.js App Router" />
          <StatusPill label="TypeScript" />
          <StatusPill label="Tailwind CSS" />
        </div>
      </Container>
    </main>
  );
}
```

Expected:

- home composee a partir de primitives reutilisables ;
- premier pas vers un design system tres simple.

**Step 5: Verifier le lint**

Run:

```bash
npm run lint
```

Expected:

- PASS ;
- aucun warning critique.

**Step 6: Commit**

```bash
git add components/ui/container.tsx components/ui/page-header.tsx components/ui/status-pill.tsx app/(public)/page.tsx
git commit -m "feat: add minimal reusable ui primitives"
```

### Task 1.4: Ajouter une convention utilitaire minimale

**Files:**
- Create: `lib/utils/cn.ts`
- Modify: `components/ui/container.tsx`

**Step 1: Ajouter un helper `cn`**

```ts
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
```

Expected:

- une convention simple pour composer les classes CSS ;
- pas encore besoin d'ajouter `clsx` ou `tailwind-merge`.

**Step 2: Utiliser `cn` dans `Container`**

```tsx
import { cn } from "@/lib/utils/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>{children}</div>;
}
```

Expected:

- convention reusee ;
- base propre pour les composants suivants.

**Step 3: Verifier le typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected:

- PASS ;
- zero erreur TypeScript.

**Step 4: Commit**

```bash
git add lib/utils/cn.ts components/ui/container.tsx
git commit -m "chore: add shared className utility"
```

### Task 1.5: Installer shadcn/ui sans proliferer les composants

**Files:**
- Create: `components.json`
- Modify: `app/globals.css`
- Modify: `tsconfig.json`
- Modify: `lib/utils/cn.ts`

**Step 1: Initialiser shadcn/ui**

Run:

```bash
npx shadcn@latest init
```

Choix recommandes:

- framework: `Next.js`
- style: `Default`
- base color: `Slate`
- CSS file: `app/globals.css`
- CSS variables: `yes`
- import alias: `@/*`

Expected:

- `components.json` cree ;
- variables CSS ajoutees proprement ;
- le projet est pret a accueillir de futurs composants shadcn.

**Step 2: Verifier que `cn` reste centralise**

Conserver `lib/utils/cn.ts` comme point unique. Si `shadcn` injecte une variante avec dependances externes, accepter seulement si elle reste simple et documentee.

Expected:

- pas de duplication inutile ;
- socle coherent.

**Step 3: Ne pas installer de composants shadcn supplementaires**

Decision:

- s'arreter a l'initialisation du systeme ;
- ne pas ajouter `button`, `card`, `dialog` ou autres tant qu'une vraie feature n'en a pas besoin.

Expected:

- pas de dette UI prematuree ;
- respect du YAGNI.

**Step 4: Verifier lint et build**

Run:

```bash
npm run lint
npm run build
```

Expected:

- `lint`: PASS
- `build`: PASS

**Step 5: Commit**

```bash
git add components.json app/globals.css tsconfig.json lib/utils/cn.ts
git commit -m "chore: initialize shadcn ui foundation"
```

### Task 1.6: Finaliser le socle de qualite et de verification

**Files:**
- Modify: `package.json`
- Create: `.editorconfig`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `README.md`

**Step 1: Enrichir les scripts npm**

Ajouter dans `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

Expected:

- scripts de qualite minimaux disponibles.

**Step 2: Ajouter les fichiers de convention**

`.editorconfig`

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
```

`.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

`.prettierignore`

```txt
node_modules
.next
coverage
dist
package-lock.json
```

Expected:

- conventions claires des le debut ;
- moins de bruit sur les prochains commits.

**Step 3: Rediger un `README.md` minimal**

Contenu recommande:

```md
# Clinique NOS

Socle Next.js pour une application de gestion de rendez-vous clinique.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run format`

## Statut

Le projet contient pour l'instant le socle applicatif uniquement.
```

Expected:

- tout nouveau contributeur comprend rapidement le point de depart.

**Step 4: Lancer la verification complete**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected:

- les trois commandes passent ;
- le socle est considere stable pour attaquer la Task 2.

**Step 5: Commit**

```bash
git add package.json .editorconfig .prettierrc.json .prettierignore README.md
git commit -m "chore: finalize application foundation quality tooling"
```

## Checklist de sortie de Task 1

- le projet Next.js est initialise a la racine ;
- l'App Router est actif ;
- Tailwind fonctionne ;
- la home publique est propre et minimale ;
- le layout racine est en place ;
- les dossiers `components`, `lib`, `modules` existent ;
- un noyau de primitives UI existe ;
- shadcn/ui est initialise sans surconstruire ;
- les scripts `dev`, `lint`, `typecheck`, `build`, `format` existent ;
- `npm run lint`, `npm run typecheck` et `npm run build` passent.

## Risques a surveiller pendant l'execution

- lancer `create-next-app` dans un dossier non vide peut refuser ou melanger des fichiers ;
- l'arborescence `app/page.tsx` versus `app/(public)/page.tsx` doit rester coherente ;
- ne pas ajouter trop de composants UI des cette phase ;
- ne pas introduire de logique client ou metier prematuree ;
- garder les conventions simples tant que l'equipe et le besoin reel ne les forcent pas.

## Resultat attendu en fin de Task 1

Un squelette Next.js propre, lisible et pret pour brancher:

- la base MySQL/XAMPP via Prisma dans la Task 2 ;
- l'authentification et les roles dans la Task 3 ;
- les modules metier sans refonte structurelle.
