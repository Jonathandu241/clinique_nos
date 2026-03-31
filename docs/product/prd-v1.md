# PRD V1 - Application de gestion de rendez-vous clinique

## 1. Executive Summary

Nous construisons une application web pour une clinique permettant aux patients de creer un compte, consulter des creneaux disponibles, reserver un rendez-vous et payer avant la consultation. Le produit doit egalement permettre au medecin et au secretariat de publier les disponibilites, suivre les rendez-vous, traiter les exceptions et recevoir les notifications importantes.

La proposition de valeur repose sur un flux simple et fiable:

- disponibilites visibles et reservables ;
- statut du rendez-vous clair a chaque etape ;
- paiement obligatoire avant echeance ;
- annulation automatique en cas de non-paiement ;
- coordination operationnelle entre patient, medecin et secretariat.

La V1 est volontairement concentree sur une seule clinique avec un flux standard de consultation, afin de valider l'usage reel avant d'elargir le produit.

## 2. Problem Statement

### Qui a ce probleme

- Les patients qui veulent prendre rendez-vous sans dependre d'appels repetes.
- Les medecins qui veulent un agenda fiable sans surcharge administrative.
- Le secretariat qui doit suivre les rendez-vous, paiements, annulations et reprogrammations.
- Le responsable de clinique qui veut reduire les pertes et fiabiliser l'operation.

### Quel est le probleme

La prise de rendez-vous et son suivi sont souvent geres a travers plusieurs canaux et sans source unique de verite. Cela cree:

- des ambiguities sur la disponibilite reelle ;
- des statuts de rendez-vous peu clairs ;
- des oublis de paiement et de rappel ;
- des annulations tardives ou des no-shows ;
- une charge manuelle importante pour le personnel.

### Pourquoi c'est douloureux

- Pour le patient: perte de temps, incertitude, risque de perdre son rendez-vous.
- Pour le medecin: planning instable et perturbations evitables.
- Pour le secretariat: charge operationnelle, relances repetitives, erreurs de coordination.
- Pour la clinique: baisse d'efficacite, creneaux perdus et manque de visibilite.

### Evidence

- `[hypothese]` Le besoin vient pour l'instant du cadrage initial fourni par le porteur du projet.
- Aucune interview terrain ni donnees historiques n'ont encore ete integrees a ce PRD.
- Avant verrouillage definitif du backlog, il faudra mener un cycle court de discovery avec au moins `5 a 8` entretiens cibles.

### Problem Statement de reference

Une clinique a besoin d'un moyen fiable pour gerer le cycle complet de rendez-vous, car l'absence de visibilite commune sur les disponibilites, confirmations et paiements cree des erreurs, des pertes de temps et des rendez-vous non honores.

## 3. Target Users & Personas

### Personas primaires

#### Patient Amina

- Souhaite reserver vite depuis mobile. `[hypothese]`
- A besoin d'un parcours simple, rassurant et lisible.
- Attend des confirmations et rappels sans devoir appeler.

#### Secretaire Safia

- Supervise l'operation quotidienne.
- Gere confirmations, reprogrammations, annulations et exceptions.
- A besoin d'une vue centrale fiable et actionnable.

#### Medecin Mamadou

- Ouvre ou ajuste ses disponibilites selon son agenda reel.
- Veut garder la maitrise du planning sans faire d'administration inutile.

### Persona secondaire

#### Responsable Clinique

- Suit la qualite operationnelle globale.
- Veut reduire no-shows, annulations et pertes de creneaux.

### Jobs to be done

- Patient: reserver une consultation et la conserver en payant dans les delais.
- Medecin: publier des creneaux fiables et voir un agenda coherent.
- Secretaire: suivre tout le portefeuille de rendez-vous et traiter vite les exceptions.
- Responsable: piloter un processus standard et mesurable.

## 4. Strategic Context

### Objectifs business

- Digitaliser le parcours de rendez-vous d'une clinique unique.
- Reduire les pertes liees aux rendez-vous non payes ou non honores.
- Donner une source unique de verite au medecin et au secretariat.
- Rendre le processus suffisamment simple pour etre adopte au quotidien.

### Why now

- Le besoin est immediatement exploitable sur un flux simple a forte frequence.
- Le probleme touche a la fois l'experience patient et l'efficacite interne.
- Le paiement avant consultation est une regle forte qui justifie une automatisation rapide.

### Contexte strategique retenu

- V1 pour une seule clinique.
- Pas de multi-site ni de multi-clinique au lancement.
- Pas de dossier medical complet dans cette phase.
- Priorite au flux de consultation standard plutot qu'aux cas complexes.

### Hypotheses strategiques a valider

