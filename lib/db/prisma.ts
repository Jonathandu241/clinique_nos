/// Client Prisma partagé côté serveur pour Clinique NOS.

import { PrismaClient } from ".prisma/client/default";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Réutilise l'instance en développement pour éviter les connexions multiples.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

// Stocke l'instance sur globalThis uniquement en mode développement.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
