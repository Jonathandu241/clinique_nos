# Plan d'implémentation : Task 10 - Annulation et reprogrammation staff

Ce plan détaille l'ajout des capacités de gestion des rendez-vous pour le personnel administratif.

## 1. Objectifs
- Permettre l'annulation avec motif par le staff.
- Permettre le déplacement d'un rendez-vous vers un nouveau créneau libre.
- Maintenir l'intégrité des statuts de créneaux.
- Notifier le patient du changement.

## 2. Structure Technique

### 2.1 Politiques Métier (`modules/appointments/policies.ts`)
Encapsule les règles d'autorisation (ex: impossible d'annuler un rdv passé).

### 2.2 Repository (`modules/appointments/repository.ts`)
Nouvelles transactions MySQL2 pour assurer l'atomicité des changements (libération ancien créneau + réservation nouveau).

### 2.3 Service et Actions
Coordination des appels DB et des notifications.

## 3. Liste des Tâches

### 10.1 : Politiques et Types
- [ ] Créer `modules/appointments/policies.ts`.
- [ ] Exposer `canCancel` et `canReschedule`.

### 10.2 : Repository (Transactions)
- [ ] Implémenter `cancelAppointmentTransaction`.
- [ ] Implémenter `rescheduleAppointmentTransaction`.

### 10.3 : Intégration Notifications
- [ ] Ajouter les templates dans `modules/notifications/templates.ts`.
- [ ] Créer les événements dans `modules/notifications/events.ts`.

### 10.4 : UI Staff (Next.js)
- [ ] Ajouter les boutons d'action sur `/staff/appointments/[id]`.
- [ ] Créer le formulaire de sélection de nouveau créneau.

### 10.5 : Tests
- [ ] Tests unitaires sur les politiques.
- [ ] Tests d'intégration sur les flux d'annulation/reprogrammation.
