# My Availability - Calendly-Inspired Feature

## 🎯 Overview

A new **"My Availability"** section inspired by Calendly's intuitive interface, running parallel to the existing "My Schedule" feature. This provides therapists with a more flexible way to manage their availability using time ranges instead of discrete time slots.

## 🆚 Difference: My Schedule vs My Availability

### **My Schedule** (`/therapist/schedule`)
- **Slot-based system**: Works with predefined 30/60-minute time slots
- **Best for**: Structured appointment booking
- **Use case**: When you want clients to book specific time slots
- **Example**: 9:00 AM, 9:30 AM, 10:00 AM slots

### **My Availability** (`/therapist/availability`)
- **Time range system**: Set continuous availability windows
- **Best for**: Flexible scheduling and general availability
- **Use case**: When you want to show general working hours
- **Example**: 9:00 AM - 5:00 PM (continuous)

## ✨ Key Features

### 1. **Weekly Hours Editor** (Calendly-style)

```
┌─────────────────────────────────────────────────────────┐
│  Quick Templates:                                       │
│  [☕ Standard 9-5] [🌞 Morning] [🌙 Evening] [⚡ Flexible]│
├─────────────────────────────────────────────────────────┤
│  Weekly hours                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [M] 09:00 - 17:00  [×] [+] [📋]                 │   │
│  │ [T] 09:00 - 17:00  [×] [+] [📋]                 │   │
│  │ [W] 09:00 - 17:00  [×] [+] [📋]                 │   │
│  │ [T] 09:00 - 17:00  [×] [+] [📋]                 │   │
│  │ [F] 09:00 - 17:00  [×] [+] [📋]                 │   │
│  │ [S] Unavailable    [Add hours]                  │   │
│  │ [S] Unavailable    [Add hours]                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Click day circle to toggle availability
- ✅ Multiple time ranges per day
- ✅ Copy/paste between days
- ✅ Quick templates (Standard 9-5, Morning, Evening, Flexible)
- ✅ Add/remove time ranges with +/× buttons

### 2. **Date-Specific Hours Modal** (Calendly-inspired)

```
┌──────────────────────────────────────────────────────┐
│  Select the date(s) you want to assign specific hours│
│                                                       │
│  November 2025                          [< >]        │
│  ┌────────────────────────────────────────────────┐ │
│  │ SUN  MON  TUE  WED  THU  FRI  SAT              │ │
│  │                                                 │ │
│  │  2    3    4    5    ⦿6   ⦿7    8             │ │
│  │  9   10   11   12   13   ⦿14   15             │ │
│  │ 16   17   18   19   20   21   22              │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  What hours are you available?                       │
│  [09:00] - [17:00] [×] [+]                          │
│                                                       │
│  [Cancel]                            [Apply]         │
└──────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Calendar date picker (multi-select)
- ✅ Month navigation
- ✅ Today indicator
- ✅ Multiple time ranges
- ✅ Apply to multiple dates at once

### 3. **Date-Specific Hours Sidebar**

Shows all date overrides with ability to:
- View override details
- Delete overrides
- See which dates have custom hours

## 📁 File Structure

```
src/
├── components/
│   └── availability/
│       ├── WeeklyHoursEditor.tsx          # Main weekly hours interface
│       └── DateSpecificHoursModal.tsx     # Date picker modal
│
└── app/
    └── therapist/
        └── availability/
            └── page.tsx                    # Main availability page
```

## 🎨 UI Components

### WeeklyHoursEditor
- Day toggles with colored circles (M, T, W, T, F, S, S)
- Time range inputs (start - end)
- Add/remove time range buttons
- Copy/paste functionality
- Quick template buttons

### DateSpecificHoursModal
- Full calendar view
- Multi-date selection
- Time range editor
- Apply/Cancel actions

## 🔄 Data Flow

```typescript
interface TimeRange {
  start: string;  // "09:00"
  end: string;    // "17:00"
}

interface WeeklyHours {
  [dayOfWeek: number]: TimeRange[];
  // Example:
  // 1: [{ start: "09:00", end: "17:00" }]
  // 2: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }]
}

interface DateOverride {
  id: string;
  date: Date;
  hours: TimeRange[];
}
```

## 🎯 User Workflow

### Setting Weekly Hours:
1. Navigate to "My Availability"
2. Choose a template OR manually configure
3. Toggle days on/off
4. Add multiple time ranges per day
5. Copy hours between days
6. Save changes

### Setting Date-Specific Hours:
1. Click "+ Hours" in Date-specific section
2. Select date(s) from calendar
3. Set time ranges
4. Click "Apply"
5. Override appears in sidebar

## 💡 Key Interactions

### Day Toggle:
- **Click circle** → Toggle day availability
- **Blue circle** = Available
- **Gray circle** = Unavailable

### Time Ranges:
- **[×] button** → Remove time range
- **[+] button** → Add another time range
- **[📋] button** → Copy day's schedule

### Copy/Paste:
1. Click [📋] on source day
2. "Paste from [Day]" buttons appear on other days
3. Click to paste

### Templates:
- One-click apply predefined schedules
- Overwrites current weekly hours
- Instant visual feedback

## 🎨 Design Highlights

### Color Scheme:
- **Blue (#3B82F6)**: Primary actions, selected states
- **Gray**: Unavailable/disabled states
- **Green**: Success states
- **Red**: Delete actions

### Icons:
- ☕ Coffee: Standard 9-5
- 🌞 Sun: Morning hours
- 🌙 Moon: Evening hours
- ⚡ Zap: Flexible hours

## 📊 Stats Cards

1. **Weekly Hours**: Total hours available per week
2. **Active Days**: Number of days with availability
3. **Date Overrides**: Count of date-specific hours

## 🔮 Future Enhancements

### Phase 2:
- **Buffer time**: Automatic breaks between appointments
- **Minimum notice**: How far in advance clients can book
- **Maximum bookings**: Limit per day/week
- **Time zone support**: Display in client's timezone

### Phase 3:
- **Recurring patterns**: Every other week, monthly
- **Team scheduling**: Coordinate with other therapists
- **Calendar sync**: Google Calendar, Outlook integration
- **Smart suggestions**: AI-powered optimal hours

## 🎯 Benefits Over Slot System

### Flexibility:
- ✅ Set continuous availability windows
- ✅ Multiple ranges per day (morning + evening)
- ✅ Quick template application
- ✅ Easy copy/paste between days

### User Experience:
- ✅ Familiar Calendly-style interface
- ✅ Visual calendar for date selection
- ✅ Immediate feedback
- ✅ Less cognitive load

### Use Cases:
- ✅ General availability display
- ✅ Flexible scheduling
- ✅ Quick setup for new therapists
- ✅ Vacation/holiday management

## 🔄 Integration with My Schedule

Both systems can coexist:
- **My Availability**: Sets general working hours
- **My Schedule**: Defines specific bookable slots within those hours

Example:
- Availability: Monday 9 AM - 5 PM
- Schedule: Slots at 9:00, 10:00, 11:00, 2:00, 3:00, 4:00

This gives therapists maximum flexibility!

## 📝 Navigation

Added to sidebar:
```
Dashboard
Appointments
My Schedule          ← Slot-based system
My Availability      ← NEW! Time range system
My Clients
Payouts
Settings
```

---

**Status**: ✅ Implemented and ready for testing
**Next Steps**: Backend integration for saving/loading availability data
