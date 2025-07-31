"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, TrendingUp, Award, Clock, Target } from 'lucide-react'
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { lessonService, type Lesson, type UserLessonProgress } from "@/lib/lesson-service"

interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersThisWeek: number
  averageSessionTime: number
}

interface LessonStats {
  totalLessons: number
  publishedLessons: number
  completionRate: number
  averageRating: number
  popularCategories: Array<{ category: string; count: number }>
}

interface ActivityData {
  date: string
  completions: number
  newUsers: number
  activeUsers: number
}

export function AdminAnalytics() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisWeek: 0,
    averageSessionTime: 0,
  })

  const [lessonStats, setLessonStats] = useState<LessonStats>({
    totalLessons: 0,
    publishedLessons: 0,
    completionRate: 0,
    averageRating: 0,
    popularCategories: [],
  })

  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [recentCompletions, setRecentCompletions] = useState<Array<UserLessonProgress & { lessonTitle?: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadUserStats(),
        loadLessonStats(),
        loadActivityData(),
        loadRecentCompletions(),
      ])
    } catch (error) {
      console.error("Error loading analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async () => {
    try {
      const usersRef = collection(db, "users")
      const usersSnapshot = await getDocs(usersRef)
      
      const totalUsers = usersSnapshot.size
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      let activeUsers = 0
      let newUsersThisWeek = 0
      let totalSessionTime = 0
      
      usersSnapshot.docs.forEach((doc) => {
        const userData = doc.data()
        const lastActiveDate = userData.lastActiveDate?.toDate()
        const createdAt = userData.createdAt?.toDate()
        
        if (lastActiveDate && lastActiveDate > oneWeekAgo) {
          activeUsers++
        }
        
        if (createdAt && createdAt > oneWeekAgo) {
          newUsersThisWeek++
        }
        
        if (userData.totalSessionTime) {
          totalSessionTime += userData.totalSessionTime
        }
      })
      
      setUserStats({
        totalUsers,
        activeUsers,
        newUsersThisWeek,
        averageSessionTime: totalUsers > 0 ? Math.round(totalSessionTime / totalUsers) : 0,
      })
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  const loadLessonStats = async () => {
    try {
      const lessons = await lessonService.getAllLessons()
      const publishedLessons = lessons.filter(lesson => lesson.published)
      
      // Get lesson progress data
      const progressRef = collection(db, "user_lesson_progress")
      const progressSnapshot = await getDocs(progressRef)
      
      const completedLessons = progressSnapshot.docs.filter(doc => doc.data().completed).length
      const totalProgress = progressSnapshot.size
      
      // Calculate popular categories
      const categoryCount: { [key: string]: number } = {}
      publishedLessons.forEach(lesson => {
        categoryCount[lesson.category] = (categoryCount[lesson.category] || 0) + 1
      })
      
      const popularCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      setLessonStats({
        totalLessons: lessons.length,
        publishedLessons: publishedLessons.length,
        completionRate: totalProgress > 0 ? Math.round((completedLessons / totalProgress) * 100) : 0,
        averageRating: 4.2, // This would come from user ratings in a real app
        popularCategories,
      })
    } catch (error) {
      console.error("Error loading lesson stats:", error)
    }
  }

  const loadActivityData = async () => {
    try {
      // Generate mock activity data for the last 7 days
      const activityData: ActivityData[] = []
      const today = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        
        activityData.push({
          date: date.toISOString().split('T')[0],
          completions: Math.floor(Math.random() * 20) + 5,
          newUsers: Math.floor(Math.random() * 10) + 1,
          activeUsers: Math.floor(Math.random() * 50) + 20,
        })
      }
      
      setActivityData(activityData)
    } catch (error) {
      console.error("Error loading activity data:", error)
    }
  }

  const loadRecentCompletions = async () => {
    try {
      const progressRef = collection(db, "user_lesson_progress")
      const q = query(
        progressRef,
        where("completed", "==", true),
        orderBy("completedAt", "desc"),
        limit(10)
      )
      
      const progressSnapshot = await getDocs(q)
      const completions = await Promise.all(
        progressSnapshot.docs.map(async (doc) => {
          const progressData = doc.data() as UserLessonProgress
          const lesson = await lessonService.getLesson(progressData.lessonId)
          
          return {
            id: doc.id,
            ...progressData,
            completedAt: progressData.completedAt?.toDate(),
            lessonTitle: lesson?.title || "Unknown Lesson",
          }
        })
      )
      
      setRecentCompletions(completions)
    } catch (error) {
      console.error("Error loading recent completions:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{userStats.newUsersThisWeek} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessonStats.totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              {lessonStats.publishedLessons} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessonStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Average lesson completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
                <CardDescription>Most popular lesson categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lessonStats.popularCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(category.count / lessonStats.publishedLessons) * 100} 
                        className="w-20" 
                      />
                      <span className="text-sm text-muted-foreground">{category.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Completions</CardTitle>
                <CardDescription>Latest lesson completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentCompletions.slice(0, 5).map((completion) => (
                    <div key={completion.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{completion.lessonTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {completion.pointsEarned} points earned
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {completion.completedAt?.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published Lessons</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lessonStats.publishedLessons}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
