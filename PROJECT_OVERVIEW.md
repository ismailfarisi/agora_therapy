# Agora Therapy Platform - Project Overview & Documentation

## 🎯 Project Purpose

This is a **Next.js 15 web application** for an online therapy platform called **Mindgood**. It connects clients with licensed therapists for video therapy sessions, featuring appointment booking, scheduling, and video conferencing capabilities.

---

## 🏗️ Technology Stack

### Frontend Framework
- **Next.js 15** with App Router
- **React 19.1.0**
- **TypeScript 5**
- **Tailwind CSS 4** for styling
- **Shadcn/UI** for component library

### Backend & Database
- **Firebase** (Primary Database & Backend)
  - **Firestore** - NoSQL database for all data storage
  - **Firebase Authentication** - User authentication (Email/Password, Google OAuth)
  - **Firebase Admin SDK** - Server-side operations
  - **Firebase Storage** - File storage (documents, avatars)
  - **Firebase Functions** - Serverless functions

### Video Conferencing
- **Agora.io SDK** - Real-time video/audio sessions
  - `agora-rtc-react` - React components
  - `agora-rtc-sdk-ng` - Core SDK
  - `agora-token` - Token generation

### Payment Processing
- **Stripe** - Payment integration for session bookings

### State Management
- **Zustand** - Lightweight state management
- **TanStack React Query** - Server state management and caching

### UI Components
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form handling
- **Zod** - Schema validation

---

## 📁 Project Structure

```
agora_therapy/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── admin/                    # Admin dashboard
│   │   ├── client/                   # Client dashboard & features
│   │   │   └── appointments/
│   │   ├── therapist/                # Therapist dashboard & features
│   │   │   ├── profile/
│   │   │   └── schedule/
│   │   ├── onboarding/               # User onboarding flow
│   │   ├── profile/                  # User profile pages
│   │   ├── api/                      # API routes
│   │   │   └── agora/token/          # Agora token generation
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React components
│   │   ├── booking/                  # Booking system components
│   │   │   ├── BookingCalendar.tsx
│   │   │   ├── BookingFlow.tsx
│   │   │   ├── TherapistCard.tsx
│   │   │   └── TimeSlotSelector.tsx
│   │   ├── schedule/                 # Scheduling components
│   │   │   ├── AvailabilityCalendar.tsx
│   │   │   ├── RecurringScheduleSetup.tsx
│   │   │   ├── ScheduleOverrides.tsx
│   │   │   └── TimeSlotPicker.tsx
│   │   ├── therapist/                # Therapist-specific components
│   │   │   ├── AvailabilitySettings.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── ProfileCompletion.tsx
│   │   │   └── VerificationStatus.tsx
│   │   ├── video/                    # Video session components
│   │   │   ├── VideoSession.tsx
│   │   │   ├── VideoControls.tsx
│   │   │   └── ParticipantView.tsx
│   │   ├── onboarding/               # Onboarding wizard
│   │   ├── profile/                  # Profile components
│   │   ├── ui/                       # Shadcn UI components
│   │   ├── navigation.tsx            # Main navigation
│   │   └── error-boundary.tsx        # Error handling
│   │
│   ├── lib/                          # Core library code
│   │   ├── firebase/                 # Firebase configuration
│   │   │   ├── client.ts             # Client-side Firebase
│   │   │   ├── admin.ts              # Server-side Firebase Admin
│   │   │   ├── auth.ts               # Authentication helpers
│   │   │   └── collections.ts        # Firestore collections
│   │   ├── services/                 # Business logic services
│   │   │   ├── appointment-service.ts
│   │   │   ├── availability-service.ts
│   │   │   ├── available-slots-service.ts
│   │   │   ├── timeslot-service.ts
│   │   │   ├── therapist-service.ts
│   │   │   ├── profile-service.ts
│   │   │   ├── agora-service.ts
│   │   │   └── realtime-service.ts
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.tsx
│   │   │   ├── useRealtimeAppointments.ts
│   │   │   ├── useRealtimeAvailability.ts
│   │   │   ├── useRealtimeTherapistStatus.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useToast.ts
│   │   ├── utils/                    # Utility functions
│   │   ├── validations/              # Zod schemas
│   │   ├── config.ts                 # App configuration
│   │   ├── providers.tsx             # React providers
│   │   └── utils.ts                  # Helper utilities
│   │
│   ├── stores/                       # Zustand state stores
│   │   ├── auth-store.ts
│   │   └── realtime-store.ts
│   │
│   ├── types/                        # TypeScript type definitions
│   │   └── database.ts               # Database entity types
│   │
│   └── middleware.ts                 # Next.js middleware (auth)
│
├── public/                           # Static assets
├── firebase.json                     # Firebase configuration
├── firestore.rules                   # Firestore security rules
├── firestore.indexes.json            # Firestore indexes
├── .env                              # Environment variables
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.js                # Tailwind config
├── next.config.ts                    # Next.js config
├── README.md                         # Basic readme
├── SETUP.md                          # Setup instructions
└── SCHEDULING_SYSTEM_DOCUMENTATION.md # Scheduling docs
```

