"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, googleProvider, db } from "@/lib/firebase"

interface UserProfile {
  uid: string
  email: string
  username: string
  displayName: string
  photoURL?: string
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile)
        } else {
          // Create profile for Google sign-in users
          const profile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            username: user.displayName || user.email?.split("@")[0] || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || undefined,
            createdAt: new Date(),
          }
          await setDoc(doc(db, "users", user.uid), profile)
          setUserProfile(profile)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user profile already exists
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        // Create profile for new Google sign-in users
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          username: user.displayName || user.email?.split("@")[0] || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || undefined,
          createdAt: new Date(),
        }
        await setDoc(doc(db, "users", user.uid), profile)
      }
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Error signing in with email:", error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      // Update the user's display name
      await updateProfile(user, {
        displayName: username,
      })

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        username: username,
        displayName: username,
        createdAt: new Date(),
      }

      await setDoc(doc(db, "users", user.uid), userProfile)
    } catch (error) {
      console.error("Error signing up with email:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
