import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface AdminUser {
  uid: string
  email: string
  isAdmin: boolean
  adminLevel: "super" | "content" // super can manage users, content can manage vocabulary/lessons
  createdAt: Date
}

export class AdminService {
  private adminCollection = "admin_users"

  async checkAdminStatus(userId: string): Promise<AdminUser | null> {
    try {
      const adminDoc = await getDoc(doc(db, this.adminCollection, userId))
      if (adminDoc.exists() && adminDoc.data().isAdmin) {
        return adminDoc.data() as AdminUser
      }
      return null
    } catch (error) {
      console.error("Error checking admin status:", error)
      return null
    }
  }

  async makeUserAdmin(userId: string, email: string, adminLevel: "super" | "content" = "content"): Promise<void> {
    try {
      await setDoc(doc(db, this.adminCollection, userId), {
        uid: userId,
        email,
        isAdmin: true,
        adminLevel,
        createdAt: new Date(),
      })
    } catch (error) {
      console.error("Error making user admin:", error)
      throw error
    }
  }

  async removeAdminStatus(userId: string): Promise<void> {
    try {
      await setDoc(
        doc(db, this.adminCollection, userId),
        {
          isAdmin: false,
        },
        { merge: true },
      )
    } catch (error) {
      console.error("Error removing admin status:", error)
      throw error
    }
  }
}

export const adminService = new AdminService()
