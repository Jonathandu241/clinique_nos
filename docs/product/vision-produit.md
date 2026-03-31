# Vision Produit

## Vision

Permettre a une clinique de gerer ses rendez-vous de maniere fiable, simple et traçable, en donnant aux patients un parcours clair de reservation et de paiement, tout en laissant au medecin et au secretariat la flexibilite necessaire pour piloter les disponibilites et traiter les exceptions.

## Probleme a resoudre

Aujourd'hui, la prise de rendez-vous en clinique est souvent geree de maniere fragmentee:

- les patients ne savent pas toujours quels creneaux sont reellement disponibles ;
- les medecins et le secretariat gerent les demandes via plusieurs canaux ;
- les confirmations et rappels sont manuels ou incomplets ;
- les rendez-vous non payes ou oublies degradent le planning et le chiffre d'affaires.

## Proposition de valeur

L'application doit offrir:

- au patient, un parcours simple pour creer un compte, choisir un creneau, suivre son rendez-vous et payer dans les delais ;
- au medecin, un moyen fiable de publier ses disponibilites et de superviser ses rendez-vous ;
- au secretariat, un outil de coordination pour confirmer, reprogrammer, annuler et suivre les paiements ;
- a la clinique, une reduction des erreurs, des no-shows et des interventions manuelles.

## Positionnement du produit

Le produit n'est pas seulement une interface de reservation. C'est un systeme operationnel de gestion du cycle de rendez-vous:

- ouverture des disponibilites ;
- reservation par le patient ;
- validation selon le contexte ;
- rappel et paiement avant echeance ;
- annulation automatique en cas de non-paiement ;
- notification a chaque etape cle.

## Objectifs produit

- Reduire le temps moyen de prise de rendez-vous a moins de `3 minutes` dans les `3 premiers mois`.
- Atteindre un taux de rendez-vous avec statut clair (`en attente`, `confirme`, `annule`, `termine`) de `100%` des dossiers des le lancement.
- Atteindre un taux de paiement avant echeance de `80%` ou plus dans les `3 premiers mois`. `[hypothese]`
- Maintenir un taux d'intervention manuelle inferieur a `20%` des rendez-vous apres `3 mois`. `[hypothese]`
- Reduire le taux de no-show a moins de `10%` dans les `6 premiers mois`. `[hypothese]`

## Principes directeurs

- Clarte avant sophistication: chaque rendez-vous doit avoir un statut lisible par tous.
- Le planning doit rester operable: l'application aide la clinique a travailler, elle ne complique pas le reel.
- Les regles de paiement doivent etre explicites et appliquees automatiquement.
- Le produit doit couvrir les cas standards en self-service et laisser les exceptions au personnel.
- La V1 doit rester concentree sur une seule clinique et un flux de consultation simple.

## Risque principal a surveiller

Le principal risque n'est pas technique mais metier: vouloir gerer trop de cas particuliers trop tot.

Decision recommandee:

- Standardiser le flux principal en V1.
- Traiter les exceptions via le medecin ou le secretariat.
- Reporter les variantes lourdes apres validation du parcours de base.
