# Plan d'implémentation - Task 8 : Système de Notifications (Simulation)

Ce document décrit les étapes pour implémenter un système de notifications transactionnelles (Email/SMS) simulé pour la Clinique NOS.

## Objectif
Permettre à l'application de notifier les patients et le personnel lors d'événements clés, tout en conservant une trace (audit) en base de données. En V1, l'envoi réel est simulé par des logs console et des enregistrements en base de données.

---

## 8.1 : Infrastructure et DTO
**Fichiers :**
- `modules/notifications/types.ts` : Définition des interfaces et enums.
- `modules/notifications/repository.ts` : Fonctions d'accès aux données (Prisma).

**Actions :**
- Définir les types pour les différents templates (RDV_RESERVED, PAYMENT_CONFIRMED, RDV_CANCELLED).
- implémenter `createNotificationLog` pour enregistrer l'intention d'envoi.
- Implémenter `updateNotificationStatus` pour marquer comme envoyé/échoué.

## 8.2 : Service de Notification
**Fichiers :**
- `modules/notifications/service.ts` : Logique métier de notification.
- `modules/notifications/provider.ts` : Adaptateur pour la "livraison" (Simulation console).

**Actions :**
- Créer un `sendNotification` qui :
    1. Prépare le contenu à partir du template.
    2. Enregistre le log en base (status: pending).
    3. Appelle le provider simulé.
    4. Met à jour le status du log (status: sent).

## 8.3 : Templates et Événements
**Fichiers :**
- `modules/notifications/templates.ts` : Contenu textuel des notifications.

**Actions :**
- Définir les textes pour :
    - Confirmation de réservation (Patient).
    - Confirmation de paiement (Patient).
    - Alerte nouveau rendez-vous (Docteur).

## 8.4 : Intégration dans les flux existants
**Fichiers :**
- `modules/appointments/actions.ts` : Intégrer l'appel après `reserveAppointment`.
- `modules/payments/actions.ts` : Intégrer l'appel après `confirmFakePayment`.

**Actions :**
- Ajouter les déclencheurs de notification à la fin des Server Actions réussies.
- S'assurer que les notifications sont déclenchées *après* la validation de la transaction SQL principale (pour éviter les faux-positifs en cas de rollback).

## 8.5 : Validation (Tests)
**Fichiers :**
- `tests/integration/notifications/notifications.test.ts`

**Actions :**
- Vérifier qu'une réservation crée bien une entrée dans `evenements_notification`.
- Vérifier que le contenu du template est correctement formaté.
- Tester le cas d'erreur de simulation (fail-safe).

---

## Critères d'acceptation (DoD)
- [ ] Une entrée est créée dans `evenements_notification` pour chaque événement critique.
- [ ] La console affiche clairement le "corps" de la notification simulée.
- [ ] Les notifications ne bloquent pas le flux principal en cas d'erreur (logique asynchrone ou try/catch).
- [ ] Les tests d'intégration valident la création des logs.
