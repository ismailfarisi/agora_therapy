# Schedule Configuration Components

This directory contains the enhanced schedule configuration UI components for the therapist profile page.

## Components

### EnhancedAvailabilityTab

The main container component that replaces the existing "Rates & Availability" tab content. Provides a comprehensive schedule management interface.

**Features:**

- Integrated schedule configuration and override management
- Quick actions and preview widgets
- Statistics and analytics
- Responsive layout with proper grid system

### ScheduleConfigurationSection

Card component that displays the current schedule status and provides setup/management buttons.

**Features:**

- Dynamic status detection (not configured, inactive, active)
- Quick stats and action buttons
- Visual status indicators

### ScheduleOverrideSection

Card component that shows schedule override summary and provides management actions.

**Features:**

- Lists upcoming overrides
- Quick add override functionality
- Override type indicators and badges

### SchedulePreviewWidget

Widget that displays the next 7 days of availability in a compact format.

**Features:**

- Shows availability status for upcoming week
- Color-coded availability indicators
- Loading and error states

### ScheduleSetupModal

Container modal that embeds the existing RecurringScheduleSetup and ScheduleOverrides components.

**Features:**

- Tabbed interface for schedule and overrides
- Unsaved changes detection
- Responsive modal design

## Integration

These components are designed to integrate with existing services:

- `useRealtimeAvailability` hook for data
- `AvailabilityService` for data operations
- Existing `RecurringScheduleSetup` and `ScheduleOverrides` components
- UI components from `/src/components/ui/`

## Usage

```tsx
import { EnhancedAvailabilityTab } from "@/components/therapist/schedule";

// In therapist profile page
<EnhancedAvailabilityTab />;
```

## Type Safety

All components include proper TypeScript interfaces and utilize existing database types from `/src/types/database.ts`.

## Accessibility

Components include:

- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
