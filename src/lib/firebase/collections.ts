/**
 * Firebase Collections Configuration
 * Defines collection names and provides typed collection references
 */

import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
} from "firebase/firestore";
import { db } from "./client";

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  THERAPIST_PROFILES: "therapistProfiles",
  TIME_SLOTS: "timeSlots",
  THERAPIST_AVAILABILITY: "therapistAvailability",
  SCHEDULE_OVERRIDES: "scheduleOverrides",
  APPOINTMENTS: "appointments",
  AUDIT_LOGS: "auditLogs",
  NOTIFICATIONS: "notifications",
  PAYMENT_INTENTS: "paymentIntents",
} as const;

// Typed collection references
export const collections = {
  users: () => collection(db, COLLECTIONS.USERS) as CollectionReference,
  therapistProfiles: () =>
    collection(db, COLLECTIONS.THERAPIST_PROFILES) as CollectionReference,
  timeSlots: () =>
    collection(db, COLLECTIONS.TIME_SLOTS) as CollectionReference,
  therapistAvailability: () =>
    collection(db, COLLECTIONS.THERAPIST_AVAILABILITY) as CollectionReference,
  scheduleOverrides: () =>
    collection(db, COLLECTIONS.SCHEDULE_OVERRIDES) as CollectionReference,
  appointments: () =>
    collection(db, COLLECTIONS.APPOINTMENTS) as CollectionReference,
  auditLogs: () =>
    collection(db, COLLECTIONS.AUDIT_LOGS) as CollectionReference,
  notifications: () =>
    collection(db, COLLECTIONS.NOTIFICATIONS) as CollectionReference,
  paymentIntents: () =>
    collection(db, COLLECTIONS.PAYMENT_INTENTS) as CollectionReference,
};

// Typed document references
export const documents = {
  user: (id: string) => doc(db, COLLECTIONS.USERS, id) as DocumentReference,
  therapistProfile: (id: string) =>
    doc(db, COLLECTIONS.THERAPIST_PROFILES, id) as DocumentReference,
  timeSlot: (id: string) =>
    doc(db, COLLECTIONS.TIME_SLOTS, id) as DocumentReference,
  therapistAvailability: (id: string) =>
    doc(db, COLLECTIONS.THERAPIST_AVAILABILITY, id) as DocumentReference,
  scheduleOverride: (id: string) =>
    doc(db, COLLECTIONS.SCHEDULE_OVERRIDES, id) as DocumentReference,
  appointment: (id: string) =>
    doc(db, COLLECTIONS.APPOINTMENTS, id) as DocumentReference,
  auditLog: (id: string) =>
    doc(db, COLLECTIONS.AUDIT_LOGS, id) as DocumentReference,
  notification: (id: string) =>
    doc(db, COLLECTIONS.NOTIFICATIONS, id) as DocumentReference,
  paymentIntent: (id: string) =>
    doc(db, COLLECTIONS.PAYMENT_INTENTS, id) as DocumentReference,
};

// Helper function to get a random document ID
export function generateId(): string {
  return doc(collection(db, "temp")).id;
}

// Subcollection helpers
export const subcollections = {
  userNotifications: (userId: string) =>
    collection(
      db,
      COLLECTIONS.USERS,
      userId,
      "notifications"
    ) as CollectionReference,

  therapistAvailability: (therapistId: string) =>
    collection(
      db,
      COLLECTIONS.THERAPIST_PROFILES,
      therapistId,
      "availability"
    ) as CollectionReference,

  appointmentMessages: (appointmentId: string) =>
    collection(
      db,
      COLLECTIONS.APPOINTMENTS,
      appointmentId,
      "messages"
    ) as CollectionReference,
};