---

## 🔥 Firebase Integration

### ✅ Firebase IS Integrated

Yes, Firebase is fully integrated as the primary database and backend.

### Firebase Services Used

1. **Firestore Database** - Main data storage
2. **Firebase Authentication** - User management
3. **Firebase Admin SDK** - Server-side operations
4. **Firebase Storage** - File uploads
5. **Firebase Functions** - Serverless backend (optional)

### Firestore Collections

The database uses the following collections:

| Collection | Purpose |
|------------|---------|
| `users` | User profiles (client, therapist, admin) |
| `therapistProfiles` | Extended therapist information, credentials |
| `timeSlots` | Predefined appointment time slots |
| `therapistAvailability` | Weekly availability patterns |
| `scheduleOverrides` | Time-off and custom hours |
| `appointments` | Booking records and session details |
| `auditLogs` | System audit trail (admin only) |
| `notifications` | User notifications |
| `paymentIntents` | Stripe payment records |
| `videoSessions` | Active video session management |
| `therapistStatus` | Real-time therapist online status |

### Firebase Configuration Files

- **`src/lib/firebase/client.ts`** - Client-side Firebase initialization
- **`src/lib/firebase/admin.ts`** - Server-side Firebase Admin SDK
- **`src/lib/firebase/auth.ts`** - Authentication helpers
- **`src/lib/firebase/collections.ts`** - Collection references
- **`firestore.rules`** - Security rules (328 lines)
- **`firebase.json`** - Firebase project configuration

---

## 👥 User Roles & Features

### 1. **Client** (Therapy Seekers)
**Route**: `/client`

**Features**:
- Browse and search therapists
- View therapist profiles and specializations
- Book appointments with available time slots
- Manage appointments (view, reschedule, cancel)
- Join video therapy sessions
- Make payments via Stripe
- Receive notifications

### 2. **Therapist** (Mental Health Professionals)
**Route**: `/therapist`

**Features**:
- Complete professional profile with credentials
- Upload license documents for verification
- Set weekly availability schedule
- Manage recurring schedules
- Set time-off and schedule overrides
- View and manage appointments
- Conduct video therapy sessions
- Track earnings and sessions
- Receive booking notifications

### 3. **Admin** (Platform Administrators)
**Route**: `/admin`

**Features**:
- User management dashboard
- Therapist verification system
- View all appointments and sessions
- Platform analytics and reports
- System configuration
- Audit logs access
- Payment management
- Security monitoring

---

## 🗂️ Feature Breakdown by Folder

### `/src/app` - Application Routes

#### Authentication (`(auth)/`)
- **Login**: Email/password + Google OAuth
- **Register**: User registration with role selection
- **Forgot Password**: Password reset flow

#### Client Features (`client/`)
- **Dashboard**: Overview of upcoming sessions
- **Appointments**: Booking management
- **Therapist Search**: Find and filter therapists

#### Therapist Features (`therapist/`)
- **Dashboard**: Session overview and stats
- **Profile**: Professional profile management
- **Schedule**: Availability and time management

#### Admin Features (`admin/`)
- **Dashboard**: Platform statistics
- **User Management**: (Planned)
- **Therapist Verification**: (Planned)
- **Analytics**: (Planned)

### `/src/components` - Reusable Components

