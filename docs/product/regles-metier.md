# Regles Metier

## 1. Perimetre organisationnel

- La V1 couvre une seule clinique.
- La clinique peut avoir plusieurs medecins, mais un seul cadre operationnel commun.
- Le pilotage des rendez-vous peut etre assure par le medecin ou par le secretariat selon les cas.

## 2. Comptes et roles

- Un patient doit creer un compte pour reserver et suivre ses rendez-vous.
- Un medecin dispose d'un compte avec acces a ses disponibilites et a ses rendez-vous.
- Le secretariat dispose d'un compte avec acces aux rendez-vous de la clinique.
- Un role administrateur clinique peut parametrer les utilisateurs et superviser les regles. `[hypothese]`

## 3. Disponibilites

- Un rendez-vous ne peut etre reserve que sur un creneau ouvert.
- Les creneaux sont definis par le medecin ou par le secretariat selon l'organisation interne.
- Un creneau ne peut accueillir qu'un seul rendez-vous a la fois, sauf regle explicite contraire. `[hypothese]`
- Un creneau retire ou modifie ne doit plus etre reservable.
- Toute modification d'un creneau deja reserve doit generer une action explicite de reprogrammation ou d'annulation.

## 4. Reservation

- Le patient choisit un medecin, une date et un creneau disponible.
- A la creation, un rendez-vous recoit un statut initial.
- Le statut initial recommande est `confirme` si le creneau est libre et standard.
- Un statut `en attente` peut etre utilise pour des cas speciaux definis par la clinique. `[hypothese]`
- Chaque rendez-vous doit conserver un historique minimal de statut. `[hypothese]`

## 5. Statuts de rendez-vous

Les statuts minimaux recommandes en V1 sont:

- `en attente`
- `confirme`
- `annule`
- `termine`
- `expire pour non-paiement`

Decision de conception recommandee:

- Limiter le nombre de statuts en V1 pour garder un suivi lisible.
- Distinguer l'annulation volontaire de l'expiration pour non-paiement.

## 6. Paiement

- Le paiement des frais de consultation est obligatoire avant le rendez-vous.
- Si le rendez-vous est planifie a plus de `48h`, le paiement doit etre effectue au plus tard `48h` avant l'heure du rendez-vous.
- Si le rendez-vous est pris a moins de `48h` de l'horaire, le paiement est exige immediatement.
- Un rendez-vous non paye a l'echeance est annule automatiquement.
- L'annulation automatique pour non-paiement doit liberer le creneau.
- Le systeme doit enregistrer si le rendez-vous est `paye`, `non paye` ou `rembourse` si ce cas est gere plus tard. `[hypothese]`

## 7. Notifications

Le patient doit recevoir une notification:

- lors de la creation de son rendez-vous ;
- lors de la confirmation si le flux passe par une validation ;
- avant l'echeance de paiement ;
- lors de la validation du paiement ;
- lors de l'annulation automatique pour non-paiement ;
- lors d'une reprogrammation ou d'une annulation manuelle.

Le medecin et/ou le secretariat doivent recevoir une notification:

- lors d'une nouvelle reservation ;
- lors d'un changement de statut ;
- lors d'un incident de paiement si une action humaine est requise. `[hypothese]`

## 8. Annulations et reprogrammations

- Le secretariat peut annuler ou reprogrammer un rendez-vous.
- Le medecin peut annuler ou reprogrammer ses rendez-vous.
- Les conditions dans lesquelles le patient peut annuler ou deplacer son rendez-vous restent a definir. `[hypothese]`
- Toute annulation ou reprogrammation doit declencher une notification.

## 9. Traçabilite

- Chaque rendez-vous doit afficher son statut courant.
- Les changements critiques doivent etre historises: creation, confirmation, paiement, annulation, reprogrammation. `[hypothese]`
- Les utilisateurs internes doivent pouvoir identifier qui a effectue une action quand c'est applicable. `[hypothese]`

## 10. Regles a confirmer avant specification detaillee

- [hypothese] Duree standard d'une consultation.
- [hypothese] Canaux de notification exacts: email, SMS, WhatsApp.
- [hypothese] Politique de remboursement si paiement deja effectue puis annulation.
- [hypothese] Cas des rendez-vous urgents ou hors planning standard.
- [hypothese] Cas des medecins qui imposent une validation manuelle systematique.
