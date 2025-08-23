# Stripe Payment API Routes

This directory contains the Stripe payment integration API routes for the therapy booking platform.

## Routes

### POST `/api/stripe/create-checkout-session`

Creates a Stripe Checkout session for booking appointments.

**Authentication**: Bearer token required

**Request Body**:

```json
{
  "therapistId": "string",
  "therapistName": "string",
  "therapistEmail": "string",
  "appointmentDate": "string",
  "appointmentTime": "string",
  "duration": number,
  "amount": number,
  "currency": "string" (optional, defaults to "usd"),
  "clientName": "string",
  "clientEmail": "string",
  "notes": "string" (optional)
}
```

**Response**:

```json
{
  "sessionId": "string",
  "url": "string",
  "appointmentRef": "string"
}
```

**Error Responses**:

- `401`: Invalid or missing authentication token
- `400`: Invalid request data (with validation details)
- `500`: Server error

### POST `/api/stripe/webhook`

Handles Stripe webhook events for payment processing.

**Authentication**: Stripe webhook signature verification

**Supported Events**:

- `checkout.session.completed`: Creates appointment after successful payment
- `payment_intent.succeeded`: Updates appointment payment status
- `payment_intent.payment_failed`: Marks appointment as failed
- `charge.dispute.created`: Logs disputes for manual review

**Features**:

- Webhook signature verification for security
- Idempotency handling to prevent duplicate processing
- Automatic appointment creation and status updates
- Error handling with logging

## Environment Variables Required

```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Integration Notes

1. **Appointment Creation**: Appointments are automatically created in Firestore when payment succeeds
2. **Metadata Storage**: All appointment details are stored in Stripe session metadata
3. **Payment Tracking**: Payment intent IDs are stored with appointments for reference
4. **Error Handling**: Failed payments automatically cancel appointments
5. **Security**: All webhook events are signature-verified before processing

## Testing

Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Error Monitoring

All errors are logged to console with detailed context. Consider implementing proper error tracking in production.
