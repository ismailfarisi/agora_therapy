# Availability Persistence Fix

## Problem
The availability page was not saving data to the backend. When users reloaded the page, all their changes were lost because:
1. The save function had a `TODO: Save to backend` comment
2. It was only simulating the save with a timeout
3. No data was being persisted to Firebase

## Solution
Integrated the existing `AvailabilityService` and `TimeSlotService` to properly save and load availability data from Firebase.

## Changes Made

### 1. **Added Required Imports**
```typescript
import { AvailabilityService } from "@/lib/services/availability-service";
import { TimeSlotService } from "@/lib/services/timeslot-service";
import { TimeSlot, TherapistAvailability } from "@/types/database";
import { Timestamp } from "firebase/firestore";
```

### 2. **Added Data Loading on Mount**
```typescript
useEffect(() => {
  const loadData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Load time slots
      const slots = await TimeSlotService.getTimeSlots();
      setTimeSlots(slots);

      // Load existing availability
      const availability = await AvailabilityService.getTherapistAvailability(user.uid);
      
      // Convert availability records to weekly hours format
      if (availability.length > 0) {
        const converted = convertAvailabilityToWeeklyHours(availability, slots);
        setWeeklyHours(converted);
      }

      // Load schedule overrides
      const overrides = await AvailabilityService.getScheduleOverrides(user.uid);
      const convertedOverrides = overrides.map(override => ({
        id: override.id,
        date: (override.date as Timestamp).toDate(),
        hours: override.affectedSlots?.map(slotId => {
          const slot = slots.find(s => s.id === slotId);
          return {
            start: slot?.startTime || "09:00",
            end: slot?.endTime || "17:00"
          };
        }) || []
      }));
      setDateOverrides(convertedOverrides);
    } catch (error) {
      console.error("Error loading availability:", error);
      toast.error("Load Failed", "Failed to load your availability data");
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [user?.uid, toast]);
```

### 3. **Implemented Real Save Function**
```typescript
const handleSaveWeeklyHours = async () => {
  if (!user?.uid) {
    toast.error("Error", "User not authenticated");
    return;
  }

  try {
    setLoading(true);

    // Convert weekly hours to time slot IDs
    const weeklySchedule: { [dayOfWeek: number]: string[] } = {};
    
    for (const [dayStr, ranges] of Object.entries(weeklyHours)) {
      const dayOfWeek = parseInt(dayStr);
      const slotIds: string[] = [];

      for (const range of ranges) {
        // Find all time slots that fall within this range
        const matchingSlots = timeSlots.filter(slot => {
          return slot.startTime >= range.start && slot.endTime <= range.end;
        });
        slotIds.push(...matchingSlots.map(s => s.id));
      }

      if (slotIds.length > 0) {
        weeklySchedule[dayOfWeek] = slotIds;
      }
    }

    // Save to backend
    await AvailabilityService.setWeeklySchedule(user.uid, weeklySchedule);
    
    toast.success(
      "Availability Updated",
      "Your weekly hours have been saved successfully"
    );
  } catch (error) {
    console.error("Error saving weekly hours:", error);
    toast.error(
      "Save Failed",
      "Failed to save your availability. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
```

### 4. **Added Conversion Helper Function**
Converts Firebase availability records (slot-based) to UI format (time ranges):

```typescript
const convertAvailabilityToWeeklyHours = (
  availability: TherapistAvailability[],
  slots: TimeSlot[]
): WeeklyHours => {
  const weeklyHours: WeeklyHours = {};

  // Group by day of week
  const byDay: { [day: number]: string[] } = {};
  availability.forEach(av => {
    if (!byDay[av.dayOfWeek]) {
      byDay[av.dayOfWeek] = [];
    }
    byDay[av.dayOfWeek].push(av.timeSlotId);
  });

  // Convert to time ranges
  for (const [dayStr, slotIds] of Object.entries(byDay)) {
    const day = parseInt(dayStr);
    const daySlots = slotIds
      .map(id => slots.find(s => s.id === id))
      .filter(Boolean)
      .sort((a, b) => (a!.startTime || "").localeCompare(b!.startTime || ""));

    if (daySlots.length > 0) {
      // Group consecutive slots into ranges
      const ranges: TimeRange[] = [];
      let currentRange: TimeRange | null = null;

      for (const slot of daySlots) {
        if (!slot) continue;

        if (!currentRange) {
          currentRange = { start: slot.startTime, end: slot.endTime };
        } else if (currentRange.end === slot.startTime) {
          // Extend current range
          currentRange.end = slot.endTime;
        } else {
          // Start new range
          ranges.push(currentRange);
          currentRange = { start: slot.startTime, end: slot.endTime };
        }
      }

      if (currentRange) {
        ranges.push(currentRange);
      }

      weeklyHours[day] = ranges;
    }
  }

  return weeklyHours;
};
```

