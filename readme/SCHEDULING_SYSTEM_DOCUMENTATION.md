# Therapy Platform Scheduling System Documentation

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Service Layer Architecture](#service-layer-architecture)
3. [Component Documentation](#component-documentation)
4. [Key Features](#key-features)
5. [Usage Guide](#usage-guide)
6. [Technical Specifications](#technical-specifications)
7. [Integration Guide](#integration-guide)

---

## System Architecture Overview

The therapy platform scheduling system is a comprehensive, real-time booking solution designed to handle complex scheduling scenarios with timezone support, group sessions, and conflict prevention.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                                  │
├─────────────────────┬─────────────────────┬─────────────────────┤
│   Therapist UI      │    Client UI        │   Admin UI          │
│  - AvailabilityCalendar │ - BookingFlow   │  - System Config    │
│  - RecurringSchedule    │ - BookingCalendar │ - Analytics       │
│  - TimeSlotPicker      │ - TimeSlotSelector │ - Management      │
└─────────────────────┼─────────────────────┼─────────────────────┘
                      │                     │
┌─────────────────────┼─────────────────────┼─────────────────────┐
│                    HOOKS & UTILITIES                            │
│  - useRealtimeAvailability                                      │
│  - useAuth                                                      │
│  - timezone-utils                                               │
│  - booking-utils                                                │
└─────────────────────┼─────────────────────┼─────────────────────┘
                      │                     │
┌─────────────────────┼─────────────────────┼─────────────────────┐
│                    SERVICE LAYER                                │
│  ┌─────────────────┬────────────────────┬───────────────────┐   │
│  │ AppointmentService │ AvailabilityService │ TimeSlotService │   │
│  │ - Booking Logic    │ - Schedule Mgmt     │ - Time Management │   │
│  │ - Conflict Check   │ - Timezone Handling │ - Validation      │   │
│  │ - Group Sessions   │ - Recurring Patterns│ - Deletion Guards │   │
│  └─────────────────┴────────────────────┴───────────────────┘   │
└─────────────────────┼─────────────────────┼─────────────────────┘
                      │                     │
┌─────────────────────┼─────────────────────┼─────────────────────┐
│                    DATA LAYER (Firebase/Firestore)             │
│  ┌─────────────────┬────────────────────┬───────────────────┐   │
│  │   Collections   │   Security Rules   │   Real-time Sync  │   │
│  │ - appointments  │ - Role-based Auth  │ - Live Updates    │   │
│  │ - availability  │ - Data Validation  │ - Conflict Detect │   │
│  │ - timeSlots     │ - Access Control   │ - State Management│   │
│  │ - overrides     │ - Audit Logging    │ - Error Recovery  │   │
│  └─────────────────┴────────────────────┴───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
Client Request → Authentication → Service Layer → Data Validation →
Firestore → Real-time Sync → UI Updates → Conflict Detection
     ↓                                              ↑
Error Handling ←─ Retry Logic ←─ State Recovery ←─ Event Stream
```

### Real-time Subscription Patterns

```
Component Mount → Subscribe to Collections → Listen for Changes →
Update Local State → Emit Events → Handle Conflicts → Re-sync
```

---

## Service Layer Architecture

### AppointmentService

**Location**: [`src/lib/services/appointment-service.ts`](src/lib/services/appointment-service.ts)

The core service for managing appointments with enhanced group session support and conflict detection.

#### Key Methods

```typescript
// Comprehensive booking conflict detection
static async checkBookingConflicts(
  bookingRequest: BookingRequest
): Promise<BookingConflict[]>

// Enhanced appointment creation with transaction support
static async createAppointment(
  bookingRequest: BookingRequest
): Promise<AppointmentBookingResult>

// Group session capacity management
static async checkGroupSessionAvailability(
  therapistId: string,
  timeSlotId: string,
  date: Date,
  requestedClients: number = 1
): Promise<{ available: boolean; spotsRemaining: number }>

// Real-time subscription management
static subscribeToTherapistAppointments(
  therapistId: string,
  callback: (appointments: Appointment[]) => void
): () => void
```

#### Conflict Detection Logic

```typescript
// Enhanced conflict detection supports:
- Time overlap prevention
- Group session capacity limits (max 8 clients)
- Mixed session type prevention
- Advance booking validation
- Therapist availability verification
```

#### Group Session Support

```typescript
const sessionTypeLimits = {
  individual: 1, // 1-on-1 sessions
  consultation: 1, // Initial consultations
  follow_up: 1, // Follow-up sessions
  group: 8, // Group therapy (up to 8 clients)
};
```

### AvailabilityService

**Location**: [`src/lib/services/availability-service.ts`](src/lib/services/availability-service.ts)

Manages therapist availability with sophisticated timezone handling and recurring schedule support.

#### Key Features

```typescript
// Multi-timezone availability calculation
static async getAvailabilityForDate(
  therapistId: string,
  date: Date,
  therapistTimezone?: string,
  clientTimezone?: string
): Promise<{
  available: TherapistAvailability[];
  overrides: ScheduleOverride[];
  effectiveSlots: string[];
}>

// Recurring schedule patterns
static async setWeeklySchedule(
  therapistId: string,
  weeklySchedule: { [dayOfWeek: number]: string[] },
  recurringPattern: 'weekly' | 'biweekly' | 'monthly'
): Promise<string[]>

// Schedule override management
static async createScheduleOverride(
  overrideData: Omit<ScheduleOverride, 'id'>
): Promise<string>
```

#### Recurring Pattern Support

```typescript
interface RecurringPattern {
  type: "weekly" | "biweekly" | "monthly";
  monthlyConfig?: {
    type: "dayOfMonth" | "weekOfMonth";
    dayOfMonth?: number; // 1-28
    weekOfMonth?: number; // 1-4
    dayOfWeek?: number; // 0-6
  };
}
```

### TimeSlotService

**Location**: [`src/lib/services/timeslot-service.ts`](src/lib/services/timeslot-service.ts)

Manages time slots with comprehensive validation and deletion safeguards.

#### Key Safety Features

```typescript
// Deletion safeguards prevent data corruption
private static async validateTimeSlotDeletion(
  timeSlotId: string
): Promise<void> {
  // Check for:
  // - Active appointments using this slot
  // - Therapist availability references
  // - Schedule overrides

  if (hasActiveAppointments) {
    throw new Error(`Cannot delete time slot. Used by ${count} appointments`);
  }
}

// Automatic time slot generation
static async generateStandardTimeSlots(
  startTime: string,    // "09:00"
  endTime: string,      // "17:00"
  intervalMinutes: number = 60,
  duration: number = 60
): Promise<string[]>
```

### useRealtimeAvailability Hook

**Location**: [`src/lib/hooks/useRealtimeAvailability.ts`](src/lib/hooks/useRealtimeAvailability.ts)

Advanced React hook providing real-time availability updates with comprehensive error handling.

#### Features

```typescript
interface UseRealtimeAvailabilityOptions {
  therapistId: string;
  enableRealtime?: boolean; // Default: true
  debounceMs?: number; // Default: 300ms
  includeOverrides?: boolean; // Default: true
  dateRange?: { from: Date; to: Date };
  retryAttempts?: number; // Default: 3
  retryDelay?: number; // Default: 1000ms
  staleDataThreshold?: number; // Default: 5 minutes
  enableConnectionAwareness?: boolean; // Default: true
}

// Returns comprehensive state and utilities
const {
  availability, // Live availability data
  appointments, // Real-time appointments
  overrides, // Schedule overrides
  isLoading, // Loading state
  error, // Error information
  connectionStatus, // Connection health
  getAvailableSlots, // Get slots for specific date
  isSlotAvailable, // Check slot availability
  refresh, // Manual refresh
  retry, // Retry failed operations
} = useRealtimeAvailability(options);
```

#### Error Handling & Recovery

```typescript
interface AvailabilityError {
  type: "connection" | "subscription" | "data" | "validation";
  message: string;
  timestamp: Date;
  isRetryable: boolean;
  retryCount?: number;
}

// Automatic retry with exponential backoff
const delay = retryDelay * Math.pow(2, retryCount);
```

---

## Component Documentation

### Therapist Components

#### AvailabilityCalendar

**Location**: [`src/components/schedule/AvailabilityCalendar.tsx`](src/components/schedule/AvailabilityCalendar.tsx)

Interactive calendar for therapists to manage availability with drag-and-drop functionality.

```typescript
interface AvailabilityCalendarProps {
  therapistId: string;
  availability: TherapistAvailability[];
  overrides: ScheduleOverride[];
  timeSlots: TimeSlot[];
  onDateClick?: (date: Date) => void;
  onAvailabilityChange?: (dayOfWeek: number, timeSlotIds: string[]) => void;
  onOverrideCreate?: (date: Date) => void;
  view?: "month" | "week" | "day";
  selectedDate?: Date;
  className?: string;
}

// Usage Example
<AvailabilityCalendar
  therapistId="therapist-123"
  availability={availability}
  overrides={overrides}
  timeSlots={timeSlots}
  onAvailabilityChange={(day, slots) => {
    // Update availability for specific day
    handleAvailabilityChange(day, slots);
  }}
  onOverrideCreate={(date) => {
    // Create schedule override
    showOverrideDialog(date);
  }}
/>;
```

#### RecurringScheduleSetup

**Location**: [`src/components/schedule/RecurringScheduleSetup.tsx`](src/components/schedule/RecurringScheduleSetup.tsx)

Comprehensive wizard for setting up recurring schedules with multiple pattern support.

```typescript
interface RecurringScheduleSetupProps {
  timeSlots: TimeSlot[];
  existingAvailability?: TherapistAvailability[];
  onComplete?: (schedule: RecurringScheduleData) => void;
  onCancel?: () => void;
  className?: string;
}

interface RecurringScheduleData {
  pattern: "weekly" | "biweekly" | "monthly";
  schedule: { [dayOfWeek: number]: string[] };
  monthlyConfig?: {
    type: "dayOfMonth" | "weekOfMonth";
    dayOfMonth?: number;
    weekOfMonth?: number;
    dayOfWeek?: number;
  };
}

// Usage Example
<RecurringScheduleSetup
  timeSlots={timeSlots}
  existingAvailability={currentAvailability}
  onComplete={(schedule) => {
    // Apply the recurring schedule
    await AvailabilityService.setWeeklySchedule(
      therapistId,
      schedule.schedule,
      { type: schedule.pattern, ...schedule.monthlyConfig }
    );
  }}
  onCancel={handleCancel}
/>;
```

#### TimeSlotPicker

**Location**: [`src/components/schedule/TimeSlotPicker.tsx`](src/components/schedule/TimeSlotPicker.tsx)

Advanced time slot selection component with grouping and validation.

### Client Components

#### BookingFlow

**Location**: [`src/components/booking/BookingFlow.tsx`](src/components/booking/BookingFlow.tsx)

4-step booking wizard with comprehensive error handling and real-time validation.

```typescript
interface BookingFlowProps {
  therapist: TherapistProfile;
  onBookingComplete?: (bookingId: string) => void;
  onCancel?: () => void;
  className?: string;
}

// 4-Step Process:
// 1. Calendar - Date selection
// 2. TimeSlot - Time and session type selection
// 3. Confirmation - Review and notes
// 4. Success - Booking confirmation

// Usage Example
<BookingFlow
  therapist={therapistProfile}
  onBookingComplete={(bookingId) => {
    // Handle successful booking
    toast.success("Appointment booked successfully!");
    router.push(`/appointments/${bookingId}`);
  }}
  onCancel={() => {
    // Handle cancellation
    router.back();
  }}
/>;
```

#### BookingCalendar

**Location**: [`src/components/booking/BookingCalendar.tsx`](src/components/booking/BookingCalendar.tsx)

Client-facing calendar with real-time availability display and timezone awareness.

```typescript
interface BookingCalendarProps {
  therapist: TherapistProfile;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  clientTimezone?: string;
  minBookingAdvanceHours?: number;
}

// Features:
// - Real-time availability updates
// - Timezone conversion
// - Minimum advance booking validation
// - Available slot count display
```

#### TimeSlotSelector

**Location**: [`src/components/booking/TimeSlotSelector.tsx`](src/components/booking/TimeSlotSelector.tsx)

Displays available time slots with pricing and session type options.

#### BookingConfirmation

**Location**: [`src/components/booking/BookingConfirmation.tsx`](src/components/booking/BookingConfirmation.tsx)

Final confirmation step with appointment summary and payment information.

### Integration Components

#### BookingSystemTest

**Location**: [`src/components/BookingSystemTest.tsx`](src/components/BookingSystemTest.tsx)

Comprehensive test suite with 20+ test scenarios covering all aspects of the booking system.

```typescript
// Test Suites:
1. Service Layer Integration Tests (4 tests)
2. Real-time Availability Tests (4 tests)
3. Booking Flow Integration Tests (4 tests)
4. Component Integration Tests (4 tests)
5. Edge Case Tests (4 tests)

// Usage Example
<BookingSystemTest />
```

---

## Key Features

### Real-time Updates

The system provides live updates to prevent booking conflicts and ensure data consistency.

#### Implementation

```typescript
// Real-time appointment visibility
const { appointments } = useRealtimeAvailability({
  therapistId,
  enableRealtime: true,
});

// Subscription management
useEffect(() => {
  const unsubscribe = AppointmentService.subscribeToTherapistAppointments(
    therapistId,
    (appointments) => {
      // Update UI with latest appointments
      setAppointments(appointments);
    }
  );

  return unsubscribe;
}, [therapistId]);
```

#### Conflict Prevention

```typescript
// Real-time conflict detection
const conflicts = await AppointmentService.checkBookingConflicts({
  therapistId,
  clientId,
  timeSlotId,
  date,
  duration,
  sessionType,
});

if (conflicts.length > 0) {
  throw new Error(conflicts[0].message);
}
```

### Timezone Handling

Multi-timezone support for global therapy practice with automatic conversion.

#### Features

```typescript
// 12 common timezones supported
export const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time" },
  // ... more timezones
];

// Automatic timezone conversion
export function convertAvailabilityTimeSlots(
  timeSlots: string[],
  date: string,
  sourceTimezone: string,
  targetTimezone: string,
  allTimeSlots: TimeSlot[]
): string[];
```

#### Client-Therapist Timezone Scenarios

```typescript
// Scenario 1: Same timezone
therapist: "America/New_York", client: "America/New_York"
// → No conversion needed

// Scenario 2: Different timezones
therapist: "America/Los_Angeles", client: "Europe/London"
// → Automatic time slot conversion

// Scenario 3: DST transitions
// → Handled automatically by Intl.DateTimeFormat
```

### Group Sessions

Support for group therapy sessions with capacity management.

#### Capacity Management

```typescript
// Group session limits
const GROUP_SESSION_CAPACITY = 8;

// Check availability
const { available, spotsRemaining } =
  await AppointmentService.checkGroupSessionAvailability(
    therapistId,
    timeSlotId,
    date,
    1
  );

if (!available) {
  throw new Error(`Group session full. ${spotsRemaining} spots remaining.`);
}
```

#### Booking Logic

```typescript
// Prevent mixed session types
if (existingSessionType === "individual" && requestedType === "group") {
  throw new Error("Cannot mix individual and group sessions");
}

// Capacity validation
if (groupClientCount >= MAX_GROUP_CAPACITY) {
  throw new Error("Group session capacity exceeded");
}
```

### Recurring Patterns

Sophisticated recurring schedule support with multiple patterns.

#### Pattern Types

```typescript
// Weekly: Same schedule every week
pattern: 'weekly'

// Bi-weekly: Every two weeks
pattern: 'biweekly'

// Monthly: Same pattern each month
pattern: 'monthly'
monthlyConfig: {
  type: 'dayOfMonth',    // 15th of every month
  dayOfMonth: 15
}

// OR

monthlyConfig: {
  type: 'weekOfMonth',   // 2nd Tuesday of every month
  weekOfMonth: 2,
  dayOfWeek: 2
}
```

#### Schedule Application

```typescript
// Apply recurring schedule
const scheduleIds = await AvailabilityService.setWeeklySchedule(
  therapistId,
  {
    1: ["slot-09-00", "slot-10-00"], // Monday
    2: ["slot-14-00", "slot-15-00"], // Tuesday
    // ... other days
  },
  { type: "weekly" }
);
```

### Data Integrity

Comprehensive safeguards to prevent data corruption and scheduling conflicts.

#### Time Slot Deletion Protection

```typescript
// Check for dependencies before deletion
await TimeSlotService.validateTimeSlotDeletion(timeSlotId);

// Prevents deletion if:
// 1. Active appointments exist
// 2. Therapist availability references exist
// 3. Schedule overrides reference the slot

if (hasActiveReferences) {
  throw new Error("Cannot delete: Time slot is in use");
}
```

#### Transaction-based Operations

```typescript
// Atomic appointment creation
await runTransaction(db, async (transaction) => {
  // 1. Double-check conflicts
  const conflicts = await checkBookingConflicts(request);
  if (conflicts.length > 0) {
    throw new Error("Booking conflicts detected");
  }

  // 2. Create appointment
  transaction.set(appointmentRef, appointmentData);
});
```

---

## Usage Guide

### Therapist Workflow

#### 1. Initial Setup

```typescript
// 1. Complete profile setup
const therapistProfile = {
  credentials: {
    licenseNumber: "LIC12345",
    licenseState: "CA",
    specializations: ["Anxiety", "Depression"],
  },
  practice: {
    hourlyRate: 150,
    currency: "USD",
    sessionTypes: ["individual", "group"],
  },
  availability: {
    timezone: "America/Los_Angeles",
    bufferMinutes: 15,
    maxDailyHours: 8,
  },
};
```

#### 2. Set Recurring Schedule

```typescript
// Use RecurringScheduleSetup component
<RecurringScheduleSetup
  timeSlots={standardTimeSlots}
  onComplete={async (schedule) => {
    await AvailabilityService.setWeeklySchedule(
      therapistId,
      schedule.schedule,
      { type: schedule.pattern }
    );
  }}
/>
```

#### 3. Manage Availability

```typescript
// Real-time availability management
const { availability, appointments } = useRealtimeAvailability({
  therapistId,
  includeOverrides: true,
});

// Create schedule overrides
await AvailabilityService.createScheduleOverride({
  therapistId,
  date: Timestamp.fromDate(vacationDate),
  type: "day_off",
  reason: "Personal day",
});
```

#### 4. Monitor Bookings

```typescript
// Subscribe to appointments
useEffect(() => {
  return AppointmentService.subscribeToTherapistAppointments(
    therapistId,
    (appointments) => {
      // Handle new bookings
      const pendingBookings = appointments.filter(
        (apt) => apt.status === "pending"
      );

      setPendingCount(pendingBookings.length);
    }
  );
}, [therapistId]);
```

### Client Workflow

#### 1. Find Therapists

```typescript
// Search and filter therapists
const therapists = await TherapistService.searchTherapists({
  specializations: ["anxiety"],
  sessionTypes: ["individual"],
  priceRange: { min: 100, max: 200 },
});
```

#### 2. Book Appointment

```typescript
// Use BookingFlow component
<BookingFlow
  therapist={selectedTherapist}
  onBookingComplete={(bookingId) => {
    // Booking successful
    toast.success("Appointment booked!");
    navigateToConfirmation(bookingId);
  }}
  onCancel={() => {
    // Return to therapist selection
    router.back();
  }}
/>
```

#### 3. Manage Appointments

```typescript
// View client appointments
const { appointments } = useRealtimeAppointments({
  clientId: user.uid,
  includeUpcoming: true,
});

// Cancel appointment
await AppointmentService.cancelAppointment(
  appointmentId,
  "Schedule conflict",
  "client"
);
```

### Admin Workflow

#### 1. System Configuration

```typescript
// Time slot management
await TimeSlotService.generateStandardTimeSlots(
  "09:00", // Start time
  "17:00", // End time
  60, // Interval minutes
  60 // Duration minutes
);
```

#### 2. Monitor System Health

```typescript
// Use BookingSystemTest for monitoring
<BookingSystemTest />;

// Check system metrics
const stats = await AppointmentService.getAppointmentStats("system", "admin");
```

### Developer Integration Guide

#### 1. Setup Dependencies

```bash
npm install date-fns date-fns-tz
npm install firebase
npm install @types/react
```

#### 2. Initialize Firebase

```typescript
// src/lib/firebase/client.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Your config
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

#### 3. Implement Authentication

```typescript
// Wrap app with authentication
function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

#### 4. Use Scheduling Components

```typescript
// Import and use components
import { BookingFlow } from "@/components/booking/BookingFlow";
import { AvailabilityCalendar } from "@/components/schedule/AvailabilityCalendar";
import { useRealtimeAvailability } from "@/lib/hooks/useRealtimeAvailability";

// Example implementation
function TherapistDashboard({ therapistId }) {
  const { availability, isLoading } = useRealtimeAvailability({
    therapistId,
    enableRealtime: true,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <AvailabilityCalendar
      therapistId={therapistId}
      availability={availability}
      // ... other props
    />
  );
}
```

---

## Technical Specifications

### Database Schema

#### Collections Overview

```typescript
// Core Collections
- users/                    // User profiles and authentication
- therapistProfiles/        // Extended therapist information
- appointments/             // Appointment bookings
- therapistAvailability/    // Weekly availability patterns
- scheduleOverrides/        // Date-specific schedule changes
- timeSlots/                // Time slot definitions
- notifications/            // System notifications
- paymentIntents/           // Payment processing
- auditLogs/               // System audit trail

// Real-time Collections
- videoSessions/           // Active video session management
- realtimeSync/            // Real-time synchronization data
- therapistStatus/         // Online status and availability
- performanceMetrics/      // System performance monitoring
```

#### Key Data Relationships

```typescript
// User → TherapistProfile (1:1 for therapists)
users/{uid} → therapistProfiles/{uid}

// Therapist → Availability (1:many)
therapistProfiles/{id} → therapistAvailability/{docId}

// Therapist → Appointments (1:many)
therapistProfiles/{id} → appointments/{docId}

// Client → Appointments (1:many)
users/{uid} → appointments/{docId}

// TimeSlot → Availability (1:many)
timeSlots/{id} → therapistAvailability/{docId}

// Appointment → Messages (1:many)
appointments/{id}/messages/{messageId}
```

#### Core Interfaces

```typescript
interface Appointment {
  id: string;
  therapistId: string;
  clientId: string;
  scheduledFor: Timestamp;
  timeSlotId: string;
  duration: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

  session: {
    type: "individual" | "group" | "consultation" | "follow_up";
    deliveryType: "video" | "phone" | "in_person";
    platform?: "agora" | "zoom" | "teams";
    channelId?: string;
  };

  payment: {
    amount: number;
    currency: string;
    status: "pending" | "paid" | "refunded" | "failed";
  };

  communication: {
    clientNotes?: string;
    therapistNotes?: string;
    remindersSent: {
      email: Timestamp[];
      sms: Timestamp[];
    };
  };
}

interface TherapistAvailability {
  id: string;
  therapistId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeSlotId: string;
  status: "available" | "unavailable";
  maxConcurrentClients: number;

  recurringPattern: {
    type: "weekly" | "biweekly" | "monthly";
    endDate?: Timestamp;
  };
}

interface ScheduleOverride {
  id: string;
  therapistId: string;
  date: Timestamp;
  type: "day_off" | "custom_hours" | "time_off";
  affectedSlots?: string[];
  reason: string;
  isRecurring: boolean;
  recurringUntil?: Timestamp;
}
```

### API Interfaces

#### AppointmentService API

```typescript
class AppointmentService {
  // Booking management
  static async checkBookingConflicts(
    request: BookingRequest
  ): Promise<BookingConflict[]>;
  static async createAppointment(
    request: BookingRequest
  ): Promise<AppointmentBookingResult>;
  static async rescheduleAppointment(
    id: string,
    newRequest: Partial<BookingRequest>
  ): Promise<AppointmentBookingResult>;
  static async cancelAppointment(
    id: string,
    reason: string,
    cancelledBy: string
  ): Promise<void>;

  // Group session support
  static async checkGroupSessionAvailability(
    therapistId: string,
    timeSlotId: string,
    date: Date,
    clients: number
  ): Promise<{ available: boolean; spotsRemaining: number }>;

  // Queries
  static async getAppointment(id: string): Promise<Appointment | null>;
  static async getClientAppointments(
    clientId: string,
    status?: AppointmentStatus
  ): Promise<Appointment[]>;
  static async getTherapistAppointments(
    therapistId: string,
    status?: AppointmentStatus
  ): Promise<Appointment[]>;
  static async getAppointmentsInRange(
    therapistId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]>;

  // Real-time subscriptions
  static subscribeToClientAppointments(
    clientId: string,
    callback: (appointments: Appointment[]) => void
  ): () => void;
  static subscribeToTherapistAppointments(
    therapistId: string,
    callback: (appointments: Appointment[]) => void
  ): () => void;

  // Statistics
  static async getAppointmentStats(
    userId: string,
    userType: "client" | "therapist"
  ): Promise<AppointmentStats>;
  static async getUpcomingAppointments(
    userId: string,
    userType: "client" | "therapist"
  ): Promise<Appointment[]>;
}
```

#### AvailabilityService API

```typescript
class AvailabilityService {
  // Availability management
  static async getTherapistAvailability(
    therapistId: string
  ): Promise<TherapistAvailability[]>;
  static async getAvailabilityForDay(
    therapistId: string,
    dayOfWeek: number
  ): Promise<TherapistAvailability[]>;
  static async getAvailabilityForDate(
    therapistId: string,
    date: Date,
    therapistTz?: string,
    clientTz?: string
  ): Promise<{
    available: TherapistAvailability[];
    overrides: ScheduleOverride[];
    effectiveSlots: string[];
  }>;

  // CRUD operations
  static async createAvailability(
    data: Omit<TherapistAvailability, "id">
  ): Promise<string>;
  static async updateAvailability(
    id: string,
    updates: Partial<TherapistAvailability>
  ): Promise<void>;
  static async deleteAvailability(id: string): Promise<void>;

  // Bulk operations
  static async setWeeklySchedule(
    therapistId: string,
    schedule: WeeklySchedule,
    pattern: RecurringPattern
  ): Promise<string[]>;
  static async bulkSetAvailability(
    therapistId: string,
    data: BulkAvailabilityData[],
    pattern: RecurringPattern
  ): Promise<string[]>;

  // Schedule overrides
  static async getScheduleOverrides(
    therapistId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<ScheduleOverride[]>;
  static async createScheduleOverride(
    data: Omit<ScheduleOverride, "id">
  ): Promise<string>;
  static async updateScheduleOverride(
    id: string,
    updates: Partial<ScheduleOverride>
  ): Promise<void>;
  static async deleteScheduleOverride(id: string): Promise<void>;

  // Real-time subscriptions
  static subscribeToAvailability(
    therapistId: string,
    callback: (availability: TherapistAvailability[]) => void
  ): () => void;
  static subscribeToOverrides(
    therapistId: string,
    callback: (overrides: ScheduleOverride[]) => void,
    fromDate?: Date,
    toDate?: Date
  ): () => void;

  // Utilities
  static async checkAvailabilityConflict(
    therapistId: string,
    dayOfWeek: number,
    timeSlotId: string,
    excludeId?: string
  ): Promise<boolean>;
  static async getAvailabilityStats(
    therapistId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<AvailabilityStats>;
}
```

#### TimeSlotService API

```typescript
class TimeSlotService {
  // Basic CRUD
  static async getTimeSlots(): Promise<TimeSlot[]>;
  static async getStandardTimeSlots(): Promise<TimeSlot[]>;
  static async getTimeSlot(id: string): Promise<TimeSlot | null>;
  static async getTimeSlotsForDuration(duration: number): Promise<TimeSlot[]>;

  static async createTimeSlot(data: Omit<TimeSlot, "id">): Promise<string>;
  static async updateTimeSlot(
    id: string,
    updates: Partial<TimeSlot>
  ): Promise<void>;
  static async deleteTimeSlot(id: string): Promise<void>; // Protected by safeguards

  // Bulk operations
  static async generateStandardTimeSlots(
    startTime: string,
    endTime: string,
    intervalMinutes: number,
    duration: number
  ): Promise<string[]>;
  static async bulkCreateTimeSlots(
    slots: Omit<TimeSlot, "id">[]
  ): Promise<string[]>;

  // Validation
  static async checkTimeSlotConflict(
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean>;

  // Real-time subscriptions
  static subscribeToTimeSlots(
    callback: (timeSlots: TimeSlot[]) => void,
    standardOnly?: boolean
  ): () => void;
}
```

### Error Handling & Recovery

#### Error Types

```typescript
// Service-level errors
class BookingConflictError extends Error {
  conflicts: BookingConflict[];
  constructor(conflicts: BookingConflict[]) {
    super(`Booking conflicts: ${conflicts.map((c) => c.message).join(", ")}`);
    this.conflicts = conflicts;
  }
}

class AvailabilityError extends Error {
  type: "timezone" | "schedule" | "override";
  therapistId: string;
  constructor(type: string, therapistId: string, message: string) {
    super(message);
    this.type = type;
    this.therapistId = therapistId;
  }
}

class TimeSlotError extends Error {
  type: "deletion_conflict" | "validation" | "generation";
  timeSlotId?: string;
  dependencies?: string[];
}
```

#### Recovery Patterns

```typescript
// Exponential backoff retry
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Transaction-based recovery
async function atomicBooking(request: BookingRequest): Promise<string> {
  return await runTransaction(db, async (transaction) => {
    // 1. Re-check conflicts within transaction
    const conflicts = await checkBookingConflicts(request);
    if (conflicts.length > 0) {
      throw new BookingConflictError(conflicts);
    }

    // 2. Create appointment atomically
    const appointmentRef = doc(collection(db, "appointments"));
    transaction.set(appointmentRef, appointmentData);

    return appointmentRef.id;
  });
}
```

### Performance Considerations

#### Query Optimization

```typescript
// Compound indexes for efficient queries
// Required indexes (firestore.indexes.json):
{
  "indexes": [
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "therapistId", "order": "ASCENDING"},
        {"fieldPath": "scheduledFor", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "clientId", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "scheduledFor", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "therapistAvailability",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "therapistId", "order": "ASCENDING"},
        {"fieldPath": "dayOfWeek", "order": "ASCENDING"}
      ]
    }
  ]
}
```

#### Caching Strategy

```typescript
// React Query integration for caching
import { useQuery, useMutation, useQueryClient } from "react-query";

function useTherapistAvailability(therapistId: string) {
  return useQuery(
    ["availability", therapistId],
    () => AvailabilityService.getTherapistAvailability(therapistId),
    {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: true,
      refetchInterval: 60000, // 1 minute
    }
  );
}

// Optimistic updates
function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation(AppointmentService.createAppointment, {
    onSuccess: (result, variables) => {
      // Update cache optimistically
      queryClient.setQueryData(
        ["appointments", variables.therapistId],
        (old: Appointment[]) => [...old, newAppointment]
      );
    },
  });
}
```

#### Bundle Size Optimization

```typescript
// Lazy loading for large components
const BookingFlow = lazy(() => import("@/components/booking/BookingFlow"));
const AvailabilityCalendar = lazy(
  () => import("@/components/schedule/AvailabilityCalendar")
);
const RecurringScheduleSetup = lazy(
  () => import("@/components/schedule/RecurringScheduleSetup")
);

// Code splitting by route
const routes = [
  {
    path: "/booking/:therapistId",
    component: lazy(() => import("@/pages/booking")),
  },
  {
    path: "/therapist/schedule",
    component: lazy(() => import("@/pages/therapist/schedule")),
  },
];
```

### Security Rules

**Location**: [`firestore.rules`](firestore.rules)

The Firestore security rules implement comprehensive access control with role-based permissions.

#### Key Security Features

```javascript
// Role-based access control
function getUserRole() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
}

function isTherapist() {
  return isAuthenticated() && getUserRole() == 'therapist';
}

function isClient() {
  return isAuthenticated() && getUserRole() == 'client';
}

// Video session security
function canAccessVideoSession(appointmentData) {
  return isAppointmentParticipant(appointmentData) &&
    appointmentData.status == 'confirmed' &&
    appointmentData.session.type == 'video';
}

// Time-based access control
function isVideoSessionActive(appointmentData) {
  return canAccessVideoSession(appointmentData) &&
    // Allow access 30 minutes before to 30 minutes after
    request.time >= appointmentData.scheduledFor - duration.value(30, 'm') &&
    request.time <= appointmentData.scheduledFor + duration.value(appointmentData.duration + 30, 'm');
}
```

#### Collection-Level Security

```javascript
// Appointments - Enhanced for video sessions
match /appointments/{appointmentId} {
  allow read: if isAuthenticated() &&
    (isOwner(resource.data.clientId) ||
     isOwner(resource.data.therapistId) ||
     isAdmin());

  allow create: if isAuthenticated() &&
    isClient() &&
    validateAppointmentCreate();

  allow update: if isAuthenticated() &&
    (isOwner(resource.data.clientId) ||
     isOwner(resource.data.therapistId) ||
     isAdmin()) &&
    validateAppointmentUpdate();
}

// Therapist availability - Public read, therapist write
match /therapistAvailability/{docId} {
  allow read: if isAuthenticated();
  allow create, update: if isAuthenticated() &&
    isOwner(resource.data.therapistId) &&
    isTherapist();
}
```

---

## Testing & Quality Assurance

### Comprehensive Test Suite

The [`BookingSystemTest`](src/components/BookingSystemTest.tsx) component provides 20+ test scenarios covering:

#### Test Categories

```typescript
1. Service Layer Integration Tests (4 tests)
   - AppointmentService.checkBookingConflicts()
   - AvailabilityService.getAvailabilityForDate()
   - TimeSlotService.getTimeSlots()
   - Group Session Capacity Validation

2. Real-time Availability Tests (4 tests)
   - useRealtimeAvailability Hook
   - Subscription Error Handling
   - Timezone Conversion Logic
   - Real-time Availability Updates

3. Booking Flow Integration Tests (4 tests)
   - BookingFlow Authentication
   - Step Navigation Logic
   - Actual Appointment Creation
   - Error Handling & Recovery

4. Component Integration Tests (4 tests)
   - BookingCalendar Component
   - TimeSlotSelector Component
   - BookingConfirmation Component
   - Toast Notification System

5. Edge Case Tests (4 tests)
   - Daylight Saving Time Transitions
   - Booking Conflict Detection
   - Group Session Capacity Limits
   - Cross-timezone Booking Edge Cases
```

#### Running Tests

```typescript
// Use the test component
import { BookingSystemTest } from "@/components/BookingSystemTest";

function TestPage() {
  return <BookingSystemTest />;
}

// Or run individual test suites
const testResults = await runServiceLayerTests();
const realtimeResults = await runRealtimeTests();
```

### Manual Testing Checklist

```markdown
## Therapist Workflow Testing

- [ ] Profile setup and verification
- [ ] Availability calendar interaction
- [ ] Recurring schedule creation (weekly/biweekly/monthly)
- [ ] Schedule override management
- [ ] Real-time appointment notifications

## Client Workflow Testing

- [ ] Therapist search and filtering
- [ ] Booking flow (4 steps)
- [ ] Date and time selection
- [ ] Session type selection
- [ ] Booking confirmation and payment
- [ ] Appointment management

## System Integration Testing

- [ ] Real-time availability updates
- [ ] Timezone conversion accuracy
- [ ] Group session capacity limits
- [ ] Booking conflict prevention
- [ ] Error handling and recovery

## Edge Case Testing

- [ ] DST transitions
- [ ] Cross-timezone bookings
- [ ] Concurrent booking attempts
- [ ] Network connectivity issues
- [ ] Database transaction failures
```

---

## Deployment & Monitoring

### Production Deployment

```bash
# Build optimized production bundle
npm run build

# Deploy to Vercel/Netlify
npm run deploy

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### Monitoring Setup

```typescript
// Performance monitoring with Firebase
import { getPerformance, trace } from "firebase/performance";

const perf = getPerformance(app);

// Trace booking performance
const bookingTrace = trace(perf, "booking_flow");
bookingTrace.start();
// ... booking logic
bookingTrace.stop();

// Custom metrics
import { getAnalytics, logEvent } from "firebase/analytics";

const analytics = getAnalytics(app);

logEvent(analytics, "appointment_booked", {
  therapist_id: therapistId,
  session_type: sessionType,
  booking_duration_ms: Date.now() - startTime,
});
```

### Error Tracking

```typescript
// Sentry integration
import * as Sentry from "@sentry/nextjs";

// Capture booking errors
try {
  await AppointmentService.createAppointment(bookingRequest);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: "booking_flow",
      therapist_id: therapistId,
    },
    extra: {
      booking_request: bookingRequest,
      user_timezone: getUserTimezone(),
    },
  });
}
```

---

## Conclusion

The therapy platform scheduling system is a production-ready solution that handles complex scheduling scenarios with:

- **Real-time conflict prevention** ensuring booking integrity
- **Multi-timezone support** for global therapy practice
- **Group session management** with capacity controls
- **Sophisticated recurring patterns** (weekly/biweekly/monthly)
- **Comprehensive error handling** and recovery mechanisms
- **Production-grade security** with role-based access control
- **Extensive testing suite** with 20+ test scenarios

The system is designed for scalability, reliability, and excellent user experience across therapist and client workflows.

### Key Benefits

- ✅ **Zero booking conflicts** through real-time validation
- ✅ **Global accessibility** with timezone conversion
- ✅ **Flexible scheduling** with multiple recurring patterns
- ✅ **Group therapy support** with capacity management
- ✅ **Production ready** with comprehensive testing
- ✅ **Developer friendly** with extensive documentation

For technical support or implementation assistance, refer to the component source files and test suite for detailed examples.
