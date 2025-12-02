# Payout System Documentation

## Overview
The MindGood platform uses Stripe Connect to automatically pay therapists for completed sessions. The system takes a 10% platform commission and pays out therapists 4 days after session completion.

## Features
- ✅ Automatic payout creation 4 days after session completion
- ✅ 10% platform commission (90% to therapist)
- ✅ Stripe Connect integration for therapist payments
- ✅ Admin dashboard for payout management
- ✅ Manual payout processing
- ✅ Payout statistics and analytics
- ✅ Failed payout handling

## How It Works

### 1. Session Completion Flow
```
Client Books Session → Payment Processed → Session Completed → 
Wait 4 Days → Payout Created → Admin Processes → Therapist Paid
```

### 2. Commission Structure
- **Session Amount**: $100.00
- **Platform Fee (10%)**: -$10.00
- **Net Payout to Therapist**: $90.00

### 3. Payout Timeline
1. **Day 0**: Client completes payment for session
2. **Day 0-4**: Session takes place and is marked as completed
3. **Day 4**: Automated cron job creates payout record
4. **Day 4+**: Admin can process payout manually or automatically
5. **Day 4+**: Therapist receives funds in their Stripe account

## Setup Instructions

### 1. Stripe Connect Setup

#### For Platform (Admin)
1. Enable Stripe Connect in your Stripe Dashboard
2. Choose "Custom" or "Express" account type
3. Add your platform's OAuth redirect URLs

#### For Therapists
Therapists need to connect their Stripe account:
1. Navigate to therapist settings
2. Click "Connect Stripe Account"
3. Complete Stripe onboarding
4. Stripe Connect Account ID is saved to their profile

### 2. Environment Variables

Add to `.env.local`:
```env
# Stripe Keys (already configured)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Cron Job Secret (for security)
CRON_SECRET=your_random_secret_key_here
```

### 3. Vercel Cron Configuration

