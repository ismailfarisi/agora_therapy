# Frontend Integration Guide

## 🎯 Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend Website (mindgood)                                │
│  Location: /Users/bibychacko/Desktop/Docplus/mindgood/     │
│                                                             │
│  - Public landing pages                                     │
│  - Client portal                                            │
│  - Therapist portal                                         │
│  - Booking system                                           │
│  - Video sessions                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ API Calls (REST)
                   │
┌──────────────────▼──────────────────────────────────────────┐
│  Admin Dashboard + API (agora_therapy)                      │
│  Location: /Users/bibychacko/Desktop/Nextware/agora_therapy│
│                                                             │
│  - REST API endpoints (/api/v1/*)                          │
│  - Admin dashboard                                          │
│  - Firebase Admin SDK                                       │
│  - System management                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Firebase Admin SDK
                   │
┌──────────────────▼──────────────────────────────────────────┐
│  Firebase (Shared Database)                                 │
│                                                             │
│  - Firestore (database)                                     │
│  - Firebase Auth (authentication)                           │
│  - Firebase Storage (files)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Available API Endpoints

### Base URL
```
Development: http://localhost:3000/api/v1
Production: https://admin.mindgood.com/api/v1
```

### ✅ Implemented Endpoints

#### **Therapists**
- `GET /api/v1/therapists` - List therapists with filters
- `GET /api/v1/therapists/:id` - Get therapist details
- `POST /api/v1/therapists` - Create therapist profile
- `PUT /api/v1/therapists/:id` - Update therapist profile
- `DELETE /api/v1/therapists/:id` - Delete therapist profile
- `POST /api/v1/therapists/search` - Advanced search

#### **Appointments**
- `GET /api/v1/appointments` - List appointments
- `GET /api/v1/appointments/:id` - Get appointment details
- `POST /api/v1/appointments` - Create appointment
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment

#### **Availability**
- `GET /api/v1/availability/:therapistId` - Get available slots

#### **Time Slots**
- `GET /api/v1/timeslots` - Get all time slots
- `POST /api/v1/timeslots` - Create time slot (admin)

#### **Profile**
- `GET /api/v1/profile?userId=xxx` - Get user profile
- `PUT /api/v1/profile` - Update user profile

#### **Video**
- `POST /api/agora/token` - Generate Agora video token

---

## 🚀 Frontend Setup

### 1. Install Dependencies

```bash
cd /Users/bibychacko/Desktop/Docplus/mindgood
npm install axios @tanstack/react-query zustand
```

### 2. Create API Client

Create `src/lib/api-client.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('firebase-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. Environment Variables

Create `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Firebase Configuration (same as admin project)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Agora (for video sessions)
NEXT_PUBLIC_AGORA_APP_ID=your-agora-app-id
```

---

## 📡 API Usage Examples

### Example 1: Fetch Therapists

```typescript
// src/lib/api/therapists.ts
import apiClient from '@/lib/api-client';

export interface TherapistFilters {
  limit?: number;
  offset?: number;
  verified?: boolean;
  specialization?: string;
  language?: string;
}

export async function getTherapists(filters?: TherapistFilters) {
  const response = await apiClient.get('/therapists', {
    params: filters,
  });
  return response.data;
}

export async function getTherapistById(id: string) {
  const response = await apiClient.get(`/therapists/${id}`);
  return response.data;
}

export async function searchTherapists(searchParams: {
  specializations?: string[];
  languages?: string[];
  sessionTypes?: string[];
  priceRange?: { min: number; max: number };
  verified?: boolean;
  limit?: number;
  offset?: number;
}) {
  const response = await apiClient.post('/therapists/search', searchParams);
  return response.data;
}
```

**Usage in Component:**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getTherapists } from '@/lib/api/therapists';

export default function TherapistList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['therapists', { verified: true }],
    queryFn: () => getTherapists({ verified: true, limit: 20 }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading therapists</div>;

  return (
    <div className="grid grid-cols-3 gap-6">
      {data?.data?.map((therapist) => (
        <TherapistCard key={therapist.id} therapist={therapist} />
      ))}
    </div>
  );
}
```

---

### Example 2: Create Appointment

```typescript
// src/lib/api/appointments.ts
import apiClient from '@/lib/api-client';

export interface CreateAppointmentData {
  therapistId: string;
  clientId: string;
  timeSlotId: string;
  date: string;
  duration?: number;
  sessionType?: string;
  clientNotes?: string;
}

export async function createAppointment(data: CreateAppointmentData) {
  const response = await apiClient.post('/appointments', data);
  return response.data;
}

export async function getAppointments(userId: string, role: 'client' | 'therapist') {
  const response = await apiClient.get('/appointments', {
    params: { userId, role },
  });
  return response.data;
}

export async function cancelAppointment(appointmentId: string) {
  const response = await apiClient.delete(`/appointments/${appointmentId}`);
  return response.data;
}
```

**Usage in Component:**

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointment } from '@/lib/api/appointments';
import { useAuth } from '@/lib/hooks/useAuth';

export default function BookingForm({ therapistId, timeSlot }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      // Invalidate appointments query to refetch
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      alert('Appointment booked successfully!');
    },
    onError: (error) => {
      alert('Failed to book appointment');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      therapistId,
      clientId: user.uid,
      timeSlotId: timeSlot.id,
      date: timeSlot.date,
      sessionType: 'individual',
      clientNotes: 'First session',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
}
```

---

### Example 3: Get Availability

```typescript
// src/lib/api/availability.ts
import apiClient from '@/lib/api-client';

export async function getTherapistAvailability(
  therapistId: string,
  date: string
) {
  const response = await apiClient.get(`/availability/${therapistId}`, {
    params: { date },
  });
  return response.data;
}

export async function getAvailabilityRange(
  therapistId: string,
  startDate: string,
  endDate: string
) {
  const response = await apiClient.get(`/availability/${therapistId}`, {
    params: { startDate, endDate },
  });
  return response.data;
}
```

**Usage in Component:**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getTherapistAvailability } from '@/lib/api/availability';
import { format } from 'date-fns';

export default function AvailabilityCalendar({ therapistId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data, isLoading } = useQuery({
    queryKey: ['availability', therapistId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () =>
      getTherapistAvailability(therapistId, format(selectedDate, 'yyyy-MM-dd')),
  });

  return (
    <div>
      <h3>Available Time Slots</h3>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {data?.data?.availableSlots?.map((slot) => (
            <button
              key={slot.timeSlotId}
              className="p-2 border rounded hover:bg-blue-100"
              onClick={() => handleSelectSlot(slot)}
            >
              {slot.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Example 4: Generate Video Token

```typescript
// src/lib/api/video.ts
import apiClient from '@/lib/api-client';

export async function generateAgoraToken(
  channelName: string,
  uid: number,
  role: 'publisher' | 'subscriber' = 'publisher'
) {
  const response = await apiClient.post('/agora/token', {
    channelName,
    uid,
    role,
  });
  return response.data;
}
```

**Usage in Video Component:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { generateAgoraToken } from '@/lib/api/video';

export default function VideoSession({ appointmentId, userId }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    async function initVideo() {
      // Generate token
      const tokenData = await generateAgoraToken(
        appointmentId,
        parseInt(userId)
      );
      setToken(tokenData.token);

      // Initialize Agora
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      await client.join(
        tokenData.appId,
        appointmentId,
        tokenData.token,
        parseInt(userId)
      );

      // Create and publish local tracks
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      await client.publish([localAudioTrack, localVideoTrack]);
    }

    initVideo();
  }, [appointmentId, userId]);

  return <div id="video-container">Video session...</div>;
}
```

---

## 🔒 Authentication Setup

### Firebase Auth Integration

```typescript
// src/lib/firebase/client.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Auth Hook

```typescript
// src/lib/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Store token for API calls
        const token = await user.getIdToken();
        localStorage.setItem('firebase-token', token);
      } else {
        localStorage.removeItem('firebase-token');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
```

---

## 📦 Complete API Service Layer

Create a centralized API service:

```typescript
// src/lib/api/index.ts
import apiClient from '@/lib/api-client';

export const api = {
  // Therapists
  therapists: {
    list: (filters?) => apiClient.get('/therapists', { params: filters }),
    get: (id: string) => apiClient.get(`/therapists/${id}`),
    search: (params) => apiClient.post('/therapists/search', params),
    create: (data) => apiClient.post('/therapists', data),
    update: (id: string, data) => apiClient.put(`/therapists/${id}`, data),
  },

  // Appointments
  appointments: {
    list: (userId: string, role: string) =>
      apiClient.get('/appointments', { params: { userId, role } }),
    get: (id: string) => apiClient.get(`/appointments/${id}`),
    create: (data) => apiClient.post('/appointments', data),
    update: (id: string, data) => apiClient.put(`/appointments/${id}`, data),
    cancel: (id: string) => apiClient.delete(`/appointments/${id}`),
  },

  // Availability
  availability: {
    get: (therapistId: string, params) =>
      apiClient.get(`/availability/${therapistId}`, { params }),
  },

  // Time Slots
  timeSlots: {
    list: () => apiClient.get('/timeslots'),
  },

  // Profile
  profile: {
    get: (userId: string) => apiClient.get('/profile', { params: { userId } }),
    update: (data) => apiClient.put('/profile', data),
  },

  // Video
  video: {
    generateToken: (data) => apiClient.post('/agora/token', data),
  },
};

export default api;
```

**Usage:**

```typescript
import api from '@/lib/api';

// Fetch therapists
const { data } = await api.therapists.list({ verified: true });

// Create appointment
const appointment = await api.appointments.create({
  therapistId: 'xxx',
  clientId: 'yyy',
  timeSlotId: 'zzz',
  date: '2024-02-15T14:00:00Z',
});
```

---

## 🎨 React Query Setup

```typescript
// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```typescript
// src/app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 🔧 CORS Configuration

In the admin project (`agora_therapy`), add CORS headers:

```typescript
// agora_therapy/next.config.ts
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.FRONTEND_URL || 'http://localhost:3001',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};
```

---

## 📝 Checklist for Frontend Team

### Setup
- [ ] Install dependencies (`axios`, `@tanstack/react-query`)
- [ ] Create `.env.local` with API URL and Firebase config
- [ ] Set up API client with axios
- [ ] Configure React Query provider
- [ ] Set up Firebase Auth

### Implementation
- [ ] Create API service layer (`src/lib/api/`)
- [ ] Implement authentication hook
- [ ] Build therapist listing page
- [ ] Build therapist detail page
- [ ] Build booking flow
- [ ] Build appointment management
- [ ] Implement video session component
- [ ] Add error handling and loading states

### Testing
- [ ] Test API calls in development
- [ ] Test authentication flow
- [ ] Test booking flow end-to-end
- [ ] Test video sessions
- [ ] Test error scenarios

---

## 🚀 Deployment

### Frontend (mindgood)
```bash
# Deploy to Vercel
vercel --prod

# Environment variables needed:
NEXT_PUBLIC_API_URL=https://admin.mindgood.com/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
# ... other Firebase vars
```

### Admin/API (agora_therapy)
```bash
# Deploy to Vercel
vercel --prod

# Environment variables needed:
FRONTEND_URL=https://mindgood.com
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY=xxx
# ... other vars
```

---

## 📞 Support

For API issues or questions:
1. Check `API_DOCUMENTATION.md` for detailed endpoint docs
2. Check Firebase console for database issues
3. Check admin project logs for API errors

---

**Last Updated**: 2025-10-26
