import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { db } from "./firebase"

export interface LessonContent {
  type: "vocabulary" | "grammar" | "conversation" | "exercise"
  title: string
  content: string
  welsh?: string
  english?: string
  pronunciation?: string
  examples?: Array<{
    welsh: string
    english: string
    pronunciation?: string
  }>
  exercises?: Array<{
    question: string
    options: string[]
    correctAnswer: string
    explanation: string
    pronunciation?: string
  }>
  dialogue?: Array<{
    speaker: string
    welsh: string
    english: string
    pronunciation?: string
  }>
}

export interface Lesson {
  id?: string
  title: string
  description: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  requiredProficiency: "Beginner" | "Intermediate" | "Advanced"
  pointsReward: number
  estimatedDuration: number // in minutes
  content: LessonContent[]
  published: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  prerequisites?: string[] // lesson IDs
}

export interface UserLessonProgress {
  id?: string
  userId: string
  lessonId: string
  completed: boolean
  completedAt?: Date
  progress: number // 0-100
  pointsEarned: number
  timeSpent: number // in minutes
  currentSection: number
  answers?: { [key: string]: string }
  startedAt: Date
  lastAccessedAt: Date
}

export interface UserProfile {
  proficiency: "Beginner" | "Intermediate" | "Advanced"
  totalPoints: number
  completedLessons: string[]
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date
  preferences: {
    dailyGoal: number
    notifications: boolean
    preferredDifficulty: "Beginner" | "Intermediate" | "Advanced"
  }
}