The `vercel.json` file is already configured to run the payout cron job daily:
```json
{
  "crons": [
    {
      "path": "/api/cron/process-payouts",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This runs every day at midnight UTC.

## API Endpoints

### Admin Endpoints

#### Get All Payouts
**GET** `/api/admin/payouts`

Returns all payout records.

**Response:**
```json
{
  "payouts": [
    {
      "id": "payout_123",
      "therapistId": "therapist_456",
      "therapistName": "Dr. Smith",
      "appointmentId": "apt_789",
      "paymentId": "pay_012",
      "amount": 100.00,
      "platformFee": 10.00,
      "netAmount": 90.00,
      "status": "pending",
      "scheduledDate": "2024-01-05T00:00:00Z",
      "createdAt": "2024-01-05T00:00:00Z"
    }
  ]
}
```

#### Get Payout Statistics
**GET** `/api/admin/payouts/stats`

Returns payout statistics.

**Response:**
```json
{
  "totalPayouts": 150,
  "pendingPayouts": 10,
  "completedPayouts": 140,
  "totalPaid": 12600.00,
  "platformRevenue": 1400.00
}
```

#### Process Payout
**POST** `/api/admin/payouts/[payoutId]/process`

Manually process a pending payout.

**Response:**
```json
{
  "success": true,
  "message": "Payout processed successfully",
  "transferId": "tr_1234567890"
}
```

### Cron Endpoint

#### Create Payouts for Completed Sessions
**GET** `/api/cron/process-payouts`

Automatically creates payout records for sessions completed 4+ days ago.

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response:**
```json
{
  "success": true,
  "payoutsCreated": 5,
  "payoutIds": ["payout_1", "payout_2", "payout_3", "payout_4", "payout_5"],
  "errors": []
}
```

## Database Schema

### Payouts Collection
```typescript
{
  id: string;
  therapistId: string;
  appointmentId: string;
  paymentId: string;
  amount: number;              // Original session amount
  platformFee: number;         // 10% commission
  netAmount: number;           // 90% to therapist
  status: "pending" | "processing" | "completed" | "failed";
  scheduledDate: Timestamp;    // When payout was created
  completedDate?: Timestamp;   // When payout was processed
  stripePayoutId?: string;     // Stripe transfer ID
  failureReason?: string;      // If failed, reason
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Appointments Collection (Payout Fields)
```typescript
{
  // ... other fields
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  payoutCreated: boolean;      // Flag to track if payout was created
  payoutId?: string;           // Reference to payout record
}
```

### Users Collection (Therapist Fields)
```typescript
{
  // ... other fields
  stripeConnectAccountId?: string;  // Stripe Connect account ID
}
```

## Admin Dashboard

The admin payout dashboard is available at `/admin/payouts` and provides:

### Statistics Cards
- **Total Payouts**: Total number of payout records
- **Pending**: Payouts waiting to be processed
- **Completed**: Successfully processed payouts
- **Total Paid**: Total amount paid to therapists
- **Platform Revenue**: Total commission earned (10%)

### Payout Management Table
- View all payouts with details
- Search by therapist name or payout ID
- Filter by status (pending/processing/completed/failed)
- Process pending payouts manually
- Export to CSV
- View payout history

### Actions
- **Process Now**: Manually trigger payout for pending records
- **View Details**: See full payout information
- **Retry Failed**: Retry failed payouts

## Payout Statuses

### Pending
- Payout has been created but not yet processed
- Waiting for admin to process or automatic processing

### Processing
- Payout is currently being transferred via Stripe
- Temporary status during API call

### Completed
- Payout successfully transferred to therapist
- Funds are in therapist's Stripe account

### Failed
- Payout transfer failed
- Reason stored in `failureReason` field
- Common reasons:
  - Therapist hasn't connected Stripe account
  - Invalid Stripe account
  - Insufficient platform balance
  - Stripe API error

## Automated Payout Creation

### Cron Job Schedule
The cron job runs **daily at midnight UTC** and:

1. Finds all completed appointments that are 4+ days old
2. Checks if payment was successful
3. Verifies payout hasn't been created yet
4. Calculates platform fee (10%) and net amount (90%)
5. Creates payout record with "pending" status
6. Marks appointment as `payoutCreated: true`

### Manual Trigger
You can manually trigger the cron job:
```bash
curl -X GET https://yourdomain.com/api/cron/process-payouts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Therapist Stripe Connect Setup

### Step 1: Create Connect Link
```typescript
// API endpoint to create Stripe Connect account link
POST /api/therapist/connect-stripe

Response:
{
  "url": "https://connect.stripe.com/setup/...",
  "accountId": "acct_123456789"
}
```

### Step 2: Therapist Completes Onboarding
- Therapist clicks link
- Fills out Stripe onboarding form
- Provides bank account details
- Verifies identity

### Step 3: Save Account ID
- Stripe redirects back to platform
- Account ID saved to therapist profile
- Therapist can now receive payouts

## Testing

### Test Mode
Use Stripe test mode for development:

1. Use test API keys
2. Create test connected accounts
3. Use test bank accounts:
   - **Routing**: 110000000
   - **Account**: 000123456789

### Test Payout Flow
```bash
# 1. Create a test appointment and payment
# 2. Mark appointment as completed
# 3. Manually trigger cron job
curl -X GET http://localhost:3000/api/cron/process-payouts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 4. Check if payout was created
# 5. Process payout from admin dashboard
# 6. Verify in Stripe Dashboard
```

## Monitoring

### Admin Dashboard
- Real-time payout statistics
- Failed payout alerts
- Pending payout count

### Stripe Dashboard
- View all transfers
- Monitor connected accounts
- Track platform revenue
- Handle disputes

### Logs
- All payout operations are logged
- Check server logs for errors
- Monitor cron job execution

## Error Handling

### Common Errors

1. **Therapist Not Connected**
   - Error: "Therapist has not connected their Stripe account"
   - Solution: Therapist needs to complete Stripe onboarding

2. **Insufficient Balance**
   - Error: "Insufficient funds in platform account"
   - Solution: Ensure platform Stripe account has sufficient balance

3. **Invalid Account**
   - Error: "Invalid Stripe account"
   - Solution: Therapist needs to re-connect Stripe account

4. **Network Error**
   - Error: "Stripe API timeout"
   - Solution: Retry payout processing

## Security

- ✅ Admin authentication required for all payout operations
- ✅ Cron job protected with secret token
- ✅ Stripe webhook signature verification
- ✅ Server-side validation
- ✅ Audit logs for all payout operations

## Compliance

- **Tax Reporting**: Stripe handles 1099 forms for therapists
- **Data Retention**: Follow Stripe's data retention policies
- **Privacy**: No sensitive bank details stored locally
- **PCI Compliance**: Handled by Stripe

## Support

### For Therapists
- Help connecting Stripe account
- Payout timing questions
- Missing payout inquiries

### For Admins
- Failed payout troubleshooting
- Stripe Connect setup
- Commission adjustments
- Refund handling

## Future Enhancements

- [ ] Automatic payout processing (no manual approval)
- [ ] Custom commission rates per therapist
- [ ] Payout scheduling preferences
- [ ] Multi-currency support
- [ ] Instant payouts (for additional fee)
- [ ] Payout notifications via email/SMS
- [ ] Detailed payout reports
- [ ] Tax document generation
