"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export type PracticeMode = "welsh-to-english" | "english-to-welsh"

interface SettingsContextType {
  practiceMode: PracticeMode
  setPracticeMode: (mode: PracticeMode) => void
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { user } = useAuth()
  const [practiceMode, setPracticeModeState] = useState<PracticeMode>("english-to-welsh")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserSettings()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const loadUserSettings = async () => {
    if (!user) return

    try {
      const settingsRef = doc(db, "userSettings", user.uid)
      const settingsSnap = await getDoc(settingsRef)

      if (settingsSnap.exists()) {
        const data = settingsSnap.data()
        setPracticeModeState(data.practiceMode || "english-to-welsh")
      }
    } catch (error) {
      console.error("Error loading user settings:", error)
      // If there's a permission error, just use the default setting
      setPracticeModeState("english-to-welsh")
    } finally {
      setIsLoading(false)
    }
  }

  const setPracticeMode = async (mode: PracticeMode) => {
    if (!user) return

    try {
      setPracticeModeState(mode)

      const settingsRef = doc(db, "userSettings", user.uid)
      await setDoc(
        settingsRef,
        {
          practiceMode: mode,
          updatedAt: new Date(),
        },
        { merge: true },
      )
    } catch (error) {
      console.error("Error saving practice mode:", error)
      // If there's a permission error, keep the local state but don't revert
      // The setting will work locally but won't persist
      if (error.code === "permission-denied") {
        console.warn("Settings will not persist due to insufficient permissions")
      } else {
        // Only revert on non-permission errors
        setPracticeModeState(practiceMode)
      }
    }
  }

  return (
    <SettingsContext.Provider value={{ practiceMode, setPracticeMode, isLoading }}>{children}</SettingsContext.Provider>
  )
}