#### Booking System (`booking/`)
- **BookingFlow**: Multi-step booking wizard
- **BookingCalendar**: Calendar view for appointments
- **TherapistCard**: Therapist profile cards
- **TimeSlotSelector**: Time slot selection UI
- **BookingConfirmation**: Booking summary

#### Scheduling System (`schedule/`)
- **AvailabilityCalendar**: Weekly availability grid
- **RecurringScheduleSetup**: Set recurring patterns
- **ScheduleOverrides**: Manage time-off
- **TimeSlotPicker**: Time slot configuration
- **AvailabilityStats**: Availability analytics

#### Video Components (`video/`)
- **VideoSession**: Main video call interface
- **VideoControls**: Camera, mic, screen share controls
- **ParticipantView**: Video participant rendering

#### Therapist Components (`therapist/`)
- **ProfileCompletion**: Profile setup wizard
- **DocumentUpload**: License upload
- **VerificationStatus**: Verification badge
- **AvailabilitySettings**: Quick availability toggles

### `/src/lib/services` - Business Logic Layer

#### Core Services

1. **`appointment-service.ts`** (21KB)
   - Create, update, cancel appointments
   - Conflict detection
   - Group session support
   - Transaction-based booking

2. **`availability-service.ts`** (18KB)
   - Manage therapist availability
   - Recurring schedule patterns
   - Timezone handling
   - Schedule overrides

3. **`available-slots-service.ts`** (13KB)
   - Calculate available time slots
   - Filter booked slots
   - Timezone conversion
   - Slot validation

4. **`timeslot-service.ts`** (13KB)
   - Time slot CRUD operations
   - Deletion guards (prevent deleting used slots)
   - Validation

5. **`therapist-service.ts`** (11KB)
   - Therapist profile management
   - Search and filtering
   - Verification workflow

6. **`profile-service.ts`** (5KB)
   - User profile operations
   - Profile completion tracking

7. **`agora-service.ts`** (14KB)
   - Agora token generation
   - Video session management
   - Channel creation

8. **`realtime-service.ts`** (22KB)
   - Real-time data synchronization
   - Conflict resolution
   - Performance monitoring

### `/src/lib/hooks` - Custom React Hooks

- **`useAuth.tsx`** - Authentication state and methods
- **`useRealtimeAppointments.ts`** - Real-time appointment updates
- **`useRealtimeAvailability.ts`** - Live availability sync
- **`useRealtimeTherapistStatus.ts`** - Therapist online status
- **`useDebounce.ts`** - Debounce utility
- **`useToast.ts`** - Toast notifications

### `/src/stores` - Zustand State Management

- **`auth-store.ts`** - Authentication state
- **`realtime-store.ts`** - Real-time sync state

---

## 🔐 Authentication & Security

### Authentication Flow

1. User registers with email/password or Google OAuth
2. Firebase Authentication creates user account
3. User document created in Firestore with role
4. JWT token stored in cookie for middleware
5. Role-based routing to appropriate dashboard

### Middleware Protection

**File**: `src/middleware.ts`

- Protects routes: `/client/*`, `/therapist/*`, `/admin/*`
- Validates auth token from cookies
- Redirects unauthenticated users to login
- Preserves redirect URL for post-login navigation

### Firestore Security Rules

**File**: `firestore.rules` (328 lines)

Comprehensive security rules including:
- Role-based access control (client, therapist, admin)
- User can only access their own data
- Therapist profiles publicly readable
- Appointments visible to participants only
- Video session credentials highly restricted
- Admin-only access to audit logs
- Validation functions for data integrity

---

## 📅 Scheduling System Architecture

### Key Features

1. **Timezone Support**
   - All times stored in UTC
   - Converted to user/therapist timezone
   - Handles DST transitions

2. **Recurring Schedules**
   - Weekly recurring patterns
   - Bi-weekly and monthly options
   - End date support

3. **Schedule Overrides**
   - Day off
   - Custom hours
   - Time-off periods

4. **Conflict Prevention**
   - Real-time availability checking
   - Transaction-based booking
   - Concurrent booking prevention
   - Group session capacity management

5. **Real-time Synchronization**
   - Live availability updates
   - Instant booking notifications
   - Conflict detection and resolution