- `[hypothese]` Les patients accepteront un paiement avant consultation.
- `[hypothese]` Le personnel clinique adoptera l'outil comme source principale de verite.
- `[hypothese]` Le volume de cas speciaux restera compatible avec une gestion manuelle en V1.

## 5. Solution Overview

### Description generale

Le produit est une application web de gestion du cycle de rendez-vous. Il doit couvrir:

- la creation de compte patient ;
- la publication des disponibilites ;
- la reservation d'un creneau ;
- la visualisation du statut du rendez-vous ;
- le paiement avant echeance ;
- les notifications transactionnelles ;
- l'annulation automatique en cas de non-paiement ;
- le traitement des exceptions par le medecin ou le secretariat.

### Flux principal recommande

1. Le medecin ou le secretariat ouvre des disponibilites.
2. Le patient cree un compte ou se connecte.
3. Le patient choisit un medecin, une date et un creneau disponible.
4. Le systeme cree le rendez-vous avec un statut lisible.
5. Le patient recoit une notification de creation ou de confirmation.
6. Le systeme applique la regle de paiement:
   - paiement au plus tard `48h` avant si le rendez-vous est planifie au-dela de `48h` ;
   - paiement immediat si le rendez-vous est reserve a moins de `48h`.
7. Le patient recoit des rappels avant l'echeance de paiement.
8. Si le paiement est recu, le rendez-vous reste actif.
9. Si le paiement n'est pas recu a temps, le rendez-vous est annule automatiquement et le creneau est libere.

### Fonctionnalites cles

- Authentification patient.
- Gestion des disponibilites medecin.
- Vue de suivi secretariat.
- Statuts de rendez-vous standardises.
- Gestion du paiement et des echeances.
- Notifications pour patient et equipe interne.
- Reprogrammation et annulation par les utilisateurs internes.

### Statuts minimaux recommandes

- `en attente`
- `confirme`
- `annule`
- `termine`
- `expire pour non-paiement`

### Decision produit

Recommandation:

- reserver directement les creneaux standard ouverts ;
- n'utiliser la validation manuelle que pour des cas particuliers.

Tradeoff:

- gain de clarte, vitesse et conversion ;
- perte d'une partie de la flexibilite si la clinique traite beaucoup d'exceptions.

## 6. Success Metrics

### Metrique principale

- Taux de rendez-vous completes via le flux standard jusqu'au statut `paye` ou `confirme` sans intervention exceptionnelle.
- Cible: `[hypothese]` `70%` ou plus dans les `8 a 12 semaines` suivant le lancement.

### Metriques secondaires

- Temps moyen de prise de rendez-vous.
  - Cible: `< 3 minutes` dans les `3 premiers mois`.
- Taux de paiement avant echeance.
  - Cible: `[hypothese]` `>= 80%` dans les `3 premiers mois`.
- Taux d'intervention manuelle.
  - Cible: `[hypothese]` `< 20%` apres `3 mois`.
- Taux de no-show.
  - Cible: `[hypothese]` `< 10%` dans les `6 premiers mois`.

### Guardrails

- `100%` des rendez-vous doivent afficher un statut courant.
- Toute annulation automatique doit liberer le creneau correspondant.
- Toute reprogrammation ou annulation doit declencher une notification.

## 7. User Stories & Requirements

### Epic Hypothesis 1 - Reservation patient

Si nous permettons aux patients de reserver eux-memes sur des creneaux reels,
alors nous reduirons les frictions de prise de rendez-vous
et nous augmenterons la part de rendez-vous passes par le flux standard.

### Epic Hypothesis 2 - Pilotage operationnel interne

Si nous donnons au medecin et au secretariat une vue claire des disponibilites et des statuts,
alors la clinique reduira les erreurs de coordination et les interventions inutiles.

### Epic Hypothesis 3 - Paiement avant consultation

Si nous appliquons une regle de paiement avant echeance avec rappels et annulation automatique,
alors la clinique reduira les rendez-vous perdus et les creneaux bloques inutilement.

### Exigences fonctionnelles

#### Comptes et acces

- Le patient doit pouvoir creer un compte et se connecter.
- Le medecin doit pouvoir consulter ses rendez-vous et ses disponibilites.
- Le secretariat doit pouvoir consulter les rendez-vous de la clinique.
- `[hypothese]` Un administrateur clinique doit pouvoir gerer les comptes internes.

#### Disponibilites

- Le systeme doit permettre la creation et la mise a jour de disponibilites.
- Un creneau deja reserve ne doit pas etre propose a un autre patient.
- Une modification de creneau reserve doit passer par une action explicite de reprogrammation ou d'annulation.

#### Reservation

- Le patient doit pouvoir consulter les creneaux disponibles par medecin.
- Le patient doit pouvoir reserver un creneau disponible.
- Chaque rendez-vous doit recevoir un statut initial visible.

