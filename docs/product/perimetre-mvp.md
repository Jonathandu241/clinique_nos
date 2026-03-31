# Perimetre MVP et Hors Perimetre

## Objectif du MVP

Lancer un premier produit utilisable dans une seule clinique, capable de gerer le flux principal de rendez-vous entre patient, medecin et secretariat, avec paiement avant consultation et annulation automatique en cas de non-paiement.

## Inclus dans le MVP

### Parcours patient

- Creation de compte et connexion.
- Consultation des creneaux disponibles.
- Reservation d'un rendez-vous.
- Consultation du statut du rendez-vous.
- Paiement du rendez-vous selon la regle des `48h`.
- Reception de notifications sur les etapes principales.

### Parcours medecin

- Consultation de ses rendez-vous.
- Publication ou mise a jour de ses disponibilites.
- Annulation ou reprogrammation d'un rendez-vous selon ses droits.

### Parcours secretariat

- Vue liste des rendez-vous de la clinique.
- Confirmation, annulation, reprogrammation.
- Suivi du statut de paiement.
- Gestion des exceptions operationnelles.

### Parcours administration clinique

- Gestion simple des comptes internes. `[hypothese]`
- Parametrage de base des medecins et de leurs disponibilites. `[hypothese]`

### Fonctionnalites transverses

- Statuts de rendez-vous clairs.
- Notifications transactionnelles.
- Annulation automatique pour non-paiement.
- Journal minimal des actions critiques. `[hypothese]`

## Hors perimetre MVP

- Multi-clinique ou multi-site.
- Teleconsultation.
- Dossier medical electronique complet.
- Gestion avancee des assurances ou mutuelles.
- Paiement fractionne ou abonnements.
- Gestion fine des remboursements complexes.
- Algorithmes d'optimisation de planning.
- Synchronisation avec calendriers externes type Google Calendar. `[hypothese]`
- Application mobile native.
- Reporting avance ou tableaux de bord analytiques complets.
- Gestion de plusieurs types d'actes avec tarification complexe. `[hypothese]`

## Pourquoi ce decoupage

Recommendation:

- Garder le MVP centre sur le flux principal qui cree la valeur immediate.
- Reporter les fonctions lourdes ou a forte variabilite metier.

Tradeoff:

- On livre plus vite et on valide le besoin reel.
- En contrepartie, certains cas admin ou financiers devront etre geres manuellement au debut.

## Critere de succes du MVP

Le MVP sera considere comme valide si, dans les `8 a 12 semaines` suivant le lancement:

- au moins `70%` des rendez-vous passent par le flux standard sans intervention exceptionnelle ; `[hypothese]`
- les patients comprennent clairement le statut de leur rendez-vous ;
- l'equipe clinique adopte l'outil comme source principale de verite ;
- les annulations pour non-paiement sont appliquees sans traitement manuel.
