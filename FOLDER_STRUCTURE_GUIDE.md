# Folder Structure Guide - Feature-wise Breakdown

## 📂 Quick Navigation

- [Authentication System](#authentication-system)
- [Client Features](#client-features)
- [Therapist Features](#therapist-features)
- [Admin Features](#admin-features)
- [Booking System](#booking-system)
- [Scheduling System](#scheduling-system)
- [Video Sessions](#video-sessions)
- [Database & Services](#database--services)
- [UI Components](#ui-components)

---

## 🔐 Authentication System

### Location: `/src/app/(auth)/`

```
(auth)/
├── login/page.tsx              # Login page with email/password + Google OAuth
├── register/page.tsx           # Registration with role selection
└── forgot-password/page.tsx    # Password reset flow
```

### Related Files
- `/src/lib/firebase/auth.ts` - Auth helper functions
- `/src/lib/hooks/useAuth.tsx` - Auth context and hooks
- `/src/stores/auth-store.ts` - Auth state management
- `/src/middleware.ts` - Route protection

### Key Features
- Email/Password authentication
- Google OAuth integration
- Role-based registration (client/therapist/admin)
- Password reset
- JWT token management
- Cookie-based session

---

## 👤 Client Features

### Location: `/src/app/client/`

```
client/
├── page.tsx                    # Client dashboard
└── appointments/
    └── page.tsx                # Appointment management
```

### Related Components
```
/src/components/booking/
├── BookingFlow.tsx             # Multi-step booking wizard
├── BookingCalendar.tsx         # Calendar view for selecting dates
├── TherapistCard.tsx           # Therapist profile cards
├── TimeSlotSelector.tsx        # Time slot selection UI
└── BookingConfirmation.tsx     # Booking summary and confirmation
```

### Related Services
- `/src/lib/services/appointment-service.ts` - Booking logic
- `/src/lib/services/therapist-service.ts` - Therapist search
- `/src/lib/services/available-slots-service.ts` - Available slots calculation

### Client User Journey
1. Browse therapists
2. View therapist profiles
3. Select date and time
4. Book appointment
5. Make payment
6. Join video session

---

## 👨‍⚕️ Therapist Features

### Location: `/src/app/therapist/`

```
therapist/
├── page.tsx                    # Therapist dashboard
├── profile/
│   └── page.tsx                # Profile management
└── schedule/
    └── page.tsx                # Availability management
```

### Related Components
```
/src/components/therapist/
├── ProfileCompletion.tsx       # Profile setup wizard
├── DocumentUpload.tsx          # License document upload
├── VerificationStatus.tsx      # Verification badge display
└── AvailabilitySettings.tsx    # Quick availability toggles

/src/components/schedule/
├── AvailabilityCalendar.tsx    # Weekly availability grid
├── RecurringScheduleSetup.tsx  # Set recurring patterns
├── ScheduleOverrides.tsx       # Manage time-off and custom hours
├── TimeSlotPicker.tsx          # Time slot configuration
└── AvailabilityStats.tsx       # Availability analytics
```

### Related Services
- `/src/lib/services/therapist-service.ts` - Profile management
- `/src/lib/services/availability-service.ts` - Schedule management
- `/src/lib/services/timeslot-service.ts` - Time slot operations

### Therapist User Journey
1. Complete profile with credentials
2. Upload license documents
3. Set weekly availability
4. Configure recurring schedules
5. Manage appointments
6. Conduct video sessions

---

## 🛡️ Admin Features

### Location: `/src/app/admin/`

```
admin/
└── page.tsx                    # Admin dashboard (UI only, needs backend)
```

### Current Status
✅ Dashboard UI exists
❌ User management - Not implemented
❌ Therapist verification - Not implemented
❌ Appointment management - Not implemented
❌ Analytics - Not implemented
❌ System configuration - Not implemented

### What Needs to Be Built

#### 1. User Management
```
admin/users/
├── page.tsx                    # User list with search/filter
├── [userId]/
│   ├── page.tsx                # User details
│   └── edit/page.tsx           # Edit user
└── components/
    ├── UserTable.tsx
    ├── UserFilters.tsx
    └── UserActions.tsx
```

#### 2. Therapist Verification
```
admin/therapists/
├── page.tsx                    # Pending verifications list
├── [therapistId]/
│   ├── page.tsx                # Review credentials
│   └── verify/page.tsx         # Verification form
└── components/
    ├── CredentialReview.tsx
    ├── DocumentViewer.tsx
    └── VerificationActions.tsx
```

#### 3. Appointment Management
```
admin/appointments/
├── page.tsx                    # All appointments list
├── [appointmentId]/
│   └── page.tsx                # Appointment details
└── components/
    ├── AppointmentTable.tsx
    ├── AppointmentFilters.tsx
    └── AppointmentActions.tsx
```

#### 4. Analytics & Reports
```
admin/reports/
├── page.tsx                    # Analytics dashboard
├── users/page.tsx              # User analytics
├── sessions/page.tsx           # Session analytics
├── revenue/page.tsx            # Revenue reports
└── components/
    ├── Chart.tsx
    ├── StatCard.tsx
    └── ReportExport.tsx
```

### Required Services (To Be Created)
```
/src/lib/services/admin/
├── user-management-service.ts
├── verification-service.ts
├── appointment-admin-service.ts
├── analytics-service.ts
└── audit-service.ts
```

---

## 📅 Booking System

### Components Location: `/src/components/booking/`

```
booking/
├── BookingFlow.tsx             # Main booking wizard (multi-step)
├── BookingCalendar.tsx         # Calendar date picker
├── TherapistCard.tsx           # Therapist profile card
├── TimeSlotSelector.tsx        # Time slot selection grid
└── BookingConfirmation.tsx     # Final confirmation screen
```

### Service Layer: `/src/lib/services/`

```
appointment-service.ts          # Core booking logic
├── checkBookingConflicts()     # Conflict detection
├── createAppointment()         # Create booking with transaction
├── updateAppointment()         # Update booking
├── cancelAppointment()         # Cancel booking
└── getAppointmentsByUser()     # Fetch user appointments

available-slots-service.ts      # Slot calculation
├── getAvailableSlots()         # Calculate available slots
├── isSlotAvailable()           # Check slot availability
└── filterBookedSlots()         # Remove booked slots
```

### Booking Flow Architecture
```
1. TherapistCard (Select therapist)
   ↓
2. BookingCalendar (Select date)
   ↓
3. TimeSlotSelector (Select time)
   ↓
4. BookingConfirmation (Confirm & pay)
   ↓
5. Appointment created in Firestore
```

---

## 🗓️ Scheduling System

### Components Location: `/src/components/schedule/`

```
schedule/
├── AvailabilityCalendar.tsx    # Weekly grid showing availability
├── RecurringScheduleSetup.tsx  # Set recurring patterns (weekly/biweekly)
├── ScheduleOverrides.tsx       # Manage exceptions (time-off, custom hours)
├── TimeSlotPicker.tsx          # Configure time slots
└── AvailabilityStats.tsx       # Availability metrics
```

### Service Layer: `/src/lib/services/`

```
availability-service.ts         # Availability management
├── setAvailability()           # Set weekly availability
├── getAvailability()           # Fetch availability
├── updateRecurringSchedule()   # Update recurring pattern
└── deleteAvailability()        # Remove availability

timeslot-service.ts             # Time slot operations
├── createTimeSlot()            # Create new slot
├── getTimeSlots()              # Fetch all slots
├── updateTimeSlot()            # Update slot
└── deleteTimeSlot()            # Delete (with guards)
```

### Database Collections
```
Firestore:
├── timeSlots/                  # Predefined time slots (e.g., 9:00-10:00)
├── therapistAvailability/      # Weekly recurring availability
└── scheduleOverrides/          # Exceptions (day off, custom hours)
```

### Scheduling Features
- ✅ Recurring weekly schedules
- ✅ Timezone support
- ✅ Schedule overrides (time-off)
- ✅ Conflict prevention
- ✅ Real-time sync
- ❌ Group session scheduling (backend ready, UI pending)

---

## 🎥 Video Sessions

### Components Location: `/src/components/video/`

```
video/
├── VideoSession.tsx            # Main video call interface
├── VideoControls.tsx           # Camera, mic, screen share controls
└── ParticipantView.tsx         # Video participant rendering
```

### Service Layer

```
/src/lib/services/agora-service.ts
├── generateToken()             # Generate Agora token
├── createChannel()             # Create video channel
├── joinChannel()               # Join existing channel
└── leaveChannel()              # Leave channel

/src/app/api/agora/token/route.ts
└── POST /api/agora/token       # Server-side token generation
```

### Video Session Flow
```
1. Appointment confirmed
   ↓
2. Server generates Agora token
   ↓
3. Token stored in appointment.session.accessToken
   ↓
4. Client/Therapist join channel with token
   ↓
5. Real-time video/audio communication
   ↓
6. Session metrics tracked in Firestore
```

### Agora Integration
- **SDK**: agora-rtc-react, agora-rtc-sdk-ng
- **Token Generation**: Server-side via API route
- **Channel ID**: Unique per appointment
- **Security**: Token-based authentication

---

## 🗄️ Database & Services

### Firebase Configuration: `/src/lib/firebase/`

```
firebase/
├── client.ts                   # Client-side Firebase (auth, firestore, storage)
├── admin.ts                    # Server-side Firebase Admin SDK
├── auth.ts                     # Authentication helpers
└── collections.ts              # Typed collection references
```

### Service Layer: `/src/lib/services/`

```
services/
├── appointment-service.ts      # Appointment CRUD + booking logic (21KB)
├── availability-service.ts     # Availability management (18KB)
├── available-slots-service.ts  # Slot calculation (13KB)
├── timeslot-service.ts         # Time slot operations (13KB)
├── therapist-service.ts        # Therapist profile management (11KB)
├── profile-service.ts          # User profile operations (5KB)
├── agora-service.ts            # Video session management (14KB)
└── realtime-service.ts         # Real-time sync & conflict resolution (22KB)
```

### Firestore Collections

```
Firestore Database:
├── users/                      # User profiles (client, therapist, admin)
├── therapistProfiles/          # Extended therapist info
├── timeSlots/                  # Predefined time slots
├── therapistAvailability/      # Weekly availability patterns
├── scheduleOverrides/          # Time-off and custom hours
├── appointments/               # Booking records
│   ├── {appointmentId}/
│   │   ├── messages/           # Subcollection: chat messages
│   │   ├── sessionCredentials/ # Subcollection: video credentials
│   │   └── sessionMetrics/     # Subcollection: session stats
├── auditLogs/                  # System audit trail
├── notifications/              # User notifications
├── paymentIntents/             # Stripe payment records
├── videoSessions/              # Active video sessions
├── therapistStatus/            # Real-time online status
└── performanceMetrics/         # Performance monitoring
```

### Security Rules: `firestore.rules`

```
firestore.rules (328 lines)
├── Role-based access control
├── User can only access own data
├── Therapist profiles publicly readable
├── Appointments visible to participants
├── Video credentials highly restricted
├── Admin-only audit logs
└── Data validation functions
```

---

## 🎨 UI Components

### Shadcn/UI Components: `/src/components/ui/`

```
ui/
├── alert.tsx                   # Alert messages
├── alert-dialog.tsx            # Confirmation dialogs
├── avatar.tsx                  # User avatars
├── badge.tsx                   # Status badges
├── button.tsx                  # Buttons
├── calendar.tsx                # Date picker
├── card.tsx                    # Card containers
├── dialog.tsx                  # Modal dialogs
├── dropdown-menu.tsx           # Dropdown menus
├── form.tsx                    # Form components
├── input.tsx                   # Input fields
├── label.tsx                   # Form labels
├── loading-spinner.tsx         # Loading states
├── navigation-menu.tsx         # Navigation
├── progress.tsx                # Progress bars
├── select.tsx                  # Select dropdowns
├── switch.tsx                  # Toggle switches
├── table.tsx                   # Data tables
└── tabs.tsx                    # Tab navigation
```

### Shared Components: `/src/components/`

```
components/
├── navigation.tsx              # Main app navigation
├── error-boundary.tsx          # Error handling
├── onboarding/
│   └── onboarding-wizard.tsx   # User onboarding flow
└── profile/
    ├── profile-completion.tsx  # Profile completion tracker
    └── profile-form.tsx        # Profile edit form
```

---

## 🪝 Custom Hooks

### Location: `/src/lib/hooks/`

```
hooks/
├── useAuth.tsx                 # Authentication state & methods
│   ├── useAuth()               # Main auth hook
│   ├── useIsClient()           # Check if user is client
│   ├── useIsTherapist()        # Check if user is therapist
│   ├── useIsAdmin()            # Check if user is admin
│   └── useOnboardingStatus()   # Check onboarding completion
│
├── useRealtimeAppointments.ts  # Real-time appointment updates
├── useRealtimeAvailability.ts  # Real-time availability sync
├── useRealtimeTherapistStatus.ts # Therapist online status
├── useDebounce.ts              # Debounce utility
└── useToast.ts                 # Toast notifications
```

---

## 🏪 State Management

### Zustand Stores: `/src/stores/`

```
stores/
├── auth-store.ts               # Authentication state
└── realtime-store.ts           # Real-time sync state
```

### State Management Pattern
- **Server State**: TanStack React Query
- **Client State**: Zustand
- **Form State**: React Hook Form
- **Auth State**: useAuth hook + Context
- **Real-time State**: Custom hooks with Firestore listeners

---

## 📝 Type Definitions

### Location: `/src/types/database.ts`

```typescript
// User Types
User, UserRole, UserStatus

// Therapist Types
TherapistProfile, TherapistAvailability, ScheduleOverride

// Appointment Types
Appointment, AppointmentStatus, SessionType, SessionDeliveryType

// Time Slot Types
TimeSlot, AvailableSlot, EnhancedAvailableSlot

// Payment Types
PaymentIntent, PaymentStatus

// Notification Types
Notification

// Audit Types
AuditLog

// Form Types
UserRegistrationData, TherapistOnboardingData, BookingRequest
```

---

## 🔧 Configuration Files

```
Root Directory:
├── .env                        # Environment variables (gitignored)
├── firebase.json               # Firebase project config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore indexes
├── next.config.ts              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
├── eslint.config.mjs           # ESLint config
└── postcss.config.mjs          # PostCSS config
```

---

## 📚 Documentation Files

```
Documentation:
├── README.md                   # Basic Next.js readme
├── SETUP.md                    # Detailed setup instructions
├── SCHEDULING_SYSTEM_DOCUMENTATION.md # Scheduling system docs (1607 lines)
├── PROJECT_OVERVIEW.md         # This comprehensive overview
└── FOLDER_STRUCTURE_GUIDE.md   # This file
```

---

## 🚀 Quick Reference - Where to Find Things

| Feature | Location |
|---------|----------|
| Login/Register | `/src/app/(auth)/` |
| Client Dashboard | `/src/app/client/page.tsx` |
| Therapist Dashboard | `/src/app/therapist/page.tsx` |
| Admin Dashboard | `/src/app/admin/page.tsx` |
| Booking Flow | `/src/components/booking/BookingFlow.tsx` |
| Availability Calendar | `/src/components/schedule/AvailabilityCalendar.tsx` |
| Video Session | `/src/components/video/VideoSession.tsx` |
| Auth Logic | `/src/lib/firebase/auth.ts` |
| Appointment Logic | `/src/lib/services/appointment-service.ts` |
| Database Types | `/src/types/database.ts` |
| Security Rules | `/firestore.rules` |
| Environment Config | `/src/lib/config.ts` |

---

## 🎯 Development Priorities

### High Priority (Core Functionality)
1. ✅ Authentication system
2. ✅ Therapist profile management
3. ✅ Availability scheduling
4. ✅ Appointment booking
5. ✅ Video sessions
6. ❌ Payment integration (Stripe)
7. ❌ Admin panel functionality

### Medium Priority (Enhanced Features)
1. ❌ Therapist verification workflow
2. ❌ Email/SMS notifications
3. ❌ Appointment rescheduling
4. ❌ Search and filtering
5. ❌ Analytics dashboard

### Low Priority (Nice to Have)
1. ❌ In-app messaging
2. ❌ Group therapy sessions
3. ❌ Video recording
4. ❌ Advanced reporting
5. ❌ Mobile app

---

**Last Updated**: 2025-10-24
