import prisma from '../lib/prisma';

export async function logAudit(userId: string | number | bigint | null, action: string, entityType: string, entityId: string | number | bigint | null, payload?: any, workstationId?: string) {
  try {
    let safePayload = payload;
    if (payload) {
      try {
        safePayload = JSON.parse(JSON.stringify(payload));
      } catch (e) {
        safePayload = { error: 'Payload could not be serialized' };
      }
    }

    await prisma.audit_log.create({
      data: {
        user_id: userId ? BigInt(userId) : null,
        action,
        entity_type: entityType,
        entity_id: entityId ? BigInt(entityId) : null,
        payload: safePayload,
        workstation_id: workstationId || 'system'
      }
    });
  } catch (error) {
    console.error('Failed to create audit log', error);
  }
}
