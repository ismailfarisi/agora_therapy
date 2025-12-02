/**
 * Script to fix missing user role in Firestore
 * Run this with: npx ts-node scripts/fix-user-role.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin using environment variables
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
});

const db = getFirestore();

async function fixUserRole(userId: string, role: 'therapist' | 'client' | 'admin') {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error(`❌ User ${userId} not found`);
      return;
    }

    const userData = userDoc.data();
    console.log('📄 Current user data:', userData);

    if (userData?.role) {
      console.log(`✅ User already has role: ${userData.role}`);
      return;
    }

    // Update user with role
    await userRef.update({
      role: role,
      'metadata.updatedAt': new Date()
    });

    console.log(`✅ Successfully updated user ${userId} with role: ${role}`);
    
    // Verify update
    const updatedDoc = await userRef.get();
    console.log('📄 Updated user data:', updatedDoc.data());
  } catch (error) {
    console.error('❌ Error fixing user role:', error);
  }
}

// Usage
const userId = '0hnGBiF2d0ZpsjImsbMQU56WSeA3'; // Replace with actual user ID
const role = 'therapist'; // Replace with actual role

fixUserRole(userId, role)
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
