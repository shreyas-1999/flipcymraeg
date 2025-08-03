import { collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface CustomFlashcard {
  id?: string
  userId: string
  english: string
  welsh: string
  pronunciation: string
  category: string
  examples: {
    welsh: string
    english: string
  }[]
  points: number
  mastered: boolean
  reviewCount: number
  createdAt: Date
  lastReviewed?: Date
}

export class CustomFlashcardService {
  private collectionName = "custom_flashcards"

  async saveFlashcard(
    userId: string,
    flashcard: Omit<CustomFlashcard, "id" | "userId" | "points" | "mastered" | "reviewCount" | "createdAt">,
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...flashcard,
        userId,
        points: 0,
        mastered: false,
        reviewCount: 0,
        createdAt: new Date(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error saving flashcard:", error)
      throw error
    }
  }

  async getUserFlashcards(userId: string): Promise<CustomFlashcard[]> {
    try {
      const q = query(collection(db, this.collectionName), where("userId", "==", userId), orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)
      const flashcards: CustomFlashcard[] = []

      querySnapshot.forEach((doc) => {
        flashcards.push({
          id: doc.id,
          ...doc.data(),
        } as CustomFlashcard)
      })

      return flashcards
    } catch (error) {
      console.error("Error fetching user flashcards:", error)
      throw error
    }
  }

  async deleteFlashcard(flashcardId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, flashcardId))
    } catch (error) {
      console.error("Error deleting flashcard:", error)
      throw error
    }
  }

  async updateFlashcardProgress(
    flashcardId: string,
    points: number,
    mastered: boolean,
    reviewCount: number,
  ): Promise<void> {
    try {
      const flashcardRef = doc(db, this.collectionName, flashcardId)
      await updateDoc(flashcardRef, {
        points,
        mastered,
        reviewCount,
        lastReviewed: new Date(),
      })
    } catch (error) {
      console.error("Error updating flashcard progress:", error)
      throw error
    }
  }
}

export const customFlashcardService = new CustomFlashcardService()
