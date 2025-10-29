# Admin Panel Development Guide

## 📋 Overview

This document outlines the admin panel requirements, current status, and implementation roadmap for the Mindgood platform.

---

## 🎯 Current Status

### ✅ What's Already Built

1. **Firebase Integration**
   - Firestore database fully configured
   - Firebase Admin SDK integrated
   - Security rules with admin role support
   - Collections structure defined

2. **Authentication System**
   - Admin role support in user schema
   - Role-based middleware protection
   - Admin route protection (`/admin/*`)

3. **Admin Dashboard UI**
   - Basic dashboard layout (`/src/app/admin/page.tsx`)
   - Placeholder statistics cards
   - Navigation structure
   - System status indicators

4. **Database Schema**
   - All collections defined in TypeScript
   - Admin-specific collections (auditLogs, etc.)
   - Comprehensive security rules

### ❌ What Needs to Be Built

1. **User Management System**
2. **Therapist Verification Workflow**
3. **Appointment Management**
4. **Analytics & Reporting**
5. **System Configuration**
6. **Audit Log Viewer**

---

## 🏗️ Admin Panel Architecture

### Recommended Structure

```
src/app/admin/
├── page.tsx                    # ✅ Dashboard (exists)
├── users/
│   ├── page.tsx                # ❌ User list
│   ├── [userId]/
│   │   ├── page.tsx            # ❌ User details
│   │   └── edit/page.tsx       # ❌ Edit user
│   └── components/
│       ├── UserTable.tsx
│       ├── UserFilters.tsx
│       ├── UserActions.tsx
│       └── UserStats.tsx
│
├── therapists/
│   ├── page.tsx                # ❌ Therapist list
│   ├── pending/page.tsx        # ❌ Pending verifications
│   ├── [therapistId]/
│   │   ├── page.tsx            # ❌ Therapist details
│   │   └── verify/page.tsx     # ❌ Verification form
│   └── components/
│       ├── TherapistTable.tsx
│       ├── CredentialReview.tsx
│       ├── DocumentViewer.tsx
│       └── VerificationActions.tsx
│
├── appointments/
│   ├── page.tsx                # ❌ All appointments
│   ├── [appointmentId]/
│   │   └── page.tsx            # ❌ Appointment details
│   └── components/
│       ├── AppointmentTable.tsx
│       ├── AppointmentFilters.tsx
│       └── AppointmentActions.tsx
│
├── analytics/
│   ├── page.tsx                # ❌ Analytics dashboard
│   ├── users/page.tsx          # ❌ User analytics
│   ├── sessions/page.tsx       # ❌ Session analytics
│   ├── revenue/page.tsx        # ❌ Revenue reports
│   └── components/
│       ├── Chart.tsx
│       ├── StatCard.tsx
│       ├── TrendGraph.tsx
│       └── ReportExport.tsx
│
├── settings/
│   ├── page.tsx                # ❌ System settings
│   ├── timeslots/page.tsx      # ❌ Time slot management
│   └── components/
│       ├── SettingsForm.tsx
│       └── TimeSlotEditor.tsx
│
└── logs/
    ├── page.tsx                # ❌ Audit logs
    └── components/
        ├── LogTable.tsx
        └── LogFilters.tsx
```

---

## 🔧 Required Services

### Create: `/src/lib/services/admin/`

