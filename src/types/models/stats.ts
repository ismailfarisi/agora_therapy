/**
 * Statistics Model
 * Platform statistics and analytics types
 */

export interface PlatformStats {
  users: {
    total: number;
    clients: number;
    therapists: number;
    active: number;
    newThisMonth: number;
  };
  appointments: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    todayCount: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    currency: string;
  };
  therapists: {
    verified: number;
    pending: number;
    active: number;
  };
}
