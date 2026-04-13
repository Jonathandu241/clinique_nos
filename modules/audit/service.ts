/// Service pour centraliser la logique métier liée à l'audit.

import { createAuditLog } from "./repository";

/**
 * Enregistre une action dans le journal d'audit.
 */
export const auditService = {
  log: async (params: {
    entityType: "appointment" | "payment" | "user" | "availability";
    entityId: string;
    action: string;
    actorUserId?: string | null;
    metadata?: any;
  }) => {
    try {
      await createAuditLog({
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        actorUserId: params.actorUserId,
        metadataJson: params.metadata,
      });
    } catch (error) {
      // On ne bloque pas le flux principal pour une erreur d'audit
      console.error("[AUDIT_ERROR] Failed to write log:", error);
    }
  }
};
