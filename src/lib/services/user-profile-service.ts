import { doc, getDoc } from "firebase/firestore";
import { collections } from "@/lib/firebase/collections";
import { User } from "@/types/database";

export class UserProfileService {
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const docRef = doc(collections.users(), userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as User;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  }
}
