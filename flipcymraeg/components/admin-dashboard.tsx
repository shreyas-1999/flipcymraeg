"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, BarChart3, Settings } from "lucide-react"
import AdminLessonManager from "./admin-lesson-manager"
import AdminVocabularyManager from "./admin-vocabulary-manager"
import AdminUserManager from "./admin-user-manager"
import { AdminAnalytics } from "./admin-analytics"
import type { AdminUser } from "@/lib/admin-service"

interface AdminDashboardProps {
  adminUser: AdminUser
}

export default function AdminDashboard({ adminUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("lessons")

  const canManageUsers = adminUser.adminLevel === "super"

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Welsh learning platform
            {adminUser.adminLevel === "super" && " (Super Admin)"}
            {adminUser.adminLevel === "content" && " (Content Admin)"}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${canManageUsers ? "grid-cols-4" : "grid-cols-3"}`}>
          <TabsTrigger value="lessons" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Vocabulary
          </TabsTrigger>
          {canManageUsers && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          )}
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Management</CardTitle>
              <CardDescription>Create, edit, and manage Welsh lessons for your students</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminLessonManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary Management</CardTitle>
              <CardDescription>Manage the public vocabulary database and flashcards</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminVocabularyManager />
            </CardContent>
          </Card>
        </TabsContent>

        {canManageUsers && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManager />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>View platform statistics and user engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
