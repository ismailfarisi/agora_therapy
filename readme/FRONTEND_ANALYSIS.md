# Frontend Website Analysis & Admin Panel Requirements

## 📊 Frontend Website Overview

**Location**: `/Users/bibychacko/Desktop/Docplus/mindgood/`
**Framework**: Next.js 15.3.5 with React 19
**Type**: Public-facing website (NOT an admin panel)

---

## 🎯 Current Frontend Architecture

### **Technology Stack**
```json
{
  "framework": "Next.js 15.3.5",
  "react": "19.0.0",
  "styling": "Tailwind CSS 4",
  "payment": "Stripe (@stripe/react-stripe-js, @stripe/stripe-js)",
  "booking": "Calendly (react-calendly)",
  "animations": "Framer Motion",
  "icons": "React Icons",
  "i18n": "next-i18next"
}
```

### **Current Data Source**
⚠️ **CRITICAL FINDING**: The frontend currently uses **HARDCODED DATA** from local files:
- `/src/lib/data/psychologists.ts` - Static psychologist data
- `/src/lib/data/blogPosts.ts` - Static blog posts

**This means the frontend is NOT connected to any backend API yet!**

---

## 📁 Frontend Pages & Features

### **1. Public Pages**

#### **Homepage** (`/`)
- Hero section with CTA
- Language support showcase (Malayalam, Tamil, Hindi, Telugu, Kannada, English)
- Services/specializations overview
- Featured psychologists (first 3 from hardcoded data)
- "How It Works" section
- CTA section

#### **Psychologists Directory** (`/psychologists`)
- Grid view of all psychologists
- Filters (client-side):
  - By specialization
  - By language
  - By experience level
- Psychologist cards showing:
  - Photo
  - Name & title
  - Languages (first 2 + count)
  - Specializations (first 2 + count)
  - Rating & experience
  - "View Profile" button

#### **Psychologist Detail** (`/psychologists/[id]`)
- Full profile with photo
- Rating & reviews count
- Languages with proficiency levels
- Years of experience
- Full bio
- Education & credentials
- Specializations
- **Calendly booking widget** (embedded)

#### **Booking Flow** (`/booking/[id]`)
- 3-step process:
  1. **Calendar**: Select date/time via Calendly
  2. **Payment**: Stripe payment integration
  3. **Confirmation**: Booking confirmed page
- Shows psychologist info
- Progress indicator
- Appointment details summary

#### **Other Pages**
- `/about` - About page
- `/services` - Services listing
- `/blog` - Blog listing
- `/blog/[slug]` - Individual blog posts
- `/contact` - Contact form
- `/faq` - FAQ page
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/dashboard` - User dashboard (client-side)
- `/dashboard/profile` - User profile
- `/payment-demo` - Payment demo page

---

## 🔍 Current Data Structure

### **Psychologist Interface** (from hardcoded data)
```typescript
interface Psychologist {
  id: string;
  name: string;
  title: string;
  image: string;
  languages: Language[];
  specializations: string[];
  experience: number;
  bio: string;
  education: string[];
  calendlyLink: string;
  rating: number;
  reviewCount: number;
  availableSlots?: string[];
}

interface Language {
  name: string;
  code: string;
  proficiency: 'native' | 'fluent' | 'conversational';
}

interface Specialization {
  id: string;
  name: string;
  description: string;
}
```

### **Hardcoded Specializations**
1. Job Stress
2. Career Building
3. Family Orientation
4. Learning Disabilities
5. Anxiety
6. Depression

### **Hardcoded Languages**
- Malayalam (ml)
- Tamil (ta)
- Hindi (hi)
- Telugu (te)
- Kannada (kn)
- English (en)

### **Hardcoded Psychologists** (6 total)
1. Soney George - Malayalam, English
2. Dr. Akhil - Malayalam, English
3. Dr. Lakshmi Menon - Malayalam, Tamil, English
4. Dr. Anand Sharma - Hindi, English, Kannada
5. Dr. Meena Reddy - Telugu, English, Hindi
6. Dr. Suresh Pillai - Malayalam, English, Tamil

---

## 🚨 Critical Gaps & Requirements

### **What the Frontend NEEDS from Admin Panel**

#### **1. Psychologist Management API** ⚠️ **HIGHEST PRIORITY**

The frontend needs to replace hardcoded data with API calls:

```typescript
// Current (hardcoded):
import { psychologists } from '@/lib/data/psychologists';

