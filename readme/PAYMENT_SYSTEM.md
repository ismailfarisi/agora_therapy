# Payment System Documentation

## Overview
The MindGood platform uses Stripe for secure payment processing. This document outlines the payment flow, API endpoints, and setup instructions.

## Features
- ✅ Stripe Payment Integration
- ✅ Payment Intent Creation
- ✅ Webhook Handling for Payment Events
- ✅ Admin Payment Dashboard
- ✅ Payment Statistics & Analytics
- ✅ Refund Management
- ✅ Multiple Payment Methods (Card, UPI, Net Banking)
- ✅ Secure Payment Processing

## Setup Instructions

### 1. Get Stripe API Keys
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add the following to your `.env.local` file:

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Test Mode
For testing, use Stripe's test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

## Payment Flow

### 1. Client Books a Session
```
Client → Booking Page → Create Appointment → Payment Page
```

### 2. Payment Intent Creation
```typescript
POST /api/payments/create-intent
Body: {
  appointmentId: string,
  amount: number,
  currency: "usd"
}

Response: {
  clientSecret: string,
  paymentIntentId: string,
  paymentId: string
}
```

### 3. Client Completes Payment
```
Client → Stripe Payment Form → Stripe Servers → Webhook
```

### 4. Webhook Updates Status
```
Stripe → Webhook → Update Payment Status → Update Appointment Status
```

## API Endpoints

### Create Payment Intent
**POST** `/api/payments/create-intent`

Creates a Stripe payment intent for an appointment.

**Request:**
```json
{
  "appointmentId": "apt_123",
  "amount": 100.00,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "paymentId": "pay_xxx"
}
```

### Webhook Handler
**POST** `/api/payments/webhook`

Handles Stripe webhook events.

**Events Handled:**
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Payment refunded

### Admin Endpoints

#### Get All Payments
**GET** `/api/admin/payments`

Returns all payment transactions (Admin only).

**Response:**
```json
{
  "payments": [
    {
      "id": "pay_123",
      "appointmentId": "apt_123",
      "clientName": "John Doe",
      "therapistName": "Dr. Smith",
      "amount": 100.00,
      "status": "succeeded",
      "paymentMethod": "card",
      "stripePaymentId": "pi_xxx",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Payment Statistics
**GET** `/api/admin/payments/stats`

Returns payment statistics (Admin only).

**Response:**
```json
{
  "totalRevenue": 10000.00,
  "totalTransactions": 150,
  "successfulPayments": 145,
  "failedPayments": 5,
  "refundedAmount": 500.00
}
```

## Database Schema

### Payments Collection
```typescript
{
  id: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  stripePaymentIntentId: string;
  stripePaymentId?: string;
  paymentMethod: string;
  refundedAmount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Appointments Collection (Payment Fields)
```typescript
{
  // ... other fields
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  currency: string;
}
```

## Admin Dashboard

The admin payment dashboard is available at `/admin/payments` and provides:

- **Revenue Overview**: Total revenue, successful payments, failed payments
- **Transaction List**: All payment transactions with filters
- **Search & Filter**: Search by client, therapist, or payment ID
- **Export**: Export payment data to CSV
- **Status Tracking**: Real-time payment status updates

## Payment Methods Supported

1. **Credit/Debit Cards**
   - Visa
   - Mastercard
   - American Express
   - Discover

2. **UPI** (India)
   - Google Pay
   - PhonePe
   - Paytm

3. **Net Banking** (India)
   - All major Indian banks

## Security Features

- ✅ PCI DSS Compliant (via Stripe)
- ✅ Secure webhook signature verification
- ✅ Server-side payment intent creation
- ✅ No card details stored on our servers
- ✅ HTTPS required for all payment endpoints
- ✅ Admin authentication for payment management

## Error Handling

### Common Errors

1. **Payment Declined**
   - Status: `failed`
   - Action: User can retry with different card

2. **Insufficient Funds**
   - Status: `failed`
   - Action: User notified to check balance

3. **Authentication Required**
   - Status: `requires_action`
   - Action: 3D Secure authentication flow

## Refund Process

Refunds are processed through the admin dashboard:

1. Admin initiates refund in Stripe Dashboard
2. Webhook receives `charge.refunded` event
3. Payment status updated to `refunded`
4. Appointment status updated to `cancelled`
5. Client notified via email

## Testing

### Test Payment Flow
```bash
# 1. Create a test appointment
# 2. Navigate to payment page
# 3. Use test card: 4242 4242 4242 4242
# 4. Complete payment
# 5. Verify webhook received
# 6. Check payment status in admin dashboard
```

### Test Webhook Locally
```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

## Monitoring

### Stripe Dashboard
- Monitor all transactions
- View payment analytics
- Manage refunds
- Handle disputes

### Admin Dashboard
- Real-time payment tracking
- Revenue analytics
- Failed payment monitoring
- Export reports

## Support

For payment-related issues:
1. Check Stripe Dashboard for transaction details
2. Review webhook logs in Stripe
3. Check Firebase logs for API errors
4. Contact Stripe support for payment issues

## Compliance

- **PCI DSS**: Handled by Stripe
- **GDPR**: No payment data stored locally
- **Data Retention**: Follow Stripe's retention policies
- **Audit Logs**: All payment events logged in Firestore
