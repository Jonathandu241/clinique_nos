# Plan d'implémentation - Task 7 : Paiement et Confirmation (Fake)

Ce plan décrit les étapes pour implémenter un flux de paiement simulé permettant de passer un rendez-vous du statut `pending` (En attente) à `confirmed` (Confirmé).

## Objectifs
- Permettre au patient de visualiser ses frais de consultation.
- Offrir une interface de paiement simulée ("Fake Payment").
- Mettre à jour atomiquement le statut du rendez-vous et le statut de paiement après succès.
- Rediriger l'utilisateur vers sa fiche de rendez-vous confirmée.

---

## 7.1 : Services et Logique SQL
**Fichiers :**
- `modules/appointments/repository.ts` (Maj)
- `modules/payments/types.ts` (Création)
- `modules/payments/service.ts` (Création)

**Actions :**
- Ajouter `updateAppointmentPaymentStatus` dans le repository pour gérer la transition `unpaid` -> `paid` et `pending` -> `confirmed` dans une transaction.
- Définir les types de base pour une transaction de paiement simulée.

## 7.2 : Server Actions de Paiement
**Fichiers :**
- `modules/payments/actions.ts` (Création)

**Actions :**
- Créer l'action `processFakePayment(appointmentId: string)`.
- **Sécurité** : Vérifier que le rendez-vous appartient bien au patient connecté (`requirePatientAccess`).
- **Logique** : Appeler le service de mise à jour et revalider les chemins `/patient/appointments` et `/patient/dashboard`.

## 7.3 : Interface de Paiement (Patient)
**Fichiers :**
- `app/(patient)/patient/payments/[appointmentId]/page.tsx` (Création)
- `components/payments/fake-payment-form.tsx` (Création)

**Actions :**
- Créer une page de "Checkout" épurée affichant le récapitulatif du rendez-vous (Date, Docteur, Prix).
- Implémenter le composant `FakePaymentForm` :
    - Simulation de chargement (2 secondes).
    - Bouton de confirmation "Simuler le paiement".
    - Feedback visuel en cas de succès/échec.

## 7.4 : Intégration et Navigation
**Fichiers :**
- `app/(patient)/patient/appointments/[id]/page.tsx` (Maj)

**Actions :**
- Ajouter un bouton "Procéder au paiement" sur la fiche détail du rendez-vous si le statut est `pending`.
- Afficher un message d'information si le paiement est requis pour confirmer la réservation.

## 7.5 : Tests de Validation
**Fichiers :**
- `tests/integration/payments/fake-payment.test.ts` (Création)

**Actions :**
- Tester le cas nominal : Paiement réussi -> Statut passe à `confirmed`.
- Tester le cas d'erreur : Tentative de paiement sur un rendez-vous déjà payé ou appartenant à autrui.

---

## Guide de Revue (SDD)

### 1. Revue de Conformité (Spec Review)
- Le paiement est-il bien "fake" (pas de clé Stripe réelle) ?
- Le statut du rendez-vous passe-t-il bien à `confirmed` ?
- La sécurité est-elle maintenue (le patient ne peut pas payer pour un autre) ?

### 2. Revue de Qualité (Code Quality Review)
- Utilisation des Server Actions avec `useFormStatus` pour le feedback ?
- Revalidation correcte du cache Next.js ?
- Documentation `///` présente sur les nouvelles fonctions ?