```typescript
// user-management-service.ts
export class UserManagementService {
  // Get all users with pagination and filters
  static async getAllUsers(filters?: UserFilters): Promise<User[]>
  
  // Get user by ID
  static async getUserById(userId: string): Promise<User>
  
  // Update user
  static async updateUser(userId: string, data: Partial<User>): Promise<void>
  
  // Suspend/activate user
  static async updateUserStatus(userId: string, status: UserStatus): Promise<void>
  
  // Delete user (soft delete)
  static async deleteUser(userId: string): Promise<void>
  
  // Get user statistics
  static async getUserStats(): Promise<UserStats>
}

// verification-service.ts
export class VerificationService {
  // Get pending verifications
  static async getPendingVerifications(): Promise<TherapistProfile[]>
  
  // Get therapist verification details
  static async getVerificationDetails(therapistId: string): Promise<VerificationDetails>
  
  // Approve therapist
  static async approveTherapist(therapistId: string, adminId: string): Promise<void>
  
  // Reject therapist
  static async rejectTherapist(therapistId: string, reason: string, adminId: string): Promise<void>
  
  // Get verification history
  static async getVerificationHistory(therapistId: string): Promise<VerificationHistory[]>
}

// appointment-admin-service.ts
export class AppointmentAdminService {
  // Get all appointments with filters
  static async getAllAppointments(filters?: AppointmentFilters): Promise<Appointment[]>
  
  // Cancel appointment (admin override)
  static async cancelAppointment(appointmentId: string, reason: string, adminId: string): Promise<void>
  
  // Get appointment statistics
  static async getAppointmentStats(dateRange?: DateRange): Promise<AppointmentStats>
  
  // Resolve appointment conflicts
  static async resolveConflict(appointmentId: string, resolution: ConflictResolution): Promise<void>
}

// analytics-service.ts
export class AnalyticsService {
  // Get platform statistics
  static async getPlatformStats(dateRange?: DateRange): Promise<PlatformStats>
  
  // Get user growth analytics
  static async getUserGrowth(period: 'daily' | 'weekly' | 'monthly'): Promise<GrowthData[]>
  
  // Get session analytics
  static async getSessionAnalytics(dateRange?: DateRange): Promise<SessionAnalytics>
  
  // Get revenue analytics
  static async getRevenueAnalytics(dateRange?: DateRange): Promise<RevenueAnalytics>
  
  // Export report
  static async exportReport(reportType: ReportType, format: 'csv' | 'pdf'): Promise<Blob>
}

// audit-service.ts
export class AuditService {
  // Log admin action
  static async logAction(action: AuditAction): Promise<void>
  
  // Get audit logs
  static async getAuditLogs(filters?: AuditFilters): Promise<AuditLog[]>
  
  // Get user activity
  static async getUserActivity(userId: string): Promise<AuditLog[]>
}
```

---

## 📊 Feature 1: User Management

