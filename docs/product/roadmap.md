# Roadmap Now / Next / Later

## Principe

Cette roadmap est une feuille de route produit, pas un engagement ferme de livraison. Elle est construite pour une seule clinique et doit etre revalidee apres les premiers usages.

## Now

Objectif: rendre le flux principal operationnel de bout en bout.

- Cadrer les roles `patient`, `medecin`, `secretariat`, `admin clinique`.
- Mettre en place la creation de compte et l'authentification patient.
- Permettre la creation et la mise a jour des disponibilites des medecins.
- Permettre la reservation par le patient sur un creneau disponible.
- Afficher un statut de rendez-vous clair.
- Mettre en place le paiement avant consultation.
- Gerer la regle `paiement 48h avant`, avec paiement immediat si reservation a moins de `48h`.
- Automatiser l'annulation pour non-paiement.
- Envoyer les notifications transactionnelles essentielles.
- Donner au secretariat une vue de suivi des rendez-vous et des actions de base.

## Next

Objectif: fiabiliser l'exploitation et reduire les cas manuels.

- Ajouter une meilleure gestion des reprogrammations.
- Ajouter des filtres et vues utiles pour le secretariat.
- Ajouter un historique d'actions plus detaille.
- Renforcer les rappels avant echeance et avant rendez-vous.
- Clarifier les regles d'annulation cote patient.
- Mieux gerer les cas particuliers necessitant validation manuelle.
- Ajouter des indicateurs operationnels simples: rendez-vous confirmes, payes, annules, expires.

## Later

Objectif: etendre le produit une fois le flux principal valide.

- Multi-site ou multi-clinique.
- Plusieurs types de consultation avec durees et tarifs differents.
- Politique de remboursement et d'avoirs.
- Teleconsultation.
- Synchronisation avec des agendas externes.
- Reporting avance et tableaux de bord pour la direction.
- Parcours patient enrichi avec documents pre-consultation. `[hypothese]`
- Integrations externes plus larges: comptabilite, CRM, ERP. `[hypothese]`

## Arbitrages recommandes

- Favoriser la robustesse du flux standard plutot que la couverture precoce des exceptions.
- Prioriser les outils du secretariat presque autant que le parcours patient.
- Reporter toute complexite financiere ou medicale non indispensable au succes de la V1.

## Conditions pour passer de Now a Next

- Le flux reservation -> paiement -> confirmation est compris sans assistance dans la majorite des cas.
- L'annulation automatique pour non-paiement fonctionne sans intervention humaine.
- Le secretariat utilise l'outil comme reference principale pour suivre les rendez-vous.
- Les principales zones d'ambiguite metier ont ete observees et documentees.