### Booking Flow

```
1. Client selects therapist
2. System fetches therapist availability
3. Client selects date and time slot
4. System checks for conflicts
5. Client confirms booking
6. Transaction creates appointment
7. Both parties receive notification
8. Video session credentials generated
```

---

## 🎥 Video Session Integration (Agora.io)

### Agora Components

- **App ID**: Identifies the application
- **Channel ID**: Unique per session
- **Token**: Secure access token (generated server-side)
- **UID**: Unique user identifier in session

### Video Session Flow

1. Appointment confirmed
2. Server generates Agora token via API route
3. Token stored in appointment document
4. Participants join channel using token
5. Real-time video/audio communication
6. Session metrics tracked in Firestore

### API Route

**`/api/agora/token/route.ts`** - Generates secure Agora tokens

---

## 💳 Payment Integration (Stripe)

### Payment Flow

1. Client books appointment
2. Stripe Payment Intent created
3. Client enters payment details
4. Payment processed
5. Appointment confirmed on success
6. Payment record stored in Firestore

### Stripe Configuration

- **Publishable Key**: Client-side
- **Secret Key**: Server-side
- **Webhook Secret**: Payment event handling

---

## 🌐 Environment Variables

Required environment variables (from `.env`):

### Firebase
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

### Agora
```
NEXT_PUBLIC_AGORA_APP_ID
AGORA_APP_CERTIFICATE
```

### Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

### Auth
```
NEXTAUTH_SECRET
NEXTAUTH_URL
```

### Optional (Email/SMS)
```
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
```

---

## 📊 Database Schema (TypeScript Types)

**File**: `src/types/database.ts`

### Core Entities

```typescript
// User roles
type UserRole = "client" | "therapist" | "admin"

// Main entities
interface User {
  id: string
  email: string
  profile: { displayName, firstName, lastName, ... }
  role: UserRole
  status: "active" | "inactive" | "suspended"
  preferences: { notifications, privacy }
  metadata: { createdAt, updatedAt, onboardingCompleted }
}

interface TherapistProfile {
  id: string
  credentials: { licenseNumber, specializations, ... }
  practice: { bio, yearsExperience, languages, hourlyRate }
  availability: { timezone, bufferMinutes, maxDailyHours }
  verification: { isVerified, verifiedAt, verifiedBy }
}

interface Appointment {
  id: string
  therapistId: string
  clientId: string
  scheduledFor: Timestamp
  timeSlotId: string
  duration: number
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  session: { type, deliveryType, platform, channelId, accessToken }
  payment: { amount, currency, status, transactionId }
  communication: { clientNotes, therapistNotes }
  metadata: { createdAt, confirmedAt, completedAt }
}

interface TimeSlot {
  id: string
  startTime: string  // "09:00"
  endTime: string    // "10:00"
  duration: number
  displayName: string
  isStandard: boolean
}

interface TherapistAvailability {
  id: string
  therapistId: string
  dayOfWeek: number  // 0-6
  timeSlotId: string
  status: "available" | "unavailable"
  recurringPattern: { type, endDate }
}

interface ScheduleOverride {
  id: string
  therapistId: string
  date: Timestamp
  type: "day_off" | "custom_hours" | "time_off"
  affectedSlots?: string[]
  reason: string
}
```

---

## 🚀 Development Status

### ✅ Completed Features

- Next.js 15 project setup with TypeScript
- Firebase integration (Auth, Firestore, Admin SDK)
- Authentication system (Email/Password, Google OAuth)
- User management with role-based routing
- Therapist profile management
- Scheduling system with time slots
- Availability management with recurring patterns
- Appointment booking flow
- Conflict prevention and validation
- Real-time data synchronization
- Agora video session integration
- Firestore security rules
- UI components with Shadcn/UI
- Responsive layouts
- Middleware authentication

### 🚧 Pending/Incomplete Features

- Admin dashboard functionality (UI exists, needs backend)
- Therapist verification workflow
- Stripe payment integration (configured but not fully implemented)
- Email/SMS notifications
- Appointment rescheduling UI
- Video session recording
- Group therapy sessions (backend ready, UI pending)
- Analytics and reporting
- Advanced search and filtering
- In-app messaging
- Mobile responsive optimization
- Deployment configuration

