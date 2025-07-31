"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { adminService, type AdminUser } from "@/lib/admin-service"
import AdminDashboard from "@/components/admin-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return

      if (!user) {
        setError("You must be logged in to access this page")
        setLoading(false)
        return
      }

      try {
        const adminStatus = await adminService.checkAdminStatus(user.uid)
        if (!adminStatus) {
          setError("Access denied. You don't have admin permissions.")
        } else {
          setAdminUser(adminStatus)
        }
      } catch (err) {
        console.error("Error checking admin status:", err)
        setError("Error verifying admin permissions")
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verifying permissions...</span>
        </div>
      </div>
    )
  }

  if (error || !adminUser) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Access Denied</span>
            </CardTitle>
            <CardDescription>{error || "You don't have permission to access the admin dashboard."}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact a system administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <AdminDashboard adminUser={adminUser} />
}
