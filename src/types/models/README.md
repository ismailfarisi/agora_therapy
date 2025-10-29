# Database Models

This directory contains all database type definitions organized by model for better maintainability.

## Structure

```
models/
├── index.ts              # Central export for all models
├── user.ts               # User and authentication types
├── therapist.ts          # Therapist profile and search types
├── appointment.ts        # Appointment and session types
├── availability.ts       # Time slots and scheduling types
├── payment.ts            # Payment, payout, and refund types
├── review.ts             # Review and rating types
├── notification.ts       # Notification types
├── audit.ts              # Audit logging types
└── stats.ts              # Platform statistics types
```

## Usage

### Import from database.ts (Recommended)

For backward compatibility, continue importing from the main database file:

```typescript
import { User, Appointment, TherapistProfile } from '@/types/database';
```

### Import from specific models

For better tree-shaking and clarity, you can import directly from models:

```typescript
import { User, UserRole } from '@/types/models/user';
import { Appointment, AppointmentStatus } from '@/types/models/appointment';
import { TherapistProfile } from '@/types/models/therapist';
```

### Import from models index

Import multiple types from different models:

```typescript
import { 
  User, 
  Appointment, 
  TherapistProfile,
  Review,
  Payout 
} from '@/types/models';
```

## Model Organization

### user.ts
- `User` - Core user entity
- `UserRole` - User role enum
- `UserStatus` - User status enum
- `UserRegistrationData` - Registration form data

### therapist.ts
- `TherapistProfile` - Therapist profile entity
- `TherapistOnboardingData` - Onboarding form data
- `TherapistSearchFilters` - Search and filter types

### appointment.ts
- `Appointment` - Appointment entity
- `AppointmentStatus` - Status enum
- `SessionType` - Session type enum
- `SessionDeliveryType` - Delivery method enum
- `SessionPlatform` - Platform enum
- `BookingRequest` - Booking form data
- `SessionCredentials` - Agora session credentials

### availability.ts
- `TimeSlot` - Time slot entity
- `TherapistAvailability` - Availability schedule
- `ScheduleOverride` - Schedule exceptions
- `AvailableSlot` - Computed available slot
- `EnhancedAvailableSlot` - Enhanced slot with timezone info
- `OverrideType` - Override type enum

### payment.ts
- `PaymentIntent` - Payment entity
- `Payout` - Payout entity
- `Refund` - Refund entity
- `PaymentStatus` - Payment status enum

### review.ts
- `Review` - Review entity

### notification.ts
- `Notification` - Notification entity

### audit.ts
- `AuditLog` - Audit log entity

### stats.ts
- `PlatformStats` - Platform statistics interface

## Adding New Models

1. Create a new file in `src/types/models/` (e.g., `message.ts`)
2. Define your types with proper JSDoc comments
3. Export the new module in `index.ts`:
   ```typescript
   export * from './message';
   ```
4. Types will automatically be available via `@/types/database`

## Best Practices

1. **One model per file** - Keep related types together
2. **Use descriptive names** - Make types self-documenting
3. **Add JSDoc comments** - Document complex types
4. **Export enums** - Make enums available for validation
5. **Keep it DRY** - Reuse types across models when appropriate

## Migration Notes

All existing imports from `@/types/database` will continue to work without changes. The refactoring maintains full backward compatibility while improving code organization.

### Before
```typescript
// All types in one 400+ line file
src/types/database.ts
```

### After
```typescript
// Organized by model
src/types/models/
  ├── user.ts           (~50 lines)
  ├── therapist.ts      (~70 lines)
  ├── appointment.ts    (~80 lines)
  ├── availability.ts   (~70 lines)
  ├── payment.ts        (~60 lines)
  ├── review.ts         (~20 lines)
  ├── notification.ts   (~30 lines)
  ├── audit.ts          (~15 lines)
  └── stats.ts          (~30 lines)
```

## Benefits

✅ **Better Organization** - Each model in its own file
✅ **Easier Maintenance** - Find and update types quickly
✅ **Better Git Diffs** - Changes isolated to specific models
✅ **Improved Tree-Shaking** - Import only what you need
✅ **Backward Compatible** - No breaking changes
✅ **Scalable** - Easy to add new models
