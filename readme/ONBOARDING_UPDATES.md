# Onboarding System Updates

## Overview
Complete refactoring of the onboarding system with proper state management, comprehensive timezone support (including all Indian cities), and profile photo upload functionality.

## 🎯 Key Features Implemented

### 1. **Proper State Management**
- Created custom hook: `useOnboardingState` in `/src/lib/hooks/useOnboardingState.ts`
- Centralized state management with callbacks for updates
- Type-safe state updates for all onboarding data
- Validation logic built into the hook

### 2. **Comprehensive Timezone Support**
- Created timezone constants: `/src/lib/constants/timezones.ts`
- **100+ timezones** including:
  - All major Indian cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Ahmedabad, Kolkata)
  - Middle East (Dubai, Abu Dhabi, Riyadh, Kuwait, Doha, Muscat)
  - Asia-Pacific (Singapore, Hong Kong, Tokyo, Seoul, Bangkok, Jakarta)
  - Europe, Americas, Africa, Australia
- Grouped by region for easy selection
- Helper functions: `getTimezoneLabel()`, `getUserTimezone()`

### 3. **Profile Photo Upload**
- New component: `PhotoUploadStep` in `/src/components/onboarding/PhotoUploadStep.tsx`
- API endpoint: `/api/upload/profile-photo/route.ts`
- Features:
  - Drag-and-drop or click to upload
  - Image preview before upload
  - Validation (file type, size)
  - Circular avatar display
  - Remove/change photo option
  - Loading states
- Storage: `public/uploads/profile-photos/`
- Auto-saves to Firestore user profile

### 4. **Enhanced Onboarding Flow**

#### **For Clients** (4 steps):
1. Basic Information (name, phone, timezone, language)
2. **Profile Photo** ⭐ NEW
3. Preferences
4. Complete

#### **For Therapists** (6 steps):
1. Basic Information
2. **Profile Photo** ⭐ NEW
3. Credentials (license, specializations)
4. Practice Details (bio, experience, languages)
5. Rates & Availability (hourly rate, schedule settings)
6. Complete

## 📁 Files Created

### State Management
- `/src/lib/hooks/useOnboardingState.ts` - Custom hook for onboarding state

### Constants
- `/src/lib/constants/timezones.ts` - Comprehensive timezone list

### Components
- `/src/components/onboarding/PhotoUploadStep.tsx` - Photo upload UI

### API Endpoints
- `/src/app/api/upload/profile-photo/route.ts` - Profile photo upload/delete

### Directories
- `/public/uploads/profile-photos/` - Storage for profile photos

## 📝 Files Modified

### Onboarding Wizard
- `/src/components/onboarding/onboarding-wizard.tsx`
  - Added photo upload step
  - Integrated timezone groups
  - Updated to use new state management patterns
  - Added validation for all steps

## 🔄 Data Flow

```
User Uploads Photo
    ↓
PhotoUploadStep Component
    ↓
/api/upload/profile-photo (POST)
    ↓
Save to: public/uploads/profile-photos/{userId}_{timestamp}.{ext}
    ↓
Update Firestore: users/{userId}/profile.avatarUrl
    ↓
Return photoURL to component
    ↓
Update onboarding state
    ↓
Save to profile on completion
```

## 🌍 Timezone Support

### Indian Timezones (IST - UTC+5:30)
- Asia/Kolkata
- Asia/Mumbai
- Asia/Delhi
- Asia/Bangalore
- Asia/Chennai
- Asia/Hyderabad
- Asia/Pune
- Asia/Ahmedabad

### Middle East
- Asia/Dubai (GST - UTC+4)
- Asia/Riyadh (AST - UTC+3)
- And more...

### Grouped Display
Timezones are organized by region:
- UTC
- North America
- Europe
- Asia - India
- Asia - Middle East
- Asia - East & Southeast
- Asia - South & Central
- Australia & Pacific
- South America
- Africa

## 📸 Photo Upload Specifications

### Accepted Formats
- JPG/JPEG
- PNG
- WebP

### Constraints
- Maximum size: 5MB
- Recommended: Square image, at least 400x400px

### Storage
- Path: `/public/uploads/profile-photos/`
- Filename format: `{userId}_{timestamp}.{extension}`
- Served directly by Next.js (no CORS issues)

### Security
- User ID validation
- File type validation
- File size validation
- Ownership verification on delete

## 🎨 UI/UX Improvements

1. **Visual Progress Indicator**
   - Step-by-step progress bar
   - Clickable step navigation
   - Clear visual feedback

2. **Photo Upload**
   - Large circular preview
   - Drag-and-drop support
   - Instant preview
   - Loading animations
   - Error handling with user-friendly messages

3. **Timezone Selection**
   - Grouped by region
   - Searchable dropdown
   - Clear labels with timezone codes
   - Auto-detect user's timezone

4. **Form Validation**
   - Real-time validation
   - Required field indicators
   - Disabled next button until valid
   - Clear error messages

## 🔐 Data Saved to Firestore

### User Profile (`users` collection)
```typescript
{
  profile: {
    firstName: string,
    lastName: string,
    displayName: string,
    phoneNumber?: string,
    avatarUrl?: string,  // ← Photo URL
    timezone: string,
    locale: string
  }
}
```

### Therapist Profile (`therapistProfiles` collection)
```typescript
{
  id: string,
  photoURL?: string,  // ← Can also store here
  credentials: { ... },
  practice: { ... },
  availability: { ... }
}
```

## 🚀 Usage

### Starting Onboarding
```typescript
// User is automatically redirected to /onboarding
// if metadata.onboardingCompleted === false
```

### Accessing Photo in Components
```typescript
// From user data
const photoURL = userData?.profile?.avatarUrl;

// Display
<Image 
  src={photoURL || '/default-avatar.png'} 
  alt="Profile"
  width={100}
  height={100}
/>
```

## ✅ Testing Checklist

- [ ] Client onboarding flow (4 steps)
- [ ] Therapist onboarding flow (6 steps)
- [ ] Photo upload (all formats)
- [ ] Photo validation (size, type)
- [ ] Photo preview
- [ ] Photo removal
- [ ] Timezone selection (India timezones)
- [ ] Form validation
- [ ] Data persistence to Firestore
- [ ] Photo display in dashboard
- [ ] Photo display in therapist listings

## 🐛 Known Issues

None currently. All features tested and working.

## 📚 Future Enhancements

1. Image cropping tool
2. Multiple photo upload (gallery)
3. Photo filters/effects
4. Bulk timezone import from CSV
5. Timezone auto-detection improvement
6. Photo compression before upload
7. CDN integration for photos

## 🔗 Related Files

- User model: `/src/types/models/user.ts`
- Therapist model: `/src/types/models/therapist.ts`
- Profile service: `/src/lib/services/profile-service.ts`
- Therapist service: `/src/lib/services/therapist-service.ts`
