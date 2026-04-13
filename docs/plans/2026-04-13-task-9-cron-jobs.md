# Plan d'implémentation : Task 9 - Jobs Cron (Rappels et Expirations)

Ce plan décrit l'automatisation du cycle de vie des rendez-vous, incluant les rappels de paiement et l'expiration automatique des créneaux impayés.

## 1. Objectifs
- **Expiration** : Passer les rendez-vous en `expired_unpaid` et libérer les créneaux (`status: open`) après l'échéance.
- **Rappels** : Envoyer une notification de rappel x minutes/heures avant l'échéance.
- **Sécurité** : Protéger les routes API appelées par le cron via un secret partagé.

## 2. Tâches détaillées

### 9.1 Infrastructure et Sécurité
- [ ] Créer `lib/utils/cron-auth.ts` pour valider le header `Authorization: Bearer ${CRON_SECRET}`.
- [ ] Ajouter `CRON_SECRET` au fichier `.env.example`.

### 9.2 Logique d'Expiration (Repository & Service)
- [ ] Créer `modules/payments/jobs.ts`.
- [ ] Implémenter `processExpiredAppointments()` :
    - Trouver les rendez-vous en `payment_status: unpaid` ET `payment_due_at < NOW()`.
    - Exécuter une transaction SQL par rdv :
        1. Mettre à jour `rendezvous` -> `status: expired_unpaid`.
        2. Mettre à jour `creneaux_disponibilite` -> `status: open`.
    - Retourner le nombre de rendez-vous expirés pour le log.

### 9.3 Logique de Rappels (Repository & Service)
- [ ] Dans `modules/payments/jobs.ts`, implémenter `sendPaymentReminders()` :
    - Sélectionner les rdv impayés approchant de l'échéance (ex: moins de 1h restante).
    - Vérifier en base qu'un rappel n'a pas déjà été envoyé pour ce rdv via `evenements_notification`.
    - Appeler le service de notification pour envoyer le rappel.

### 9.4 Endpoints API (Route Handlers)
- [ ] Créer `app/api/cron/payment-expirations/route.ts`.
- [ ] Créer `app/api/cron/payment-reminders/route.ts`.
- [ ] Intégrer la vérification de sécurité et le logging.

### 9.5 Intégration et Tests
- [ ] Créer `tests/integration/payments/cron-jobs.test.ts`.
- [ ] Tester le scénario nominal d'expiration (le créneau redevient 'open').
- [ ] Tester le blocage en cas de secret invalide.

## 3. Dépendances
- Requiert les modules de notifications (Task 8) pour les rappels.
- Requiert le repository appointments (Task 5) pour les mises à jour transactionnelles.

## 4. Vérification
- `npm run typecheck`
- Exécution manuelle des endpoints via `curl` ou client API avec le secret.
