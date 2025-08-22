/**
 * Recurring Schedule Service
 * Handles creation and management of recurring schedules
 */

import { getAuth } from "firebase/auth";
import {
  getFirestore,
  writeBatch,
  doc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";
import { WeeklySchedule } from "@/components/schedule/RecurringScheduleSetup";
import { TimeSlot, TherapistAvailability } from "@/types/database";

export async function createRecurringSchedule(
  pattern: "weekly" | "biweekly" | "monthly",
  schedule: WeeklySchedule,
  timeSlots: TimeSlot[]
): Promise<void> {
  console.log("🔄 Starting recurring schedule creation with data:", {
    pattern,
    schedule,
  });

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    console.log("🔍 Current user:", user?.uid);

    if (!user) {
      console.error("❌ User not authenticated");
      throw new Error("User not authenticated");
    }

    // Ensure user is authenticated and token is valid
    const token = await user.getIdToken(true);
    console.log("🔍 Got auth token:", token ? "Yes" : "No");

    const db = getFirestore();
    console.log("🔍 Firestore initialized");

    // Clear existing weekly availability first
    const existingQuery = query(
      collection(db, "therapistAvailability"),
      where("therapistId", "==", user.uid),
      where("recurringPattern.type", "==", pattern)
    );
    const existingDocs = await getDocs(existingQuery);

    // Delete existing recurring availability
    const deleteBatch = writeBatch(db);
    existingDocs.forEach((doc) => {
      deleteBatch.delete(doc.ref);
    });
    if (!existingDocs.empty) {
      await deleteBatch.commit();
      console.log(
        `🗑️ Deleted ${existingDocs.size} existing ${pattern} availability records`
      );
    }

    const availabilitySlots: TherapistAvailability[] = [];

    if (pattern === "weekly" || pattern === "biweekly") {
      const weeklySchedule = schedule as WeeklySchedule;

      // Create availability records for each day of the week
      for (const [dayStr, slotIds] of Object.entries(weeklySchedule)) {
        const dayOfWeek = parseInt(dayStr);

        if (slotIds && slotIds.length > 0) {
          for (const slotId of slotIds) {
            const timeSlot = timeSlots.find((ts) => ts.id === slotId);
            if (timeSlot) {
              availabilitySlots.push({
                therapistId: user.uid,
                dayOfWeek: dayOfWeek,
                timeSlotId: slotId,
                status: "available",
                maxConcurrentClients: 1,
                recurringPattern: {
                  type: pattern as "weekly" | "biweekly" | "monthly",
                },
                metadata: {
                  createdAt: Timestamp.now(),
                  updatedAt: Timestamp.now(),
                  notes: `Recurring ${pattern} schedule for ${
                    dayOfWeek === 0
                      ? "Sunday"
                      : dayOfWeek === 1
                      ? "Monday"
                      : dayOfWeek === 2
                      ? "Tuesday"
                      : dayOfWeek === 3
                      ? "Wednesday"
                      : dayOfWeek === 4
                      ? "Thursday"
                      : dayOfWeek === 5
                      ? "Friday"
                      : "Saturday"
                  }`,
                },
              } as TherapistAvailability);
            }
          }
        }
      }
    }

    console.log(`📊 Generated ${availabilitySlots.length} availability slots`);

    // Create slots in smaller batches to avoid Firestore limits
    const BATCH_SIZE = 500;
    for (let i = 0; i < availabilitySlots.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const batchSlots = availabilitySlots.slice(i, i + BATCH_SIZE);

      for (const slot of batchSlots) {
        const docRef = doc(collection(db, "therapistAvailability"));
        batch.set(docRef, slot);
      }

      try {
        await batch.commit();
        console.log(
          `✅ Successfully created batch ${Math.floor(i / BATCH_SIZE) + 1} (${
            batchSlots.length
          } slots)`
        );
      } catch (batchError) {
        console.error(
          `❌ Error in batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
          batchError
        );
        throw batchError;
      }
    }

    console.log("✅ Successfully created all recurring schedule batches");
  } catch (error) {
    console.error("❌ Error creating recurring schedule:", error);
    throw error;
  }
}
