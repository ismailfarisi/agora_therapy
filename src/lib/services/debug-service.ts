// Debug service to help diagnose authentication and Firestore issues
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
} from "firebase/firestore";

export async function debugAuthAndFirestore() {
  try {
    console.log("🔍 Starting debug check...");

    const auth = getAuth();
    const user = auth.currentUser;

    console.log("🔍 Auth state:", {
      user: user?.uid,
      email: user?.email,
      isAnonymous: user?.isAnonymous,
      emailVerified: user?.emailVerified,
    });

    if (!user) {
      console.error("❌ No authenticated user");
      return false;
    }

    // Test getting a fresh token
    try {
      const token = await user.getIdToken(true);
      console.log("🔍 Fresh token obtained:", token ? "Yes" : "No");
    } catch (tokenError) {
      console.error("❌ Token error:", tokenError);
      return false;
    }

    // Test basic Firestore write
    try {
      const db = getFirestore();
      const testDoc = doc(collection(db, "test"));

      await setDoc(testDoc, {
        userId: user.uid,
        timestamp: new Date().toISOString(),
        test: true,
      });

      console.log("✅ Basic Firestore write successful");
      return true;
    } catch (firestoreError) {
      console.error("❌ Firestore write error:", firestoreError);
      return false;
    }
  } catch (error) {
    console.error("❌ Debug check failed:", error);
    return false;
  }
}

export async function testTherapistAvailabilityWrite() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No authenticated user");
    }

    const db = getFirestore();

    const testAvailability = {
      therapistId: user.uid,
      dayOfWeek: 1,
      timeSlotId: "test-slot-id",
      status: "available",
      maxConcurrentClients: 1,
      recurringPattern: {
        type: "weekly",
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: "Test availability record",
      },
    };

    const docRef = await addDoc(
      collection(db, "therapistAvailability"),
      testAvailability
    );
    console.log("✅ Test availability write successful:", docRef.id);
    return true;
  } catch (error) {
    console.error("❌ Test availability write failed:", error);
    return false;
  }
}
