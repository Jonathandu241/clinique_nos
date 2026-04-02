# Instructions Agent

## Règles générales

- Répondre et coder en français.
- Garder le code simple, lisible et sans complexité inutile.
- Préférer toujours la solution la plus courte qui reste correcte.
- Éviter les abstractions prématurées.
- Réutiliser l’existant avant de créer un nouveau pattern.

## Documentation du code

- Chaque fichier source doit commencer par une documentation en `///` qui explique son rôle.
- Chaque fonction doit avoir une note ou un commentaire en `///` indiquant ce qu’elle fait.
- Chaque bloc `if` doit être précédé d’un commentaire court expliquant la condition ou l’intention.
- Chaque variable importante doit être commentée quand son rôle n’est pas évident.
- Si le code est évident, rester bref, mais ne pas supprimer la documentation demandée.

## Style de développement

- Favoriser les composants et fonctions petits.
- Garder une responsabilité unique par fichier quand c’est possible.
- Nommer clairement les variables, fonctions et composants.
- Éviter les fichiers trop gros.
- Ne pas ajouter de logique métier tant que le besoin n’est pas validé.

## Next.js

- Utiliser `App Router` par défaut.
- Préférer les `Server Components` par défaut.
- Ajouter `use client` seulement si l’interactivité l’exige vraiment.
- Respecter les conventions officielles de Next.js.
- Pour tout développement Next.js, utiliser le skill `nextjs-expert-2026`.

## UI/UX

- Pour toute partie visuelle, utiliser le skill `ui-ux-pro-max`.
- Garder une direction UI simple, propre et médicale.
- Rester autour d’une palette verte et blanche pour rappeler l’univers clinique.
- Utiliser le vert avec parcimonie pour les accents, les états positifs et les repères visuels.
- Conserver le blanc comme base principale de l’interface.
- Éviter les styles trop chargés, trop sombres ou trop décoratifs.

## Implémentation par tâches

- Pour chaque implémentation, utiliser le skill `subagent-driven-development`.
- Travailler par tâches petites et indépendantes.
- Préférer un sous-agent neuf par tâche.
- Garder une revue simple et directe après chaque livraison.

## Qualité

- Écrire le minimum nécessaire pour satisfaire le besoin.
- Vérifier le typecheck, le lint et le build quand c’est pertinent.
- Ne pas sur-optimiser.
- Ne pas multiplier les composants UI sans raison.

## Priorités

1. Simplicité
2. Clarté
3. Cohérence
4. Tests et vérifications
5. Extension future seulement si nécessaire
