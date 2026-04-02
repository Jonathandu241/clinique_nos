# Clinique NOS

Socle Next.js pour une application de gestion de rendez-vous clinique.

Nom technique du projet: `clinique-nos`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run format`

## Base de donnees

- Prisma est configure pour MySQL.
- La variable `DATABASE_URL` se trouve dans `.env` et `.env.example`.
- Commandes utiles:
  - `npx prisma validate`
  - `npx prisma generate`
  - `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`

## Statut

Le projet contient pour l'instant le socle applicatif uniquement.
