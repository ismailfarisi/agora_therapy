/**
 * Review Model
 * Review and rating types
 */

import { Timestamp, FieldValue } from "firebase/firestore";

export interface Review {
  id: string;
  appointmentId: string;
  therapistId: string;
  clientId: string;
  rating: number; // 1-5
  comment?: string;
  isAnonymous: boolean;
  isPublished: boolean;
  metadata: {
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    publishedAt?: Timestamp;
    moderatedBy?: string;
  };
}