### Page: `/src/app/admin/users/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { UserManagementService } from "@/lib/services/admin/user-management-service";
import { UserTable } from "./components/UserTable";
import { UserFilters } from "./components/UserFilters";
import { UserStats } from "./components/UserStats";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await UserManagementService.getAllUsers(filters);
    setUsers(data);
    setLoading(false);
  };

  const loadStats = async () => {
    const data = await UserManagementService.getUserStats();
    setStats(data);
  };

  const handleSuspendUser = async (userId: string) => {
    await UserManagementService.updateUserStatus(userId, "suspended");
    await loadUsers();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <UserStats stats={stats} />
      
      <UserFilters 
        filters={filters} 
        onChange={setFilters} 
      />
      
      <UserTable 
        users={users}
        loading={loading}
        onSuspend={handleSuspendUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
```

### Component: `UserTable.tsx`

```typescript
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/types/database";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onSuspend: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export function UserTable({ users, loading, onSuspend, onDelete }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.profile.displayName}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              {formatDate(user.metadata.createdAt)}
            </TableCell>
            <TableCell>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSuspend(user.id)}
              >
                Suspend
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(user.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 🔍 Feature 2: Therapist Verification

### Page: `/src/app/admin/therapists/pending/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { VerificationService } from "@/lib/services/admin/verification-service";
import { TherapistProfile } from "@/types/database";
import { VerificationCard } from "../components/VerificationCard";

export default function PendingVerificationsPage() {
  const [pending, setPending] = useState<TherapistProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    setLoading(true);
    const data = await VerificationService.getPendingVerifications();
    setPending(data);
    setLoading(false);
  };

  const handleApprove = async (therapistId: string) => {
    await VerificationService.approveTherapist(therapistId, currentAdminId);
    await loadPendingVerifications();
  };

  const handleReject = async (therapistId: string, reason: string) => {
    await VerificationService.rejectTherapist(therapistId, reason, currentAdminId);
    await loadPendingVerifications();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pending Verifications</h1>
      
      {pending.length === 0 ? (
        <p>No pending verifications</p>
      ) : (
        <div className="grid gap-6">
          {pending.map((therapist) => (
            <VerificationCard
              key={therapist.id}
              therapist={therapist}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Component: `VerificationCard.tsx`

```typescript
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TherapistProfile } from "@/types/database";
import { DocumentViewer } from "./DocumentViewer";

interface VerificationCardProps {
  therapist: TherapistProfile;
  onApprove: (therapistId: string) => void;
  onReject: (therapistId: string, reason: string) => void;
}

export function VerificationCard({ therapist, onApprove, onReject }: VerificationCardProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {therapist.practice.bio}
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">License Number</p>
            <p className="font-medium">{therapist.credentials.licenseNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">License State</p>
            <p className="font-medium">{therapist.credentials.licenseState}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Years Experience</p>
            <p className="font-medium">{therapist.practice.yearsExperience}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Specializations</p>
            <p className="font-medium">
              {therapist.credentials.specializations.join(", ")}
            </p>
          </div>
        </div>

        <DocumentViewer therapistId={therapist.id} />

        <div className="flex gap-2 mt-4">
          <Button 
            variant="default" 
            onClick={() => onApprove(therapist.id)}
          >
            Approve
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShowRejectDialog(true)}
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📈 Feature 3: Analytics Dashboard

### Page: `/src/app/admin/analytics/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { AnalyticsService } from "@/lib/services/admin/analytics-service";
import { StatCard } from "./components/StatCard";
import { TrendGraph } from "./components/TrendGraph";
import { ReportExport } from "./components/ReportExport";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<GrowthData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    const platformStats = await AnalyticsService.getPlatformStats(dateRange);
    const growth = await AnalyticsService.getUserGrowth('daily');
    setStats(platformStats);
    setUserGrowth(growth);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <ReportExport />
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          change={stats?.userGrowth || 0}
          icon="users"
        />
        <StatCard
          title="Active Therapists"
          value={stats?.activeTherapists || 0}
          change={stats?.therapistGrowth || 0}
          icon="shield"
        />
        <StatCard
          title="Total Sessions"
          value={stats?.totalSessions || 0}
          change={stats?.sessionGrowth || 0}
          icon="calendar"
        />
        <StatCard
          title="Revenue"
          value={`$${stats?.revenue || 0}`}
          change={stats?.revenueGrowth || 0}
          icon="dollar"
        />
      </div>

      <TrendGraph data={userGrowth} title="User Growth" />
    </div>
  );
}
```

---

## 🔗 Integration with Frontend (mindgood)

### Architecture Options

#### Option 1: Shared Firebase Project (Recommended)

```
Frontend (mindgood)
├── Uses Firebase Client SDK
├── Reads from Firestore directly
├── Handles client/therapist authentication
└── Displays therapist profiles, booking

Backend/Admin (agora_therapy)
├── Uses Firebase Admin SDK
├── Admin operations (verify, suspend, etc.)
├── Analytics and reporting
└── System configuration
```

**Pros**:
- Single source of truth (one Firebase project)
- Real-time sync between frontend and admin
- Simpler architecture

**Cons**:
- Frontend and admin share same database
- Need careful security rules

#### Option 2: API Layer

```
Frontend (mindgood)
├── Calls REST API endpoints
└── No direct Firebase access

Backend/Admin (agora_therapy)
├── Exposes REST API
├── Handles all Firebase operations
└── Admin panel
```

**Pros**:
- Better separation of concerns
- More control over data access
- Can add caching, rate limiting

**Cons**:
- More complex architecture
- Additional API development needed

### Recommended Approach: Hybrid

```
Frontend (mindgood)
├── Firebase Client SDK for read operations
├── API calls for write operations
└── Firebase Auth for authentication

Backend/Admin (agora_therapy)
├── Firebase Admin SDK
├── REST API for frontend
└── Admin panel
```

### Required API Endpoints

Create: `/src/app/api/v1/`

```
api/v1/
├── therapists/
│   ├── route.ts                # GET /api/v1/therapists (list)
│   └── [id]/route.ts           # GET /api/v1/therapists/:id (details)
│
├── appointments/
│   ├── route.ts                # POST /api/v1/appointments (create)
│   └── [id]/
│       ├── route.ts            # GET, PUT, DELETE
│       └── cancel/route.ts     # POST /api/v1/appointments/:id/cancel
│
├── availability/
│   └── [therapistId]/route.ts  # GET /api/v1/availability/:therapistId
│
└── auth/
    ├── register/route.ts       # POST /api/v1/auth/register
    └── verify/route.ts         # POST /api/v1/auth/verify
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Admin Features (2-3 weeks)

1. **Week 1: User Management**
   - [ ] Create user management service
   - [ ] Build user list page
   - [ ] Implement user filters
   - [ ] Add suspend/activate functionality
   - [ ] Create user details page

2. **Week 2: Therapist Verification**
   - [ ] Create verification service
   - [ ] Build pending verifications page
   - [ ] Implement document viewer
   - [ ] Add approve/reject workflow
   - [ ] Create verification history

3. **Week 3: Appointment Management**
   - [ ] Create appointment admin service
   - [ ] Build appointments list page
   - [ ] Implement appointment filters
   - [ ] Add cancel/modify functionality
   - [ ] Create appointment details page

### Phase 2: Analytics & Reporting (2 weeks)

4. **Week 4: Analytics Dashboard**
   - [ ] Create analytics service
   - [ ] Build analytics dashboard
   - [ ] Implement stat cards
   - [ ] Add trend graphs
   - [ ] Create date range filters

5. **Week 5: Reports & Export**
   - [ ] Implement report generation
   - [ ] Add CSV export
   - [ ] Add PDF export
   - [ ] Create scheduled reports
   - [ ] Build report templates

### Phase 3: API & Integration (1-2 weeks)

6. **Week 6: REST API**
   - [ ] Create API routes structure
   - [ ] Implement authentication middleware
   - [ ] Build CRUD endpoints
   - [ ] Add rate limiting
   - [ ] Create API documentation

7. **Week 7: Frontend Integration**
   - [ ] Connect frontend to API
   - [ ] Test end-to-end flows
   - [ ] Implement error handling
   - [ ] Add loading states
   - [ ] Performance optimization

---

## 📝 Development Checklist

### Before Starting

- [ ] Review existing codebase
- [ ] Understand Firebase structure
- [ ] Set up development environment
- [ ] Create admin test account
- [ ] Review security rules

### During Development

- [ ] Write TypeScript types first
- [ ] Create service layer before UI
- [ ] Test with Firebase emulator
- [ ] Follow existing code patterns
- [ ] Add error handling
- [ ] Implement loading states
- [ ] Add audit logging

### Before Deployment

- [ ] Test all admin features
- [ ] Verify security rules
- [ ] Check performance
- [ ] Review audit logs
- [ ] Test API endpoints
- [ ] Update documentation

---

## 🔒 Security Considerations

1. **Admin Authentication**
   - Only users with role="admin" can access
   - Verify admin status on every request
   - Use Firebase Admin SDK for sensitive operations

2. **Audit Logging**
   - Log all admin actions
   - Include timestamp, admin ID, action type
   - Store in separate audit collection

3. **Data Validation**
   - Validate all inputs
   - Use Zod schemas
   - Sanitize user-generated content

4. **Rate Limiting**
   - Limit API requests per admin
   - Prevent abuse
   - Monitor suspicious activity

---

## 📚 Resources

- **Firebase Admin SDK**: https://firebase.google.com/docs/admin/setup
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **TanStack Table**: https://tanstack.com/table/latest (for data tables)
- **Recharts**: https://recharts.org/ (for analytics graphs)

---

**Last Updated**: 2025-10-24
