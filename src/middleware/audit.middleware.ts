import { Request, Response, NextFunction } from 'express';
import { logAudit } from '../services/audit.service';

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only intercept mutating requests
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
    return next();
  }

  // Intercept response send/json to log only on success and to capture response body (e.g. created IDs)
  const originalJson = res.json;
  
  res.json = function (body) {
    // Only log if successful
    if (res.statusCode >= 200 && res.statusCode < 300) {
      
      const userId = req.user?.userId;
      
      // Attempt to extract caseId from url params, or body, or response
      const caseId = req.params?.caseId || req.params?.id || req.body?.case_id || body?.case_id || null;
      
      // Determine entity type from URL (e.g., /api/cases/1/media -> media)
      const urlParts = req.originalUrl.split('?')[0].split('/').filter(Boolean);
      
      let entityType = urlParts[urlParts.length - 1] || 'unknown';
      if (caseId && entityType === caseId.toString()) {
        entityType = urlParts[urlParts.length - 2] || 'case';
      }

      // Generate action name
      let actionType = 'UPDATE';
      if (req.method === 'POST') actionType = 'CREATE';
      if (req.method === 'DELETE') actionType = 'DELETE';
      
      const action = `${actionType}_${entityType.toUpperCase().replace(/-/g, '_')}`;

      // Ensure all case-related logs are easily queryable by the case ID
      const finalEntityType = caseId ? 'case' : entityType;
      const finalEntityId = caseId || body?.id || body?.user_id || body?.police_station_id || null;

      // Ensure we don't crash the response loop
      setImmediate(() => {
        logAudit(
          userId ? BigInt(userId) : null,
          action,
          finalEntityType,
          finalEntityId ? BigInt(finalEntityId) : null,
          { target_entity: entityType, url: req.originalUrl, method: req.method, reqBody: req.body },
          req.ip
        ).catch(err => console.error('Failed to auto-log audit:', err));
      });
    }

    return originalJson.call(this, body);
  };

  next();
}
