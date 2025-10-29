# API Documentation

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

Most endpoints require authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

**Note**: Authentication middleware is not yet implemented. See [TODO](#todo-authentication) section.

---

## Table of Contents

1. [Therapists API](#therapists-api)
2. [Appointments API](#appointments-api)
3. [Availability API](#availability-api)
4. [Agora Token API](#agora-token-api)
5. [Response Format](#response-format)
6. [Error Codes](#error-codes)

---

## Therapists API

### List Therapists

Get a list of therapists with optional filters.

**Endpoint**: `GET /api/v1/therapists`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of results (default: 20) |
| `offset` | number | No | Pagination offset (default: 0) |
| `verified` | boolean | No | Filter by verification status |
| `specialization` | string | No | Filter by specialization |
| `language` | string | No | Filter by language |

**Example Request**:

```bash
GET /api/v1/therapists?limit=10&verified=true&specialization=anxiety
```

**Success Response** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "therapist123",
      "credentials": {
        "licenseNumber": "PSY12345",
        "licenseState": "CA",
        "licenseExpiry": "2025-12-31T00:00:00Z",
        "specializations": ["anxiety", "depression", "trauma"],
        "certifications": ["CBT", "EMDR"]
      },
      "practice": {
        "bio": "Licensed therapist with 10 years experience...",
        "yearsExperience": 10,
        "sessionTypes": ["individual", "couples"],
        "languages": ["English", "Spanish"],
        "hourlyRate": 150,
        "currency": "USD"
      },
      "availability": {
        "timezone": "America/Los_Angeles",
        "bufferMinutes": 15,
        "maxDailyHours": 8,
        "advanceBookingDays": 30
      },
      "verification": {
        "isVerified": true,
        "verifiedAt": "2024-01-15T10:30:00Z",
        "verifiedBy": "admin123"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Response** (500):

```json
{
  "success": false,
  "error": "Failed to fetch therapists"
}
```

---

### Get Therapist by ID

Get detailed information about a specific therapist.

**Endpoint**: `GET /api/v1/therapists/:id`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Therapist ID |

**Example Request**:

```bash
GET /api/v1/therapists/therapist123
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "id": "therapist123",
    "credentials": { ... },
    "practice": { ... },
    "availability": { ... },
    "verification": { ... },
    "user": {
      "email": "therapist@example.com",
      "profile": {
        "displayName": "Dr. Jane Smith",
        "firstName": "Jane",
        "lastName": "Smith",
        "avatarUrl": "https://...",
        "timezone": "America/Los_Angeles"
      },
      "role": "therapist",
      "status": "active"
    }
  }
}
```

**Error Response** (404):

```json
{
  "success": false,
  "error": "Therapist not found"
}
```

---

### Create Therapist Profile

Create a new therapist profile (therapist only).

**Endpoint**: `POST /api/v1/therapists`

**Authentication**: Required (therapist role)

**Request Body**:

```json
{
  "credentials": {
    "licenseNumber": "PSY12345",
    "licenseState": "CA",
    "licenseExpiry": "2025-12-31",
    "specializations": ["anxiety", "depression"],
    "certifications": ["CBT"]
  },
  "practice": {
    "bio": "Licensed therapist with 10 years experience...",
    "yearsExperience": 10,
    "sessionTypes": ["individual", "couples"],
    "languages": ["English", "Spanish"],
    "hourlyRate": 150,
    "currency": "USD"
  },
  "availability": {
    "timezone": "America/Los_Angeles",
    "bufferMinutes": 15,
    "maxDailyHours": 8,
    "advanceBookingDays": 30
  }
}
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "id": "therapist123",
    "credentials": { ... },
    "practice": { ... },
    "availability": { ... },
    "verification": {
      "isVerified": false
    }
  }
}
```

---

### Update Therapist Profile

Update an existing therapist profile.

**Endpoint**: `PUT /api/v1/therapists/:id`

**Authentication**: Required (therapist owner or admin)

**Request Body**: Same as create, but all fields optional

**Success Response** (200):

```json
{
  "success": true,
  "message": "Therapist profile updated"
}
```

---

### Delete Therapist Profile

Delete a therapist profile (admin only).

**Endpoint**: `DELETE /api/v1/therapists/:id`

**Authentication**: Required (admin only)

**Success Response** (200):

```json
{
  "success": true,
  "message": "Therapist profile deleted"
}
```

---

## Appointments API

### List Appointments

Get a list of appointments for a user.

**Endpoint**: `GET /api/v1/appointments`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User ID (client or therapist) |
| `role` | string | Yes | User role: 'client' or 'therapist' |
| `status` | string | No | Filter by status: 'pending', 'confirmed', 'completed', 'cancelled' |
| `limit` | number | No | Number of results (default: 20) |

**Example Request**:

```bash
GET /api/v1/appointments?userId=user123&role=client&status=confirmed
```

**Success Response** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "appt123",
      "therapistId": "therapist123",
      "clientId": "client123",
      "scheduledFor": "2024-02-15T14:00:00Z",
      "timeSlotId": "slot_14_00",
      "duration": 60,
      "status": "confirmed",
      "session": {
        "type": "individual",
        "deliveryType": "video",
        "platform": "agora",
        "channelId": "channel_abc123",
        "accessToken": "token_xyz789"
      },
      "payment": {
        "amount": 150,
        "currency": "USD",
        "status": "paid",
        "transactionId": "pi_123456"
      },
      "communication": {
        "clientNotes": "First session, feeling anxious",
        "therapistNotes": "",
        "remindersSent": {
          "email": ["2024-02-14T14:00:00Z"],
          "sms": []
        }
      },
      "metadata": {
        "createdAt": "2024-02-10T10:00:00Z",
        "updatedAt": "2024-02-10T10:00:00Z",
        "confirmedAt": "2024-02-10T10:05:00Z"
      }
    }
  ]
}
```

**Error Response** (400):

```json
{
  "success": false,
  "error": "userId is required"
}
```

---

### Create Appointment

Create a new appointment/booking.

**Endpoint**: `POST /api/v1/appointments`

**Authentication**: Required (client role)

**Request Body**:

```json
{
  "therapistId": "therapist123",
  "clientId": "client123",
  "timeSlotId": "slot_14_00",
  "date": "2024-02-15T14:00:00Z",
  "duration": 60,
  "sessionType": "individual",
  "clientNotes": "First session, feeling anxious"
}
```

**Required Fields**:
- `therapistId`: Therapist ID
- `clientId`: Client ID
- `timeSlotId`: Time slot ID
- `date`: Appointment date/time (ISO 8601)

**Optional Fields**:
- `duration`: Session duration in minutes (default: 60)
- `sessionType`: Type of session (default: "individual")
- `clientNotes`: Client notes

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "id": "appt123",
    "therapistId": "therapist123",
    "clientId": "client123",
    "scheduledFor": "2024-02-15T14:00:00Z",
    "timeSlotId": "slot_14_00",
    "duration": 60,
    "status": "pending",
    "session": {
      "type": "individual",
      "deliveryType": "video",
      "platform": "agora"
    },
    "payment": {
      "amount": 150,
      "currency": "USD",
      "status": "pending"
    },
    "communication": {
      "clientNotes": "First session, feeling anxious",
      "remindersSent": {
        "email": [],
        "sms": []
      }
    },
    "metadata": {
      "createdAt": "2024-02-10T10:00:00Z",
      "updatedAt": "2024-02-10T10:00:00Z"
    }
  }
}
```

**Error Response** (400):

```json
{
  "success": false,
  "error": "Missing required fields"
}
```

**Error Response** (404):

```json
{
  "success": false,
  "error": "Therapist not found"
}
```

**Error Response** (409):

```json
{
  "success": false,
  "error": "Time slot is already booked"
}
```

---

## Availability API

### Get Therapist Availability

Get available time slots for a specific therapist.

**Endpoint**: `GET /api/v1/availability/:therapistId`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `therapistId` | string | Yes | Therapist ID |

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No* | Single date (YYYY-MM-DD) |
| `startDate` | string | No* | Start date for range (YYYY-MM-DD) |
| `endDate` | string | No | End date for range (YYYY-MM-DD) |

*Either `date` or `startDate` is required

**Example Requests**:

```bash
# Single day
GET /api/v1/availability/therapist123?date=2024-02-15

# Date range
GET /api/v1/availability/therapist123?startDate=2024-02-15&endDate=2024-02-22
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "therapistId": "therapist123",
    "availableSlots": [
      {
        "date": "2024-02-15",
        "timeSlotId": "slot_09_00",
        "startTime": "09:00",
        "endTime": "10:00",
        "duration": 60,
        "displayName": "9:00 AM - 10:00 AM"
      },
      {
        "date": "2024-02-15",
        "timeSlotId": "slot_10_00",
        "startTime": "10:00",
        "endTime": "11:00",
        "duration": 60,
        "displayName": "10:00 AM - 11:00 AM"
      },
      {
        "date": "2024-02-15",
        "timeSlotId": "slot_14_00",
        "startTime": "14:00",
        "endTime": "15:00",
        "duration": 60,
        "displayName": "2:00 PM - 3:00 PM"
      }
    ],
    "totalSlots": 3
  }
}
```

**Error Response** (400):

```json
{
  "success": false,
  "error": "startDate or date parameter is required"
}
```

**Notes**:
- Available slots exclude:
  - Already booked appointments
  - Schedule overrides (day off)
  - Times outside therapist's availability pattern
- All times are in the therapist's timezone
- Slots are calculated based on:
  - Therapist's weekly availability pattern
  - Existing appointments
  - Schedule overrides

---

## Agora Token API

### Generate Agora Token

Generate a secure Agora token for video sessions.

**Endpoint**: `POST /api/agora/token`

**Authentication**: Required

**Request Body**:

```json
{
  "channelName": "channel_abc123",
  "uid": 12345,
  "role": "publisher"
}
```

**Fields**:
- `channelName`: Unique channel identifier (usually appointment ID)
- `uid`: User ID (numeric)
- `role`: "publisher" (can send/receive) or "subscriber" (receive only)

**Success Response** (200):

```json
{
  "token": "006abc123def456...",
  "appId": "your-agora-app-id",
  "channelName": "channel_abc123",
  "uid": 12345
}
```

**Error Response** (400):

```json
{
  "error": "Missing required parameters"
}
```

**Error Response** (500):

```json
{
  "error": "Failed to generate token"
}
```

---

## Response Format

### Success Response

All successful responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }  // Optional, for list endpoints
}
```

### Error Response

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict (e.g., slot already booked) |
| 500 | Internal Server Error |

---

## TODO: Authentication

Authentication middleware needs to be implemented for all protected endpoints.

### Implementation Steps

1. **Create Auth Middleware** (`/src/lib/middleware/auth.ts`):

```typescript
import { NextRequest } from "next/server";
import { verifyIdToken } from "@/lib/firebase/admin";

export async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split("Bearer ")[1];
  const decodedToken = await verifyIdToken(token);
  
  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    role: decodedToken.role, // Custom claim
  };
}
```

2. **Use in API Routes**:

```typescript
import { verifyAuth } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    // Check role if needed
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Continue with logic...
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

3. **Set Custom Claims** (for roles):

```typescript
import { setUserClaims } from "@/lib/firebase/admin";

// When user registers or role changes
await setUserClaims(userId, { role: 'therapist' });
```

---

## Rate Limiting

**TODO**: Implement rate limiting to prevent abuse.

Recommended approach:
- Use Redis or Firestore for rate limit tracking
- Limit: 100 requests per minute per user
- Return 429 (Too Many Requests) when exceeded

---

## CORS Configuration

For cross-origin requests from your frontend, configure CORS in `next.config.ts`:

```typescript
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://your-frontend.com" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};
```

---

## Example Usage (Frontend)

### Fetch Therapists

```typescript
const response = await fetch('/api/v1/therapists?verified=true&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
  },
});

const data = await response.json();
if (data.success) {
  console.log(data.data); // Array of therapists
}
```

### Create Appointment

```typescript
const response = await fetch('/api/v1/appointments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`,
  },
  body: JSON.stringify({
    therapistId: 'therapist123',
    clientId: 'client123',
    timeSlotId: 'slot_14_00',
    date: '2024-02-15T14:00:00Z',
    sessionType: 'individual',
    clientNotes: 'First session',
  }),
});

