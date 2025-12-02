# Therapy Platform Setup Guide

This document provides step-by-step instructions for setting up the online therapy platform with Firebase, Agora.io, and Stripe integration.

## Prerequisites

- Node.js 18+
- npm or yarn package manager
- Firebase account
- Agora.io account
- Stripe account
- Git

## Quick Start

1. **Clone and Install Dependencies**

   ```bash
   git clone <your-repo-url>
   cd therapy-platform
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual credentials
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Detailed Setup Instructions

### 1. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it `therapy-platform` (or your preferred name)
4. Enable Google Analytics (optional)
5. Wait for project creation

#### Enable Authentication

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable the following providers:
   - Email/Password
   - Google (optional)
   - Phone (optional for SMS verification)

#### Setup Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select your preferred location

#### Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (</>)
4. Register app with name "therapy-platform"
5. Copy the configuration object
6. Update `.env.local` with these values:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Generate Service Account Key

1. Go to Project Settings > Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values for `.env.local`:
   - `FIREBASE_PROJECT_ID`: project_id from JSON
   - `FIREBASE_CLIENT_EMAIL`: client_email from JSON
   - `FIREBASE_PRIVATE_KEY`: private_key from JSON (keep the quotes and \n)

### 2. Agora.io Setup

#### Create Agora Account

1. Go to [Agora.io Console](https://console.agora.io/)
2. Sign up for a new account
3. Create a new project

#### Get Agora Credentials

1. In Agora Console, go to Projects
2. Click on your project
3. Copy the App ID
4. Enable App Certificate and copy it
5. Update `.env.local`:
   - `NEXT_PUBLIC_AGORA_APP_ID`: Your App ID
   - `AGORA_APP_CERTIFICATE`: Your App Certificate

### 3. Stripe Setup

#### Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a new account
3. Complete account verification

#### Get API Keys

1. In Stripe Dashboard, go to Developers > API keys
2. Copy the Publishable key and Secret key
3. Update `.env.local`:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: pk*test*...
   - `STRIPE_SECRET_KEY`: sk*test*...

#### Setup Webhooks (Optional)

1. Go to Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret and add to `STRIPE_WEBHOOK_SECRET`

### 4. Optional Services

#### Email (SMTP) Configuration

For sending email notifications:

1. Use Gmail App Passwords or your preferred SMTP service
2. Update `.env.local` with SMTP credentials

#### SMS (Twilio) Configuration

For SMS notifications:

1. Create account at [Twilio](https://www.twilio.com/)
2. Get Account SID, Auth Token, and Phone Number
3. Update `.env.local` with Twilio credentials

## Security Configuration

### Firebase Security Rules

The project includes comprehensive Firestore security rules in `/firebase/firestore.rules`. Deploy them using:

```bash
firebase deploy --only firestore:rules
```

### Environment Variables Security

- Never commit `.env.local` to version control
- Use different Firebase projects for dev/staging/production
- Rotate API keys regularly
- Use least-privilege access for service accounts

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Database Setup

The application will automatically create the required Firestore collections and documents on first use. The initial database structure includes:

- `users` - User profiles and roles
- `therapistProfiles` - Extended therapist information
- `timeSlots` - Predefined appointment time slots
- `therapistAvailability` - Weekly availability patterns
- `appointments` - Booking records and session details

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms

- Ensure Node.js 18+ runtime
- Set all environment variables
- Configure build command: `npm run build`
- Configure start command: `npm start`

## Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**

   - Check API key and domain configuration
   - Verify authentication providers are enabled
   - Ensure proper environment variables

2. **Firestore Permission Errors**

   - Deploy security rules
   - Check user authentication state
   - Verify collection names match rules

3. **Agora Video Errors**

   - Verify App ID and Certificate
   - Check browser permissions for camera/microphone
   - Test with HTTPS in production

4. **Stripe Payment Errors**
   - Use test cards in development
   - Verify webhook endpoints
   - Check API key configuration

### Development Tips

- Use Firebase Emulator Suite for local development
- Test payments with Stripe test cards
- Monitor Firebase usage and quotas
- Use React DevTools for debugging state management

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Firebase, Agora, and Stripe documentation
3. Check the project's GitHub issues
4. Contact the development team

## License

This project is licensed under the MIT License. See LICENSE file for details.
