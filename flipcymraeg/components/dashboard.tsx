"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Brain,
  BarChart3,
  Menu,
  X,
  LogOut,
  Languages,
  Trophy,
  Target,
  Calendar,
  Library,
  Settings,
  GraduationCap,
  Zap,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { publicVocabularyService, type UserProgress } from "@/lib/public-vocabulary-service"
import { lessonService } from "@/lib/lesson-service"
import LessonView from "./lesson-view"
import VocabularyPractice from "./vocabulary-practice"
import LiveTranslation from "./live-translation"
import FlashcardLibrary from "./flashcard-library"
import SettingsView from "./settings-view"

const navigation = [
  { id: "lessons", name: "Lessons", icon: BookOpen },
  { id: "vocabulary", name: "Vocabulary", icon: Brain },
  { id: "library", name: "Flashcard Library", icon: Library },
  { id: "translate", name: "Translate", icon: Languages },
  { id: "progress", name: "Progress", icon: BarChart3 },
  { id: "settings", name: "Settings", icon: Settings },
]

interface DetailedProgress {
  lessonPoints: number
  vocabularyPoints: number
  totalPoints: number
  masteredCards: number
  reviewedToday: number
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("lessons")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProgress, setUserProgress] = useState<UserProgress>({ totalPoints: 0, masteredCards: 0, reviewedToday: 0 })
  const [detailedProgress, setDetailedProgress] = useState<DetailedProgress>({
    lessonPoints: 0,
    vocabularyPoints: 0,
    totalPoints: 0,
    masteredCards: 0,
    reviewedToday: 0,
  })

  useEffect(() => {
    if (user) {
      loadUserProgress()
      loadDetailedProgress()
    }
  }, [user])

  const loadUserProgress = async () => {
    if (!user) return

    try {
      const progress = await publicVocabularyService.getUserProgressSummary(user.uid)
      setUserProgress(progress)
    } catch (error) {
      console.error("Error loading user progress:", error)
    }
  }

  const loadDetailedProgress = async () => {
    if (!user) return

    try {
      // Get vocabulary progress
      const vocabularyProgress = await publicVocabularyService.getUserProgressSummary(user.uid)

      // Get lesson progress from user profile
      const userProfile = await lessonService.getUserProfile(user.uid)

      // Get lesson points from user document (excluding vocabulary points)
      const { doc, getDoc } = await import("firebase/firestore")
      const { db } = await import("@/lib/firebase")

      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      const lessonPoints = userDoc.exists() ? userDoc.data().totalPoints || 0 : 0
      const vocabularyPoints = vocabularyProgress.totalPoints
      const totalPoints = userProfile?.totalPoints || 0

      setDetailedProgress({
        lessonPoints,
        vocabularyPoints,
        totalPoints,
        masteredCards: vocabularyProgress.masteredCards,
        reviewedToday: vocabularyProgress.reviewedToday,
      })
    } catch (error) {
      console.error("Error loading detailed progress:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "lessons":
        return <LessonView />
      case "vocabulary":
        return <VocabularyPractice />
      case "library":
        return <FlashcardLibrary />
      case "translate":
        return <LiveTranslation />
      case "settings":
        return <SettingsView />
      case "progress":
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
              <p className="text-gray-600">Track your Welsh learning journey</p>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lesson Points</CardTitle>
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailedProgress.lessonPoints}</div>
                  <p className="text-xs text-muted-foreground">Points earned from completing lessons</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vocabulary Points</CardTitle>
                  <Zap className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailedProgress.vocabularyPoints}</div>
                  <p className="text-xs text-muted-foreground">Points earned from vocabulary practice</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailedProgress.totalPoints}</div>
                  <p className="text-xs text-muted-foreground">Combined points from all activities</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mastered Cards</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailedProgress.masteredCards}</div>
                  <p className="text-xs text-muted-foreground">Vocabulary cards you've mastered</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reviewed Today</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailedProgress.reviewedToday}</div>
                  <p className="text-xs text-muted-foreground">Cards reviewed today</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Progress Features Coming Soon */}
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Detailed analytics coming soon</h3>
              <p className="mt-1 text-sm text-gray-500">
                We're working on comprehensive progress tracking and analytics.
              </p>
            </div>
          </div>
        )
      default:
        return <LessonView />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">FlipCymru</span>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === item.id ? "bg-red-600 text-white hover:bg-red-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.displayName || user?.email || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">F</span>
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">FlipCymru</span>
            </div>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