### 5. **Implemented Date Override Persistence**
```typescript
const handleApplyDateOverride = async (dates: Date[], hours: TimeRange[]) => {
  if (!user?.uid) {
    toast.error("Error", "User not authenticated");
    return;
  }

  try {
    // Convert time ranges to slot IDs
    const slotIds: string[] = [];
    for (const range of hours) {
      const matchingSlots = timeSlots.filter(slot => {
        return slot.startTime >= range.start && slot.endTime <= range.end;
      });
      slotIds.push(...matchingSlots.map(s => s.id));
    }

    // Create overrides for each date
    const newOverrides: DateOverride[] = [];
    for (const date of dates) {
      const overrideId = await AvailabilityService.createScheduleOverride({
        therapistId: user.uid,
        date: Timestamp.fromDate(date),
        type: "custom_hours",
        reason: "Custom hours for specific date",
        affectedSlots: slotIds,
        isRecurring: false,
        metadata: {
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          notes: "Custom hours for specific date"
        }
      });

      newOverrides.push({
        id: overrideId,
        date,
        hours: [...hours]
      });
    }

    setDateOverrides([...dateOverrides, ...newOverrides]);
    
    toast.success(
      "Date Override Added",
      `Added specific hours for ${dates.length} date${dates.length !== 1 ? 's' : ''}`
    );
  } catch (error) {
    console.error("Error creating date override:", error);
    toast.error("Failed", "Failed to create date override");
  }
};
```

### 6. **Implemented Delete Override**
```typescript
const handleDeleteOverride = async (id: string) => {
  try {
    await AvailabilityService.deleteScheduleOverride(id);
    setDateOverrides(dateOverrides.filter((o) => o.id !== id));
    toast.success("Override Deleted", "Date-specific hours have been removed");
  } catch (error) {
    console.error("Error deleting override:", error);
    toast.error("Failed", "Failed to delete override");
  }
};
```

## How It Works

### Data Flow

1. **On Page Load:**
   - Fetch all time slots from Firebase
   - Fetch therapist's availability records
   - Convert slot-based data to time ranges for UI
   - Load existing date overrides

2. **On Save:**
   - Convert UI time ranges to time slot IDs
   - Call `AvailabilityService.setWeeklySchedule()` 
   - This clears old availability and creates new records
   - Show success/error toast

3. **On Date Override:**
   - Convert time ranges to slot IDs
   - Create schedule override in Firebase
   - Update local state
   - Show success toast

4. **On Delete Override:**
   - Delete from Firebase
   - Update local state
   - Show success toast

### Data Conversion

**UI Format (Time Ranges):**
```typescript
{
  1: [{ start: "09:00", end: "17:00" }],  // Monday 9 AM - 5 PM
  2: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }]  // Tuesday split
}
```

**Firebase Format (Time Slots):**
```typescript
{
  1: ["slot_09_00", "slot_09_30", "slot_10_00", ...],  // Array of slot IDs
  2: ["slot_09_00", "slot_09_30", ...]
}
```

The conversion logic:
- **Save:** Finds all time slots that fall within each time range
- **Load:** Groups consecutive time slots into continuous ranges

## Benefits

✅ **Persistent Data**: Changes are saved to Firebase and survive page reloads
✅ **Real-time Sync**: Uses existing AvailabilityService infrastructure
✅ **Error Handling**: Proper try-catch with user-friendly error messages
✅ **Loading States**: Shows spinner during save/load operations
✅ **Toast Notifications**: Clear feedback for all operations
✅ **Type Safety**: Full TypeScript integration

## Testing Checklist

- [x] Save weekly hours → Data persists after reload
- [x] Add date override → Saved to Firebase
- [x] Delete date override → Removed from Firebase
- [x] Load existing availability → Converts correctly to UI format
- [x] Error handling → Shows appropriate error messages
- [x] Loading states → Spinner shows during operations
- [x] Toast messages → Success/error notifications work

## Notes

- The system uses the existing time slot infrastructure
- Time ranges are converted to discrete time slots for storage
- This maintains compatibility with the booking system
- The UI provides a more intuitive time-range interface
- Backend stores granular time slot data for precise scheduling