// Needed (API):
const response = await fetch('https://admin.mindgood.com/api/v1/therapists?verified=true');
const { data: psychologists } = await response.json();
```

**Required API Endpoints**:
- ✅ `GET /api/v1/therapists` - List all verified therapists (ALREADY CREATED)
- ✅ `GET /api/v1/therapists/:id` - Get therapist details (ALREADY CREATED)
- ✅ `POST /api/v1/therapists/search` - Advanced search (ALREADY CREATED)
- ❌ `GET /api/v1/therapists/:id/availability` - Get real availability (NOT YET)
- ❌ `GET /api/v1/therapists/:id/reviews` - Get reviews (NOT YET)

#### **2. Booking/Appointment API** ⚠️ **HIGH PRIORITY**

Currently uses Calendly directly. Needs backend integration:

**Required API Endpoints**:
- ✅ `POST /api/v1/appointments` - Create appointment (ALREADY CREATED)
- ✅ `GET /api/v1/appointments` - List user appointments (ALREADY CREATED)
- ✅ `GET /api/v1/appointments/:id` - Get appointment details (ALREADY CREATED)
- ❌ `POST /api/v1/appointments/:id/confirm` - Confirm after payment (NOT YET)
- ❌ `POST /api/v1/appointments/:id/reschedule` - Reschedule (NOT YET)

#### **3. Payment Integration** ⚠️ **HIGH PRIORITY**

Frontend has Stripe UI but needs backend:

**Required API Endpoints**:
- ❌ `POST /api/v1/payments/create-intent` - Create Stripe payment intent (NOT YET)
- ❌ `POST /api/v1/payments/confirm` - Confirm payment (NOT YET)
- ❌ `POST /api/v1/payments/webhook` - Stripe webhook handler (NOT YET)

#### **4. User Authentication** ⚠️ **MEDIUM PRIORITY**

Frontend has dashboard pages but no auth:

**Required**:
- Firebase Auth integration on frontend
- User registration/login
- Session management
- Protected routes

#### **5. User Dashboard** ⚠️ **MEDIUM PRIORITY**

Frontend has `/dashboard` and `/dashboard/profile` but needs:

**Required API Endpoints**:
- ✅ `GET /api/v1/profile` - Get user profile (ALREADY CREATED)
- ✅ `PUT /api/v1/profile` - Update profile (ALREADY CREATED)
- ❌ `GET /api/v1/dashboard/stats` - User statistics (NOT YET)
- ❌ `GET /api/v1/dashboard/upcoming-appointments` - Upcoming sessions (NOT YET)

#### **6. Reviews & Ratings** ⚠️ **LOW PRIORITY**

Frontend shows ratings but they're hardcoded:

**Required API Endpoints**:
- ❌ `GET /api/v1/therapists/:id/reviews` - Get reviews (NOT YET)
- ❌ `POST /api/v1/reviews` - Submit review (NOT YET)
- ❌ `GET /api/v1/reviews/:id` - Get review details (NOT YET)

#### **7. Blog/Content Management** ⚠️ **LOW PRIORITY**

Frontend has blog pages with hardcoded content:

**Required API Endpoints**:
- ❌ `GET /api/v1/blog/posts` - List blog posts (NOT YET)
- ❌ `GET /api/v1/blog/posts/:slug` - Get blog post (NOT YET)

---

## 🔄 Migration Strategy: Hardcoded → API

### **Phase 1: Core Functionality** (Week 1-2)

1. **Replace Hardcoded Psychologists**
   ```typescript
   // OLD: src/lib/data/psychologists.ts
   export const psychologists = [...]; // Hardcoded
   
   // NEW: src/lib/api/therapists.ts
   export async function getTherapists() {
     const response = await fetch(`${API_URL}/therapists?verified=true`);
     return response.json();
   }
   ```

2. **Integrate Booking API**
   - Replace Calendly-only flow with API calls
   - Create appointment in database
   - Link with Calendly event

3. **Add Payment Backend**
   - Create Stripe payment intent via API
   - Confirm payment via webhook
   - Update appointment status

### **Phase 2: User Features** (Week 3)

4. **Add Authentication**
   - Integrate Firebase Auth on frontend
   - Protect dashboard routes
   - Add login/register pages

5. **Build User Dashboard**
   - Fetch user appointments from API
   - Show upcoming sessions
   - Display user profile

### **Phase 3: Enhanced Features** (Week 4+)

6. **Reviews System**
   - Fetch real reviews from API
   - Allow users to submit reviews
   - Calculate ratings dynamically

7. **Content Management**
   - Fetch blog posts from API
   - Admin can manage content

---

## 📋 Admin Panel Must-Have Features

### **For Frontend to Function Properly**

#### **1. Therapist Management** ✅ **CRITICAL**
- ✅ Create/Edit/Delete therapists (API exists)
- ✅ Upload therapist photos (Firebase Storage)
- ✅ Manage specializations
- ✅ Manage languages
- ✅ Set hourly rates
- ✅ Verify therapists
- ❌ Manage Calendly links (UI needed)
- ❌ Bulk import therapists (UI needed)

#### **2. Appointment Management** ✅ **CRITICAL**
- ✅ View all appointments (API exists)
- ❌ Appointment calendar view (UI needed)
- ❌ Filter by status/date/therapist (UI needed)
- ❌ Cancel/reschedule appointments (API exists, UI needed)
- ❌ Send reminders (Backend needed)

#### **3. Payment Management** ❌ **CRITICAL**
- ❌ View all transactions (API needed)
- ❌ Refund management (API needed)
- ❌ Revenue reports (API needed)
- ❌ Stripe integration setup (Backend needed)

#### **4. User Management** ❌ **HIGH PRIORITY**
- ❌ View all users (API needed)
- ❌ User details & history (API needed)
- ❌ Suspend/activate users (API needed)
- ❌ User statistics (API needed)

#### **5. Content Management** ❌ **MEDIUM PRIORITY**
- ❌ Manage blog posts (API needed)
- ❌ Manage services/specializations (API needed)
- ❌ Manage FAQs (API needed)
- ❌ Manage static pages (API needed)

#### **6. Analytics & Reports** ❌ **MEDIUM PRIORITY**
- ❌ Platform statistics (API needed)
- ❌ Revenue reports (API needed)
- ❌ User growth metrics (API needed)
- ❌ Therapist performance (API needed)

---

## 🔧 Required Admin Panel Features

### **Immediate Needs** (to make frontend functional)

1. **Therapist CRUD Interface**
   - Form to add/edit therapists
   - Upload photos
   - Set specializations & languages
   - Set Calendly link
   - Set hourly rate
   - Verify/unverify toggle

2. **Appointment Dashboard**
   - Calendar view of all appointments
   - Filter & search
   - View appointment details
   - Cancel/reschedule functionality

3. **Payment Setup**
   - Stripe configuration
   - Payment intent creation
   - Webhook handling
   - Transaction history

### **Secondary Needs** (for full functionality)

4. **User Management**
   - User list with filters
   - User profile view
   - Appointment history per user
   - Suspend/activate users

5. **Content Management**
   - Blog post editor
   - Specialization management
   - Language management
   - FAQ management

6. **Analytics Dashboard**
   - Key metrics (users, appointments, revenue)
   - Charts & graphs
   - Export reports

---

## 🗺️ Data Flow Architecture

### **Current State** (Hardcoded)
```
Frontend (mindgood)
├── Hardcoded psychologists.ts
├── Hardcoded blogPosts.ts
└── Calendly direct integration
```

### **Target State** (API-driven)
```
Frontend (mindgood)
├── API calls to admin.mindgood.com
├── Firebase Auth for users
└── Stripe for payments
         │
         ▼