#### Paiement

- Le systeme doit calculer l'echeance de paiement selon la date du rendez-vous.
- Le systeme doit exiger un paiement immediat pour les reservations a moins de `48h`.
- Le systeme doit marquer le rendez-vous comme paye lorsque le paiement est valide.
- Le systeme doit annuler automatiquement le rendez-vous non paye a l'echeance.

#### Notifications

- Le patient doit recevoir une notification apres creation ou confirmation.
- Le patient doit recevoir un rappel avant echeance de paiement.
- Le patient doit recevoir une notification apres paiement.
- Le patient doit recevoir une notification si le rendez-vous est annule ou reprogramme.
- Le secretariat et/ou le medecin doivent etre informes des nouveaux rendez-vous et des changements critiques.

#### Gestion interne

- Le secretariat doit pouvoir annuler ou reprogrammer un rendez-vous.
- Le medecin doit pouvoir annuler ou reprogrammer ses rendez-vous.
- Le systeme doit conserver une tracabilite minimale des actions critiques. `[hypothese]`

### User stories critiques

#### Story A

En tant que patiente Amina, je veux voir des creneaux reellement disponibles, afin de reserver sans ambiguite.

Acceptance criteria:

- seuls les creneaux reservables sont affiches ;
- un creneau reserve disparait des options disponibles ;
- l'etat du rendez-vous cree est visible apres reservation.

#### Story B

En tant que secretaire Safia, je veux voir tous les rendez-vous avec leur statut, afin de savoir lesquels exigent une action.

Acceptance criteria:

- chaque rendez-vous affiche au minimum son patient, son medecin, sa date et son statut ;
- les rendez-vous a risque ou expires sont identifiables ;
- une action de reprogrammation ou d'annulation est disponible selon les droits.

#### Story C

En tant que patiente Amina, je veux payer avant l'echeance, afin de conserver mon rendez-vous.

Acceptance criteria:

- l'echeance de paiement est affichee clairement ;
- le paiement valide met a jour le statut associe ;
- un rappel est envoye avant l'echeance.

#### Story D

En tant que responsable clinique, je veux qu'un rendez-vous non paye soit annule automatiquement, afin de liberer le creneau sans action manuelle.

Acceptance criteria:

- l'annulation est declenchee a l'echeance definie ;
- le creneau est remis en disponibilite ;
- le patient recoit une notification adaptee.

### Edge cases et contraintes

- `[hypothese]` Politique d'annulation cote patient non definie.
- `[hypothese]` Politique de remboursement non definie.
- `[hypothese]` Duree standard de consultation non definie.
- `[hypothese]` Cas d'urgence hors flux standard non definis.
- `[hypothese]` Canal de notification prioritaire non encore tranche.

## 8. Out of Scope

Les elements suivants sont explicitement hors perimetre V1:

- multi-clinique ;
- multi-site ;
- teleconsultation ;
- dossier medical electronique complet ;
- assurance ou mutuelle avancee ;
- paiement fractionne ;
- reporting avance ;
- optimisation algorithmique du planning ;
- application mobile native ;
- integrateurs externes non indispensables au flux principal.

## 9. Dependencies & Risks

### Dependances techniques

- Systeme d'authentification.
- Gestion fiable des disponibilites et des conflits de reservation.
- Integration de paiement.
- Service de notification transactionnelle.
- Taches planifiees pour rappels et annulations automatiques.

### Dependances externes

- Fournisseur de paiement.
- Fournisseur de notifications email, SMS ou WhatsApp. `[hypothese]`
- Validation des contraintes legales et contractuelles liees au paiement et aux donnees. `[hypothese]`

### Risques principaux

- Risque de complexite metier cachee.
  - Mitigation: garder la V1 sur un flux standard et documenter les exceptions.
- Risque de faible adoption interne.
  - Mitigation: concevoir une vue secretariat tres claire et simple.
- Risque de rejet du paiement anticipe par certains patients.
  - Mitigation: tester le discours, les delais et la clarte du parcours.
- Risque d'ambiguite sur les responsabilites medecin vs secretariat.
  - Mitigation: modeler des droits et une tracabilite explicites.

## 10. Open Questions

- Quelle est la duree standard d'une consultation en V1 ?
- Le patient peut-il annuler ou reprogrammer seul son rendez-vous ?
- Quelle est la politique exacte de remboursement si un rendez-vous paye est annule ?
- Quels canaux de notification sont prioritaires au lancement ?
- Tous les medecins suivent-ils la meme logique de disponibilite ?
- Quels cas imposent un statut `en attente` plutot qu'une confirmation immediate ?
- Quel niveau de reporting est indispensable des la V1 ?

---

Ce document synthese doit servir de reference commune entre produit, design et developpement.
