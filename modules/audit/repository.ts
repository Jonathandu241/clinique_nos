/// Repository pour la gestion des journaux d'audit (Audit Logs).

import { mysqlPool } from "@/lib/db/mysql";
import { AuditAction } from "@prisma/client";

/**
 * Insère une nouvelle entrée dans le journal d'audit.
 */
export async function createAuditLog(data: {
  entityType: string;
  entityId: string;
  action: AuditAction | string;
  actorUserId?: string | null;
  metadataJson?: any;
}) {
  const [result] = await mysqlPool.execute(
    `INSERT INTO journaux_audit 
      (id, entity_type, entity_id, action, actor_user_id, metadata_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      crypto.randomUUID(), // Utilisation de UUID pour la cohérence avec le reste du projet
      data.entityType,
      data.entityId,
      data.action,
      data.actorUserId || null,
      data.metadataJson ? JSON.stringify(data.metadataJson) : null
    ]
  );
  return result;
}