class LessonService {
  // Lesson CRUD operations
  async createLesson(lesson: Omit<Lesson, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const lessonData = {
        ...lesson,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "lessons"), lessonData)
      return docRef.id
    } catch (error) {
      console.error("Error creating lesson:", error)
      throw new Error("Failed to create lesson")
    }
  }

  async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<void> {
    try {
      const lessonRef = doc(db, "lessons", lessonId)
      await updateDoc(lessonRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating lesson:", error)
      throw new Error("Failed to update lesson")
    }
  }

  async deleteLesson(lessonId: string): Promise<void> {
    try {
      const lessonRef = doc(db, "lessons", lessonId)
      await deleteDoc(lessonRef)
    } catch (error) {
      console.error("Error deleting lesson:", error)
      throw new Error("Failed to delete lesson")
    }
  }

  async getLesson(lessonId: string): Promise<Lesson | null> {
    try {
      const lessonRef = doc(db, "lessons", lessonId)
      const lessonSnap = await getDoc(lessonRef)

      if (lessonSnap.exists()) {
        const data = lessonSnap.data()
        return {
          id: lessonSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Lesson
      }

      return null
    } catch (error) {
      console.error("Error getting lesson:", error)
      throw new Error("Failed to get lesson")
    }
  }

  async getAllLessons(): Promise<Lesson[]> {
    try {
      const lessonsRef = collection(db, "lessons")
      const q = query(lessonsRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Lesson
      })
    } catch (error) {
      console.error("Error getting lessons:", error)
      throw new Error("Failed to get lessons")
    }
  }

  async getPublishedLessons(): Promise<Lesson[]> {
    try {
      const lessonsRef = collection(db, "lessons")
      const q = query(lessonsRef, where("published", "==", true), orderBy("difficulty"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Lesson
      })
    } catch (error) {
      console.error("Error getting published lessons:", error)
      throw new Error("Failed to get published lessons")
    }
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    try {
      const lessonsRef = collection(db, "lessons")
      const q = query(
        lessonsRef,
        where("category", "==", category),
        where("published", "==", true),
        orderBy("difficulty"),
        orderBy("createdAt", "desc"),
      )
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Lesson
      })
    } catch (error) {
      console.error("Error getting lessons by category:", error)
      throw new Error("Failed to get lessons by category")
    }
  }

  async getAvailableLessonsForUser(userId: string): Promise<Lesson[]> {
    try {
      const userProfile = await this.getUserProfile(userId)
      const publishedLessons = await this.getPublishedLessons()

      // Filter lessons based on user proficiency
      const availableLessons = publishedLessons.filter((lesson) => {
        const proficiencyOrder = ["Beginner", "Intermediate", "Advanced"]
        const userLevel = proficiencyOrder.indexOf(userProfile?.proficiency || "Beginner")
        const lessonLevel = proficiencyOrder.indexOf(lesson.requiredProficiency)

        return lessonLevel <= userLevel
      })

      return availableLessons
    } catch (error) {
      console.error("Error getting available lessons:", error)
      throw new Error("Failed to get available lessons")
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const lessonsRef = collection(db, "lessons")
      const q = query(lessonsRef, where("published", "==", true))
      const querySnapshot = await getDocs(q)

      const categories = new Set<string>()
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.category) {
          categories.add(data.category)
        }
      })

      return Array.from(categories).sort()
    } catch (error) {
      console.error("Error getting categories:", error)
      throw new Error("Failed to get categories")
    }
  }

  // User progress operations
  async getUserLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | null> {
    try {
      const progressRef = collection(db, "user_lesson_progress")
      const q = query(progressRef, where("userId", "==", userId), where("lessonId", "==", lessonId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          startedAt: data.startedAt?.toDate() || new Date(),
          lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        } as UserLessonProgress
      }

      return null
    } catch (error) {
      console.error("Error getting user lesson progress:", error)
      throw new Error("Failed to get user lesson progress")
    }
  }

  async updateUserLessonProgress(progress: UserLessonProgress): Promise<void> {
    try {
      if (progress.id) {
        // Update existing progress
        const progressRef = doc(db, "user_lesson_progress", progress.id)
        await updateDoc(progressRef, {
          ...progress,
          lastAccessedAt: serverTimestamp(),
          completedAt: progress.completed ? progress.completedAt || serverTimestamp() : null,
        })
      } else {
        // Create new progress
        await addDoc(collection(db, "user_lesson_progress"), {
          ...progress,
          startedAt: serverTimestamp(),
          lastAccessedAt: serverTimestamp(),
          completedAt: progress.completed ? serverTimestamp() : null,
        })
      }

      // Update user profile if lesson completed for the first time
      if (progress.completed) {
        await this.updateUserProfileOnLessonCompletion(progress.userId, progress.lessonId, progress.pointsEarned)
      }
    } catch (error) {
      console.error("Error updating user lesson progress:", error)
      throw new Error("Failed to update user lesson progress")
    }
  }

  async startLesson(userId: string, lessonId: string): Promise<void> {
    try {
      const existingProgress = await this.getUserLessonProgress(userId, lessonId)

      if (!existingProgress) {
        const progressData: Omit<UserLessonProgress, "id"> = {
          userId,
          lessonId,
          completed: false,
          progress: 0,
          pointsEarned: 0,
          timeSpent: 0,
          currentSection: 0,
          startedAt: new Date(),
          lastAccessedAt: new Date(),
        }

        await addDoc(collection(db, "user_lesson_progress"), {
          ...progressData,
          startedAt: serverTimestamp(),
          lastAccessedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error starting lesson:", error)
      throw new Error("Failed to start lesson")
    }
  }

  // User profile operations - now using the users collection
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const data = userSnap.data()

        // Get vocabulary points from user_vocabulary_progress collection
        const progressRef = collection(db, "user_vocabulary_progress")
        const progressQuery = query(progressRef, where("userId", "==", userId))
        const progressSnapshot = await getDocs(progressQuery)

        let vocabularyPoints = 0
        progressSnapshot.forEach((doc) => {
          const progressData = doc.data()
          vocabularyPoints += progressData.points || 0
        })

        // Combine lesson points with vocabulary points
        const lessonPoints = data.totalPoints || 0
        const combinedTotalPoints = lessonPoints + vocabularyPoints

        // Return profile data from user document
        return {
          proficiency: data.proficiency || "Beginner",
          totalPoints: combinedTotalPoints,
          completedLessons: data.completedLessons || [],
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          lastActiveDate: data.lastActiveDate?.toDate() || new Date(),
          preferences: data.preferences || {
            dailyGoal: 15,
            notifications: true,
            preferredDifficulty: "Beginner",
          },
        }
      }

      return null
    } catch (error) {
      console.error("Error getting user profile:", error)
      throw new Error("Failed to get user profile")
    }
  }

  async createUserProfile(userId: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      const profileData = {
        proficiency: "Beginner",
        totalPoints: 0,
        completedLessons: [],
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: serverTimestamp(),
        preferences: {
          dailyGoal: 15,
          notifications: true,
          preferredDifficulty: "Beginner",
        },
      }

      if (userSnap.exists()) {
        // Update existing user document with profile data
        await updateDoc(userRef, profileData)
      } else {
        // Create new user document with profile data
        await setDoc(userRef, {
          ...profileData,
          createdAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error creating user profile:", error)
      throw new Error("Failed to create user profile")
    }
  }

  async updateUserProfileOnLessonCompletion(userId: string, lessonId: string, pointsEarned: number): Promise<void> {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        const completedLessons = userData.completedLessons || []

        // Only update if lesson hasn't been completed before
        if (!completedLessons.includes(lessonId)) {
          const currentPoints = userData.totalPoints || 0
          const newTotalPoints = currentPoints + pointsEarned
          const newCompletedLessons = [...completedLessons, lessonId]

          // Determine new proficiency level based on points
          let newProficiency = userData.proficiency || "Beginner"
          if (newTotalPoints >= 1000 && newProficiency === "Beginner") {
            newProficiency = "Intermediate"
          } else if (newTotalPoints >= 2500 && newProficiency === "Intermediate") {
            newProficiency = "Advanced"
          }

          await updateDoc(userRef, {
            totalPoints: newTotalPoints,
            completedLessons: newCompletedLessons,
            proficiency: newProficiency,
            lastActiveDate: serverTimestamp(),
          })
        }
      }
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw new Error("Failed to update user profile")
    }
  }

  // Utility methods
  async getUserLessonsWithProgress(userId: string): Promise<Array<Lesson & { progress?: UserLessonProgress }>> {
    try {
      const availableLessons = await this.getAvailableLessonsForUser(userId)

      const lessonsWithProgress = await Promise.all(
        availableLessons.map(async (lesson) => {
          const progress = await this.getUserLessonProgress(userId, lesson.id!)
          return {
            ...lesson,
            progress,
          }
        }),
      )

      return lessonsWithProgress
    } catch (error) {
      console.error("Error getting user lessons with progress:", error)
      throw new Error("Failed to get user lessons with progress")
    }
  }

  async getRecommendedLessons(userId: string, limit = 5): Promise<Lesson[]> {
    try {
      const userProfile = await this.getUserProfile(userId)
      const availableLessons = await this.getAvailableLessonsForUser(userId)

      // Filter out completed lessons
      const incompleteLessons = availableLessons.filter((lesson) => !userProfile?.completedLessons.includes(lesson.id!))

      // Sort by difficulty and creation date
      const recommended = incompleteLessons
        .sort((a, b) => {
          const difficultyOrder = ["Beginner", "Intermediate", "Advanced"]
          const aDiff = difficultyOrder.indexOf(a.difficulty)
          const bDiff = difficultyOrder.indexOf(b.difficulty)

          if (aDiff !== bDiff) return aDiff - bDiff
          return a.createdAt.getTime() - b.createdAt.getTime()
        })
        .slice(0, limit)

      return recommended
    } catch (error) {
      console.error("Error getting recommended lessons:", error)
      throw new Error("Failed to get recommended lessons")
    }
  }

  async getAllUserProgress(userId: string): Promise<UserLessonProgress[]> {
    try {
      const progressRef = collection(db, "user_lesson_progress")
      const q = query(progressRef, where("userId", "==", userId), orderBy("lastAccessedAt", "desc"))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          startedAt: data.startedAt?.toDate() || new Date(),
          lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        } as UserLessonProgress
      })
    } catch (error) {
      console.error("Error getting all user progress:", error)
      throw new Error("Failed to get all user progress")
    }
  }
}

export const lessonService = new LessonService()
