# User Stories Principales

## Epic 1 - Gestion du compte patient

### Story 1

En tant que patiente Amina, je veux creer un compte, afin de reserver et suivre mes rendez-vous.

Scenario: creation de compte reussie
Given: Amina n'a pas encore de compte
When: elle soumet ses informations d'inscription valides
Then: son compte est cree et elle peut acceder a son espace

### Story 2

En tant que patiente Amina, je veux me connecter a mon compte, afin de consulter mes rendez-vous et payer a temps.

Scenario: connexion reussie
Given: Amina dispose deja d'un compte actif
When: elle soumet des identifiants valides
Then: elle accede a son espace personnel

## Epic 2 - Reservation de rendez-vous

### Story 3

En tant que patiente Amina, je veux voir les creneaux disponibles d'un medecin, afin de choisir un rendez-vous reellement reservable.

Scenario: consultation des disponibilites
Given: des creneaux sont ouverts pour un medecin
When: Amina consulte le planning disponible
Then: seuls les creneaux reservables lui sont affiches

### Story 4

En tant que patiente Amina, je veux reserver un creneau disponible, afin d'obtenir un rendez-vous avec un statut clair.

Scenario: reservation sur creneau libre
Given: un creneau est encore libre
When: Amina confirme sa demande de reservation
Then: un rendez-vous est cree avec un statut visible

## Epic 3 - Gestion des disponibilites

### Story 5

En tant que medecin Mamadou, je veux ouvrir mes disponibilites, afin que les patients puissent reserver sur des creneaux conformes a mon agenda reel.

Scenario: ajout de disponibilites
Given: Mamadou est authentifie
When: il enregistre un nouveau bloc de disponibilites
Then: les creneaux correspondants deviennent reservables

### Story 6

En tant que secretaire Safia, je veux ajuster les disponibilites d'un medecin, afin de gerer les contraintes operationnelles de la clinique.

Scenario: modification d'un planning
Given: Safia dispose des droits necessaires
When: elle modifie un bloc de disponibilites
Then: le planning visible est mis a jour pour les futures reservations

## Epic 4 - Suivi et traitement des rendez-vous

### Story 7

En tant que secretaire Safia, je veux voir tous les rendez-vous avec leurs statuts, afin de savoir rapidement lesquels necessitent une action.

Scenario: consultation de la liste des rendez-vous
Given: plusieurs rendez-vous existent dans le systeme
When: Safia ouvre la vue de suivi
Then: elle voit chaque rendez-vous avec son statut courant

### Story 8

En tant que medecin Mamadou, je veux consulter mes rendez-vous du jour et a venir, afin d'anticiper ma charge et les changements.

Scenario: consultation de l'agenda medecin
Given: des rendez-vous sont lies au compte de Mamadou
When: il consulte son planning
Then: il voit les rendez-vous pertinents avec leur statut

### Story 9

En tant que secretaire Safia, je veux annuler ou reprogrammer un rendez-vous, afin de gerer les changements de planning sans ambiguite.

Scenario: reprogrammation d'un rendez-vous
Given: un rendez-vous existe deja
When: Safia selectionne une nouvelle date ou un nouveau creneau
Then: le rendez-vous est mis a jour et les parties concernees sont notifiees

## Epic 5 - Paiement et echeances

### Story 10

En tant que patiente Amina, je veux payer les frais de consultation avant l'echeance, afin de conserver mon rendez-vous.

Scenario: paiement avant la date limite
Given: Amina a un rendez-vous avec paiement requis
When: elle effectue un paiement valide avant l'echeance
Then: le rendez-vous est marque comme paye

### Story 11

En tant que patiente Amina, je veux etre avertie avant la date limite de paiement, afin d'eviter une annulation automatique.

Scenario: envoi d'un rappel de paiement
Given: un rendez-vous approche de son echeance de paiement
When: le systeme atteint le moment prevu pour le rappel
Then: Amina recoit une notification de rappel

### Story 12

En tant que responsable clinique, je veux qu'un rendez-vous non paye a l'echeance soit annule automatiquement, afin de liberer le creneau sans intervention manuelle.

Scenario: annulation automatique pour non-paiement
Given: un rendez-vous n'est pas paye a son echeance
When: la date limite est depassee
Then: le rendez-vous passe au statut `expire pour non-paiement` et le creneau est libere

## Epic 6 - Notifications

### Story 13

En tant que patiente Amina, je veux recevoir une confirmation apres reservation, afin de savoir que ma demande a bien ete prise en compte.

Scenario: notification apres reservation
Given: un rendez-vous vient d'etre cree
When: la creation est finalisee
Then: Amina recoit une notification adaptee a son statut

### Story 14

En tant que secretaire Safia, je veux etre notifiee des nouveaux rendez-vous et des incidents de paiement, afin de traiter rapidement les exceptions.

Scenario: notification interne
Given: un evenement critique survient sur un rendez-vous
When: cet evenement est enregistre
Then: Safia recoit une alerte exploitable

## Stories a affiner plus tard

- [hypothese] En tant que patient, pouvoir annuler moi-meme mon rendez-vous.
- [hypothese] En tant que patient, pouvoir reprogrammer moi-meme mon rendez-vous.
- [hypothese] En tant qu'administrateur, definir plusieurs types de consultation avec des tarifs differents.