Admin Panel (agora_therapy)
├── REST API endpoints
├── Firebase Admin SDK
├── Stripe integration
└── Admin UI for management
         │
         ▼
Firebase Database
├── therapistProfiles
├── appointments
├── users
├── payments
└── content
```

---

## 📊 Database Schema Mapping

### **Frontend Needs → Database Collections**

| Frontend Data | Database Collection | Status |
|---------------|---------------------|--------|
| Psychologists | `therapistProfiles` | ✅ Exists |
| Appointments | `appointments` | ✅ Exists |
| Users | `users` | ✅ Exists |
| Reviews | `reviews` | ❌ Needs creation |
| Payments | `paymentIntents` | ✅ Exists |
| Blog Posts | `blogPosts` | ❌ Needs creation |
| Specializations | `specializations` | ❌ Needs creation |
| Languages | `languages` | ❌ Needs creation |

---

## 🚀 Implementation Priority

### **Phase 1: Make Frontend Functional** (2 weeks)

1. **Week 1: Therapist API Integration**
   - Frontend: Replace hardcoded data with API calls
   - Admin: Build therapist management UI
   - Test: Verify therapist listing and details work

2. **Week 2: Booking & Payment**
   - Backend: Create payment API endpoints
   - Frontend: Integrate payment flow
   - Admin: Build appointment management UI
   - Test: Complete end-to-end booking flow

### **Phase 2: User Features** (1 week)

3. **Week 3: Authentication & Dashboard**
   - Frontend: Add Firebase Auth
   - Frontend: Build user dashboard
   - Admin: User management UI
   - Test: User registration and dashboard access

### **Phase 3: Enhanced Features** (Ongoing)

4. **Week 4+: Reviews, Content, Analytics**
   - Backend: Reviews API
   - Backend: Content management API
   - Admin: Content management UI
   - Admin: Analytics dashboard

---

## 📝 API Endpoints Checklist

### ✅ **Already Created** (from previous work)
- `GET /api/v1/therapists` - List therapists
- `GET /api/v1/therapists/:id` - Get therapist details
- `POST /api/v1/therapists` - Create therapist
- `PUT /api/v1/therapists/:id` - Update therapist
- `DELETE /api/v1/therapists/:id` - Delete therapist
- `POST /api/v1/therapists/search` - Search therapists
- `GET /api/v1/appointments` - List appointments
- `GET /api/v1/appointments/:id` - Get appointment details
- `POST /api/v1/appointments` - Create appointment
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment
- `GET /api/v1/availability/:therapistId` - Get availability
- `GET /api/v1/timeslots` - Get time slots
- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update profile
- `POST /api/agora/token` - Generate video token

### ❌ **Still Needed**
- `POST /api/v1/payments/create-intent` - Create payment
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/webhook` - Stripe webhook
- `GET /api/v1/reviews` - List reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/blog/posts` - List blog posts
- `GET /api/v1/blog/posts/:slug` - Get blog post
- `GET /api/v1/specializations` - List specializations
- `GET /api/v1/languages` - List languages

---

## 🎯 Summary

### **Critical Findings**

1. ⚠️ **Frontend uses HARDCODED data** - No API integration yet
2. ⚠️ **No authentication** - Users can't register/login
3. ⚠️ **No payment backend** - Stripe UI exists but no backend
4. ⚠️ **No real booking system** - Only Calendly embed
5. ✅ **Core APIs exist** - Therapists and appointments APIs ready
6. ❌ **Payment APIs missing** - Critical for functionality
7. ❌ **Reviews system missing** - Ratings are hardcoded
8. ❌ **Content management missing** - Blog posts are hardcoded

### **What Admin Panel Must Provide**

1. **Therapist Management UI** - To replace hardcoded data
2. **Appointment Management UI** - To view/manage bookings
3. **Payment Integration** - Stripe backend + UI
4. **User Management UI** - To manage registered users
5. **Content Management UI** - To manage blog/content
6. **Analytics Dashboard** - Platform metrics

### **Next Steps**

1. ✅ **APIs are 70% ready** - Core endpoints exist
2. ❌ **Build payment APIs** - Critical missing piece
3. ❌ **Build admin UI** - Management interfaces needed
4. ❌ **Frontend integration** - Replace hardcoded data with API calls
5. ❌ **Add authentication** - Firebase Auth on frontend
6. ❌ **Testing** - End-to-end testing of complete flow

---

**Last Updated**: 2025-10-26
**Frontend Location**: `/Users/bibychacko/Desktop/Docplus/mindgood/`
**Admin Location**: `/Users/bibychacko/Desktop/Nextware/agora_therapy/`
