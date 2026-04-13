# Plan d'implémentation : Task 11 - Tableau de bord patient

Ce plan décrit la création de l'espace personnel du patient pour visualiser ses rendez-vous.

## 1. Objectifs
- Lister les rendez-vous futurs (prochains soins).
- Lister les rendez-vous passés (historique).
- Afficher clairement le statut de paiement pour chaque séance.
- Permettre un accès direct au paiement pour les séances réservées non payées.

## 2. Structure Technique

### 2.1 Repository (`modules/appointments/repository.ts`)
Fonction `getAppointmentsByPatientId` avec jointures sur les médecins et les créneaux.

### 2.2 Composants UI
- `PatientAppointmentCard` : Vue résumée d'une séance.
- `PatientAppointmentList` : Gestion du filtrage temporel (Futur/Passé).

### 2.3 Page (`app/(patient)/patient/dashboard/page.tsx`)
Page principale sécurisée par `requirePatientAccess`.

## 3. Liste des Tâches

### 11.1 : Data Fetching
- [x] Ajouter `getAppointmentsByPatientId` au repository.
- [x] Créer une fonction utilitaire pour récupérer le profil patient depuis l'ID utilisateur.

### 11.2 : Composants UI
- [x] Créer `PatientAppointmentCard` (Aesthetic premium).
- [x] Créer `PatientAppointmentList` avec gestion des états vides.

### 11.3 : Page Dashboard
- [x] Créer la page d'accueil patient.
- [x] Intégrer les statistiques rapides (Total rdv, Prochain rdv).

### 11.4 : Intégration Finale
- [x] Configurer la navigation patient.
- [x] Vérifier la responsivité mobile (crucial pour les patients).
