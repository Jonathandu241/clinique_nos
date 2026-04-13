# Clinique NOS - Espace de Santé Intégré

Clinique NOS est une application moderne de gestion de clinique construite avec Next.js, permettant aux patients de réserver des soins, de payer en ligne et de suivre leur parcours de santé, tout en offrant aux équipes médicales des outils de gestion de planning performants.

## 🚀 Fonctionnalités

- **Patients** : Réservation de créneaux, dashboard premium, paiement en ligne, factures PDF, rappels automatiques.
- **Staff** : Gestion des disponibilités, suivi des rendez-vous, annulation/reprogrammation avec audit.
- **Automatisations** : Annulation automatique des impayés (Cron), notifications transactionnelles.

## 🛠 Stack Technique

- **Framework** : Next.js 15+ (App Router, Server Components)
- **Base de données** : MySQL via Prisma ORM
- **Authentification** : Auth.js / NextAuth
- **Design** : Tailwind CSS, Lucide Icons, UI Premium (Bento Grid)
- **PDF** : jsPDF + jsPDF-autotable
- **Qualité** : Vitest (Integration), Zod (Validation)

## 📦 Installation

1. **Pré-requis** :
   - Node.js 20+
   - Serveur MySQL (via XAMPP ou Docker)

2. **Configuration** :
   ```bash
   npm install
   cp .env.example .env
   # Renseignez votre DATABASE_URL et NEXTAUTH_SECRET dans .env
   ```

3. **Base de données** :
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Démarrage** :
   ```bash
   npm run dev
   ```

## 📂 Architecture

Le projet suit une architecture monolithique modulaire par domaine :
- `modules/` : Logique métier pure (Repository, Service, Actions, Types).
- `app/` : Routes et pages Next.js.
- `lib/` : Utilitaires partagés (DB, Auth, Validation).
- `components/` : Composants UI réutilisables.

## 🛡 Sécurité & Audit

Toutes les actions critiques (réservation, paiement, modification) sont journalisées dans une table d'audit pour assurer une traçabilité totale. Les accès sont protégés par des permissions granulaires (Patient, Staff, Doctor, Admin).

## 📄 Licence

Propriété de Clinique NOS.
