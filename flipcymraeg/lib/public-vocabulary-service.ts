import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface PublicVocabularyCard {
  id?: string
  welsh: string
  english: string
  pronunciation: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  examples: {
    welsh: string
    english: string
  }[]
  createdAt: Date
  createdBy: string // Admin user ID
}

export interface UserVocabularyProgress {
  id?: string
  userId: string
  vocabularyId: string
  points: number
  mastered: boolean
  reviewCount: number
  lastReviewed?: Date
}

export interface UserProgress {
  totalPoints: number
  masteredCards: number
  reviewedToday: number
}

export class PublicVocabularyService {
  private vocabularyCollection = "public_vocabulary"
  private progressCollection = "user_vocabulary_progress"

  // Admin functions
  async addVocabularyCard(
    card: Omit<PublicVocabularyCard, "id" | "createdAt" | "createdBy">,
    adminUserId: string,
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.vocabularyCollection), {
        ...card,
        createdAt: new Date(),
        createdBy: adminUserId,
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding vocabulary card:", error)
      throw error
    }
  }

  async updateVocabularyCard(cardId: string, updates: Partial<PublicVocabularyCard>): Promise<void> {
    try {
      const cardRef = doc(db, this.vocabularyCollection, cardId)
      await updateDoc(cardRef, updates)
    } catch (error) {
      console.error("Error updating vocabulary card:", error)
      throw error
    }
  }

  async deleteVocabularyCard(cardId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.vocabularyCollection, cardId))
    } catch (error) {
      console.error("Error deleting vocabulary card:", error)
      throw error
    }
  }

  // Public functions
  async getAllVocabulary(): Promise<PublicVocabularyCard[]> {
    try {
      const q = query(collection(db, this.vocabularyCollection), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const vocabulary: PublicVocabularyCard[] = []

      querySnapshot.forEach((doc) => {
        vocabulary.push({
          id: doc.id,
          ...doc.data(),
        } as PublicVocabularyCard)
      })

      return vocabulary
    } catch (error) {
      console.error("Error fetching vocabulary:", error)
      throw error
    }
  }

  async getVocabularyByCategory(category: string): Promise<PublicVocabularyCard[]> {
    try {
      const q = query(
        collection(db, this.vocabularyCollection),
        where("category", "==", category),
        orderBy("createdAt", "desc"),
      )
      const querySnapshot = await getDocs(q)
      const vocabulary: PublicVocabularyCard[] = []

      querySnapshot.forEach((doc) => {
        vocabulary.push({
          id: doc.id,
          ...doc.data(),
        } as PublicVocabularyCard)
      })

      return vocabulary
    } catch (error) {
      console.error("Error fetching vocabulary by category:", error)
      throw error
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const vocabulary = await this.getAllVocabulary()
      const categories = [...new Set(vocabulary.map((card) => card.category))].sort()
      return categories
    } catch (error) {
      console.error("Error fetching categories:", error)
      return []
    }
  }

  // User progress functions
  async getUserProgress(userId: string): Promise<UserVocabularyProgress[]> {
    try {
      const q = query(collection(db, this.progressCollection), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      const progress: UserVocabularyProgress[] = []

      querySnapshot.forEach((doc) => {
        progress.push({
          id: doc.id,
          ...doc.data(),
        } as UserVocabularyProgress)
      })

      return progress
    } catch (error) {
      console.error("Error fetching user progress:", error)
      return []
    }
  }

  async updateUserProgress(
    userId: string,
    vocabularyId: string,
    points: number,
    mastered: boolean,
    reviewCount: number,
  ): Promise<void> {
    try {
      // Check if progress already exists
      const q = query(
        collection(db, this.progressCollection),
        where("userId", "==", userId),
        where("vocabularyId", "==", vocabularyId),
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        // Create new progress record
        await addDoc(collection(db, this.progressCollection), {
          userId,
          vocabularyId,
          points,
          mastered,
          reviewCount,
          lastReviewed: new Date(),
        })
      } else {
        // Update existing progress record
        const progressDoc = querySnapshot.docs[0]
        await updateDoc(doc(db, this.progressCollection, progressDoc.id), {
          points,
          mastered,
          reviewCount,
          lastReviewed: new Date(),
        })
      }
    } catch (error) {
      console.error("Error updating user progress:", error)
      throw error
    }
  }

  async getUserProgressSummary(userId: string): Promise<UserProgress> {
    try {
      const userProgress = await this.getUserProgress(userId)
      const totalPoints = userProgress.reduce((sum, progress) => sum + progress.points, 0)
      const masteredCards = userProgress.filter((progress) => progress.mastered).length

      // Count cards reviewed today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const reviewedToday = userProgress.filter((progress) => {
        if (!progress.lastReviewed) return false
        const reviewDate = new Date(progress.lastReviewed)
        reviewDate.setHours(0, 0, 0, 0)
        return reviewDate.getTime() === today.getTime()
      }).length

      return {
        totalPoints,
        masteredCards,
        reviewedToday,
      }
    } catch (error) {
      console.error("Error getting user progress summary:", error)
      return { totalPoints: 0, masteredCards: 0, reviewedToday: 0 }
    }
  }

  // Get vocabulary with user progress
  async getVocabularyWithProgress(
    userId: string,
  ): Promise<(PublicVocabularyCard & { userProgress?: UserVocabularyProgress })[]> {
    try {
      const [vocabulary, userProgress] = await Promise.all([this.getAllVocabulary(), this.getUserProgress(userId)])

      const progressMap = new Map(userProgress.map((p) => [p.vocabularyId, p]))

      return vocabulary.map((card) => ({
        ...card,
        userProgress: progressMap.get(card.id!),
      }))
    } catch (error) {
      console.error("Error getting vocabulary with progress:", error)
      return []
    }
  }

  getDeckForCategory(
    vocabulary: (PublicVocabularyCard & { userProgress?: UserVocabularyProgress })[],
    category: string,
  ): (PublicVocabularyCard & { userProgress?: UserVocabularyProgress })[] {
    const categoryCards = category === "All" ? vocabulary : vocabulary.filter((card) => card.category === category)

    // Prioritize non-mastered cards
    const nonMastered = categoryCards.filter((card) => !card.userProgress?.mastered)
    const mastered = categoryCards.filter((card) => card.userProgress?.mastered)

    // Include 1 mastered card for every 4 non-mastered cards
    const deck = [...nonMastered]
    mastered.forEach((card, index) => {
      if (index % 4 === 0) deck.push(card)
    })

    // Shuffle the deck
    return deck.sort(() => Math.random() - 0.5)
  }
}

export const publicVocabularyService = new PublicVocabularyService()