---

## 🎯 Admin Panel Requirements

### Current Admin Panel Status

**Location**: `/src/app/admin/page.tsx`

**Current State**: 
- Basic dashboard UI exists
- Shows placeholder stats (all zeros)
- Links to admin tools (not yet implemented)
- System status indicators (static)

### What Needs to Be Built for Admin Panel

1. **User Management**
   - List all users (clients, therapists, admins)
   - View user details
   - Suspend/activate users
   - Delete users
   - Search and filter users

2. **Therapist Verification**
   - List pending verifications
   - View therapist credentials
   - Review uploaded documents
   - Approve/reject therapists
   - Verification history

3. **Appointment Management**
   - View all appointments
   - Filter by status, date, therapist
   - Cancel appointments
   - Resolve conflicts
   - Appointment analytics

4. **Analytics & Reports**
   - User registration trends
   - Session statistics
   - Revenue reports
   - Therapist performance
   - Platform usage metrics

5. **System Configuration**
   - Time slot management
   - Platform settings
   - Feature flags
   - Email templates

6. **Audit Logs**
   - View system events
   - User actions tracking
   - Security events
   - Export logs

---

## 🔗 Integration with Frontend Project

### Frontend Project Location
`/Users/bibychacko/Desktop/Docplus/mindgood/`

### Integration Approach

Since this is a **backend + admin panel** and your frontend is separate:

1. **API Layer Needed**
   - Create REST API endpoints in `/src/app/api/`
   - Expose data for frontend consumption
   - Implement authentication middleware

2. **Shared Database**
   - Both projects should use the same Firebase project
   - Frontend reads from Firestore directly
   - Backend handles admin operations

3. **Authentication**
   - Share Firebase Auth between projects
   - Frontend handles client/therapist auth
   - Backend handles admin auth

4. **Recommended Architecture**
   ```
   Frontend (mindgood) → Firebase Auth/Firestore
                      ↓
   Admin Panel (agora_therapy) → Firebase Admin SDK
   ```

---

## 📚 Key Documentation Files

1. **`README.md`** - Basic Next.js readme
2. **`SETUP.md`** - Detailed setup instructions
3. **`SCHEDULING_SYSTEM_DOCUMENTATION.md`** - Comprehensive scheduling docs (1607 lines)
4. **`firestore.rules`** - Security rules documentation
5. **`PROJECT_OVERVIEW.md`** - This file

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

**Development URL**: http://localhost:3000

---

## 📝 Important Notes

1. **This is NOT a Flutter/Dart project** - It's Next.js/React/TypeScript
2. **Firebase is fully integrated** - It's the primary database
3. **Admin panel exists but needs functionality** - UI is there, backend logic needed
4. **Video sessions use Agora.io** - Not Zoom or custom solution
5. **Payments use Stripe** - Configuration exists, implementation incomplete
6. **Real-time features** - Uses Firestore real-time listeners
7. **Security rules are comprehensive** - 328 lines of role-based rules

---

## 🎨 UI/UX Stack

- **Design System**: Shadcn/UI (Radix UI primitives)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Animations**: Tailwind CSS animations
- **Responsive**: Mobile-first design

---

## 🔄 State Management Pattern

1. **Server State**: TanStack React Query
2. **Client State**: Zustand stores
3. **Form State**: React Hook Form
4. **Auth State**: Custom useAuth hook + Context
5. **Real-time State**: Custom hooks with Firestore listeners

---

## 🏁 Next Steps for Admin Panel Development

1. Create admin API routes for CRUD operations
2. Implement user management service
3. Build therapist verification workflow
4. Create appointment management interface
5. Implement analytics queries
6. Add audit logging
7. Build report generation
8. Create system configuration UI
9. Implement search and filtering
10. Add data export functionality

---

## 📞 Support & Resources

- **Firebase Console**: https://console.firebase.google.com/
- **Agora Console**: https://console.agora.io/
- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Firestore Docs**: https://firebase.google.com/docs/firestore

---

**Last Updated**: 2025-10-24
**Project Version**: 0.1.0
**Framework**: Next.js 15.4.7
