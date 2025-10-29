/**
 * Admin User Seeder Script
 * Creates an admin user in Firebase Auth and Firestore
 * 
 * Usage: npx ts-node -P scripts/tsconfig.json scripts/create-admin.ts <email> <password> <firstName> <lastName>
 * Example: npx ts-node -P scripts/tsconfig.json scripts/create-admin.ts admin@mindgood.com SecurePass123! John Doe
 */

const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = admin.auth();
const db = admin.firestore();

interface AdminUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

async function createAdminUser(data: AdminUserData) {
  try {
    console.log('🚀 Creating admin user...');
    console.log(`Email: ${data.email}`);

    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(data.email);
      console.log('✅ User already exists in Firebase Auth');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create user in Firebase Auth
        userRecord = await auth.createUser({
          email: data.email,
          password: data.password,
          displayName: `${data.firstName} ${data.lastName}`,
          emailVerified: true, // Auto-verify admin email
        });
        console.log('✅ Created user in Firebase Auth');
      } else {
        throw error;
      }
    }

    // Set custom claims for admin role
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log('✅ Set admin role custom claims');

    // Create user document in Firestore
    const userDoc = db.collection('users').doc(userRecord.uid);
    const userSnapshot = await userDoc.get();

    if (!userSnapshot.exists) {
      await userDoc.set({
        id: userRecord.uid,
        email: data.email,
        profile: {
          displayName: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: null,
          avatarUrl: null,
          timezone: 'UTC',
          locale: 'en',
        },
        role: 'admin',
        status: 'active',
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          privacy: {
            shareProfile: false,
            allowDirectMessages: true,
          },
        },
        metadata: {
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          lastLoginAt: Timestamp.now(),
          onboardingCompleted: true,
        },
      });
      console.log('✅ Created user document in Firestore');
    } else {
      // Update existing user to admin
      await userDoc.update({
        role: 'admin',
        'metadata.updatedAt': Timestamp.now(),
      });
      console.log('✅ Updated existing user to admin role');
    }

    // Create audit log
    await db.collection('auditLogs').add({
      userId: userRecord.uid,
      action: 'admin_created',
      resource: 'user',
      resourceId: userRecord.uid,
      details: {
        email: data.email,
        createdBy: 'system_seeder',
      },
      timestamp: Timestamp.now(),
    });
    console.log('✅ Created audit log entry');

    console.log('\n🎉 Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`User ID: ${userRecord.uid}`);
    console.log(`Email: ${data.email}`);
    console.log(`Name: ${data.firstName} ${data.lastName}`);
    console.log(`Role: admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ You can now login at: http://localhost:3000/login');

  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 4) {
  console.error('Usage: npx ts-node scripts/create-admin.ts <email> <password> <firstName> <lastName>');
  console.error('Example: npx ts-node scripts/create-admin.ts admin@mindgood.com SecurePass123! John Doe');
  process.exit(1);
}

const [email, password, firstName, lastName] = args;

// Validate email
if (!email.includes('@')) {
  console.error('❌ Invalid email address');
  process.exit(1);
}

// Validate password (minimum 8 characters)
if (password.length < 8) {
  console.error('❌ Password must be at least 8 characters long');
  process.exit(1);
}

// Run the seeder
createAdminUser({ email, password, firstName, lastName })
  .then(() => {
    console.log('\n✅ Seeder completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeder failed:', error);
    process.exit(1);
  });
