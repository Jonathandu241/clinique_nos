# Plan d'implémentation : Task 12 - Facturation PDF

Ce plan décrit la mise en place du système de génération et téléchargement de factures.

## 1. Objectifs
- Permettre le téléchargement d'un PDF récapitulatif après paiement.
- Générer le document dynamiquement côté serveur.
- Sécuriser l'accès aux fichiers PDF.

## 2. Structure Technique

### 2.1 Service PDF (`lib/pdf/invoice-generator.ts`)
Utilisation de `jspdf` pour construire le document.

### 2.2 API Route (`app/api/appointments/[id]/invoice/route.ts`)
Endpoint sécurisé servant le flux binaire PDF.

### 2.3 UI (`components/appointments/patient-appointment-card.tsx`)
Bouton d'action contextuel.

## 3. Liste des Tâches

### 12.1 : Infrastructure
- [ ] Installer `jspdf` et `jspdf-autotable`.
- [ ] Créer le template de facture de base.

### 12.2 : Serveur (API)
- [ ] Créer la route GET sécurisée.
- [ ] Valider que seuls les utilisateurs autorisés peuvent télécharger le PDF.

### 12.3 : Interface Patient
- [ ] Ajouter le bouton "Facture PDF" sur les cartes de rendez-vous payés.
- [ ] Tester le flux complet du clic au fichier local.

### 12.4 : Polissage
- [ ] Améliorer le design du PDF (Logo, Couleurs Clinique).
- [ ] Gérer les erreurs de génération proprement.
