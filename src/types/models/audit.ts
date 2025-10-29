/**
 * Audit Model
 * Audit logging types
 */

import { Timestamp } from "firebase/firestore";

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}
