# Quick Start Guide - Two Project Architecture

## 🎯 Overview

You now have **TWO separate Next.js projects**:

### 1. **Frontend Website** (mindgood)
📍 Location: `/Users/bibychacko/Desktop/Docplus/mindgood/`
- Public-facing website
- Client portal
- Therapist portal
- Booking system
- Video sessions

### 2. **Admin Dashboard + API** (agora_therapy)
📍 Location: `/Users/bibychacko/Desktop/Nextware/agora_therapy/`
- Admin panel
- REST API endpoints
- Firebase Admin SDK
- System management

---

## 🚀 What's Been Created

### ✅ API Endpoints (agora_therapy)

```
/api/v1/therapists
├── GET    /                    # List therapists
├── GET    /:id                 # Get therapist details
├── POST   /                    # Create therapist profile
├── PUT    /:id                 # Update therapist profile
├── DELETE /:id                 # Delete therapist profile
└── POST   /search              # Advanced search

/api/v1/appointments
├── GET    /                    # List appointments
├── GET    /:id                 # Get appointment details
├── POST   /                    # Create appointment
├── PUT    /:id                 # Update appointment
└── DELETE /:id                 # Cancel appointment

/api/v1/availability
└── GET    /:therapistId        # Get available slots

/api/v1/timeslots
├── GET    /                    # List time slots
└── POST   /                    # Create time slot

/api/v1/profile
├── GET    /                    # Get user profile
└── PUT    /                    # Update user profile

/api/agora/token
└── POST   /                    # Generate video token
```

### ✅ Documentation Files

1. **`PROJECT_OVERVIEW.md`** - Complete project overview
2. **`FOLDER_STRUCTURE_GUIDE.md`** - Feature-wise folder breakdown
3. **`ADMIN_PANEL_GUIDE.md`** - Admin panel development guide
4. **`API_DOCUMENTATION.md`** - Complete API documentation
5. **`FRONTEND_INTEGRATION_GUIDE.md`** - Frontend integration guide
6. **`QUICK_START.md`** - This file

---

## 🔥 Firebase Integration

### ✅ Fully Integrated

- **Firestore** - Main database
- **Firebase Auth** - Authentication
- **Firebase Admin SDK** - Server-side operations
- **Firebase Storage** - File uploads

### Collections
- `users` - User profiles
- `therapistProfiles` - Therapist data
- `appointments` - Bookings
- `therapistAvailability` - Schedules
- `timeSlots` - Time definitions
- `scheduleOverrides` - Time-off
- Plus more...

---

## 📋 Next Steps

### For Admin Project (agora_therapy)

1. **Add Authentication Middleware**
   ```typescript
   // Create: src/lib/middleware/auth.ts
   // Verify Firebase tokens on API requests
   ```

2. **Build Admin Dashboard Features**
   - User management UI
   - Therapist verification workflow
   - Analytics dashboard
   - System configuration

3. **Deploy**
   ```bash
   vercel --prod
   # Domain: admin.mindgood.com
   ```

### For Frontend Project (mindgood)

1. **Setup Project**
   ```bash
   cd /Users/bibychacko/Desktop/Docplus/mindgood
   npm install axios @tanstack/react-query zustand
   ```

2. **Create API Client**
   - Copy examples from `FRONTEND_INTEGRATION_GUIDE.md`
   - Set up axios with base URL
   - Configure React Query

3. **Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   # ... other Firebase vars
   ```

4. **Build Features**
   - Therapist listing page
   - Therapist detail page
   - Booking flow
   - Appointment management
   - Video sessions

5. **Deploy**
   ```bash
   vercel --prod
   # Domain: mindgood.com
   ```

---

## 🔗 Communication Flow

```
User visits mindgood.com
         ↓
Frontend fetches therapists
         ↓
API call to admin.mindgood.com/api/v1/therapists
         ↓
Admin project queries Firebase
         ↓
Returns data to frontend
         ↓
Frontend displays therapists
         ↓
User books appointment
         ↓
API call to admin.mindgood.com/api/v1/appointments
         ↓
Admin project creates appointment in Firebase
         ↓
Returns success to frontend
         ↓
Frontend shows confirmation
```

---

## 📚 Key Files to Read

### For Backend/Admin Developers
1. `PROJECT_OVERVIEW.md` - Understand the project
2. `ADMIN_PANEL_GUIDE.md` - Build admin features
3. `API_DOCUMENTATION.md` - API reference

### For Frontend Developers
1. `FRONTEND_INTEGRATION_GUIDE.md` - Complete integration guide
2. `API_DOCUMENTATION.md` - API endpoints reference
3. `PROJECT_OVERVIEW.md` - Database schema

---

## 🛠️ Development Commands

### Admin Project (agora_therapy)
```bash
cd /Users/bibychacko/Desktop/Nextware/agora_therapy
npm run dev  # Runs on http://localhost:3000
```

### Frontend Project (mindgood)
```bash
cd /Users/bibychacko/Desktop/Docplus/mindgood
npm run dev  # Runs on http://localhost:3001 (or different port)
```

---

## ⚠️ Important Notes

1. **Shared Firebase Project**
   - Both projects use the SAME Firebase project
   - Frontend uses Firebase Client SDK (limited access)
   - Admin uses Firebase Admin SDK (full access)

2. **Authentication**
   - Users authenticate via Firebase Auth
   - Frontend stores Firebase token
   - API requests include token in Authorization header
   - Admin project verifies token (TODO: implement middleware)

3. **CORS**
   - Admin project needs CORS headers for frontend
   - Configure in `next.config.ts`

4. **Security**
   - Admin routes protected by middleware
   - API endpoints need auth verification (TODO)
   - Firestore rules control database access

---

## 🎯 Priority Tasks

### Week 1: API & Auth
- [ ] Implement auth middleware in admin project
- [ ] Test all API endpoints
- [ ] Set up CORS configuration
- [ ] Deploy admin project

### Week 2: Frontend Setup
- [ ] Set up frontend project structure
- [ ] Create API client
- [ ] Implement authentication
- [ ] Build therapist listing

### Week 3: Core Features
- [ ] Build booking flow
- [ ] Implement appointment management
- [ ] Add video session component
- [ ] Test end-to-end

### Week 4: Admin Panel
- [ ] Build user management
- [ ] Create therapist verification
- [ ] Add analytics dashboard
- [ ] Deploy both projects

---

## 📞 Getting Help

### Documentation
- Check the 6 documentation files in this project
- All API endpoints are documented
- Frontend integration examples provided

### Testing APIs
```bash
# Test therapist list
curl http://localhost:3000/api/v1/therapists

# Test with auth (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:3000/api/v1/appointments?userId=xxx&role=client
```

---

## ✅ Current Status

### ✅ Completed
- Firebase integration
- Database schema
- Security rules
- Core API endpoints
- Documentation

### 🚧 In Progress
- Authentication middleware
- Admin dashboard UI

### ❌ Not Started
- Frontend website (mindgood)
- Payment integration
- Email/SMS notifications
- Advanced analytics

---

## 🎉 You're Ready!

You now have:
1. ✅ Complete API backend
2. ✅ Firebase database configured
3. ✅ Admin project structure
4. ✅ Comprehensive documentation
5. ✅ Integration guide for frontend

**Next**: Start building your frontend website and call these APIs! 🚀

---

**Last Updated**: 2025-10-26
**Architecture**: Two Separate Next.js Projects
**Database**: Shared Firebase Project