const data = await response.json();
if (data.success) {
  console.log('Appointment created:', data.data);
} else {
  console.error('Error:', data.error);
}
```

### Get Availability

```typescript
const therapistId = 'therapist123';
const date = '2024-02-15';

const response = await fetch(
  `/api/v1/availability/${therapistId}?date=${date}`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${firebaseToken}`,
    },
  }
);

const data = await response.json();
if (data.success) {
  console.log('Available slots:', data.data.availableSlots);
}
```

---

## Testing

Use tools like Postman, Insomnia, or curl to test the API:

```bash
# Test therapist list
curl -X GET "http://localhost:3000/api/v1/therapists?limit=5" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Test create appointment
curl -X POST "http://localhost:3000/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "therapistId": "therapist123",
    "clientId": "client123",
    "timeSlotId": "slot_14_00",
    "date": "2024-02-15T14:00:00Z"
  }'
```

---

## Additional Endpoints Needed

The following endpoints should be created for a complete API:

### Appointments
- `GET /api/v1/appointments/:id` - Get appointment details
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment
- `POST /api/v1/appointments/:id/reschedule` - Reschedule appointment

### Profile
- `GET /api/v1/profile` - Get current user profile
- `PUT /api/v1/profile` - Update current user profile
- `GET /api/v1/profile/:userId` - Get user profile by ID

### Time Slots
- `GET /api/v1/timeslots` - Get all time slots

### Payments
- `POST /api/v1/payments/create-intent` - Create Stripe payment intent
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/webhook` - Stripe webhook handler

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `POST /api/v1/notifications/:id/read` - Mark notification as read

### Admin (Requires admin role)
- `GET /api/v1/admin/users` - List all users
- `PUT /api/v1/admin/users/:id/status` - Update user status
- `POST /api/v1/admin/therapists/:id/verify` - Verify therapist
- `GET /api/v1/admin/analytics` - Get platform analytics

---

**Last Updated**: 2025-10-24
**API Version**: v1
