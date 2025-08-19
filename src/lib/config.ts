/**
 * Application Configuration
 * Centralizes all environment variables and configuration settings
 */

export const config = {
  // Firebase Configuration
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  },

  // Firebase Admin Configuration (Server-side only)
  firebaseAdmin: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  },

  // Agora.io Configuration
  agora: {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
    appCertificate: process.env.AGORA_APP_CERTIFICATE!,
  },

  // Stripe Configuration
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },

  // Application Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    env: process.env.NODE_ENV || "development",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
  },

  // Optional Email Configuration
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Optional SMS Configuration
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // Security Configuration
  security: {
    nextAuthSecret: process.env.NEXTAUTH_SECRET!,
    nextAuthUrl: process.env.NEXTAUTH_URL!,
  },

  // Business Logic Configuration
  business: {
    // Default appointment duration in minutes
    defaultAppointmentDuration: 60,
    // Maximum advance booking days
    maxAdvanceBookingDays: 90,
    // Minimum advance booking hours
    minAdvanceBookingHours: 24,
    // Buffer time between appointments in minutes
    defaultBufferTime: 15,
    // Maximum daily working hours
    maxDailyHours: 10,
    // Session timeout in minutes
    sessionTimeout: 75, // 15 minutes buffer after appointment
    // Payment timeout in minutes
    paymentTimeout: 30,
  },

  // Feature Flags
  features: {
    enablePayments: true,
    enableSmsNotifications: !!process.env.TWILIO_ACCOUNT_SID,
    enableEmailNotifications: !!process.env.SMTP_HOST,
    enableVideoRecording: false, // Can be enabled later
    enableGroupSessions: false, // Future feature
    enableTherapistVerification: true,
  },
} as const;

// Validate required environment variables
export function validateConfig() {
  const requiredEnvVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "NEXT_PUBLIC_AGORA_APP_ID",
    "AGORA_APP_CERTIFICATE",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "NEXTAUTH_SECRET",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please check your .env.local file and ensure all required variables are set.\n" +
        "See SETUP.md for detailed configuration instructions."
    );
  }
}

// Export individual configs for convenience
export const firebaseConfig = config.firebase;
export const agoraConfig = config.agora;
export const stripeConfig = config.stripe;
export const appConfig = config.app;
export const businessConfig = config.business;
