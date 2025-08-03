"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"

export default function AdminUserManager() {
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminLevel, setNewAdminLevel] = useState<"super" | "content">("content")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      setMessage("Please enter an email address")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      // Note: In a real app, you'd need to get the user ID from the email
      // This is a simplified version - you'd typically have a user lookup system
      setMessage("Admin privileges would be granted to: " + newAdminEmail)
      setNewAdminEmail("")
    } catch (error) {
      setMessage("Failed to add admin user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600">Manage admin privileges and user access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Grant Admin Access
          </CardTitle>
          <CardDescription>Add admin privileges to existing users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">User Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Admin Level</Label>
            <Select value={newAdminLevel} onValueChange={(value: "super" | "content") => setNewAdminLevel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content">Content Admin</SelectItem>
                <SelectItem value="super">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600">
              <div className="space-y-1">
                <div>• Content Admin: Can manage vocabulary and lessons</div>
                <div>• Super Admin: Can manage users and all content</div>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`text-sm p-3 rounded-lg ${message.includes("Failed") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
            >
              {message}
            </div>
          )}

          <Button onClick={handleAddAdmin} disabled={loading} className="w-full">
            {loading ? "Processing..." : "Grant Admin Access"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Use Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-green-600">🎯 Vocabulary Management</h4>
              <p className="text-sm text-gray-600">
                Use the Vocabulary tab to create new Welsh vocabulary cards using AI. Enter an English word, select a
                category and difficulty, then generate the Welsh translation with pronunciation and examples.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-600">📊 Analytics</h4>
              <p className="text-sm text-gray-600">
                View statistics about your vocabulary content including total cards, categories, and difficulty
                distribution.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-purple-600">👥 User Management (Super Admin Only)</h4>
              <p className="text-sm text-gray-600">
                Grant admin privileges to other users. Content admins can manage vocabulary, while super admins can
                manage users too.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🔑 Setting Up Admin Access</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>
                <strong>Step 1:</strong> Get your User ID from the "Access Denied" screen when you first visit /admin
              </p>
              <p>
                <strong>Step 2:</strong> Have a developer run this in the Firebase Console:
              </p>
              <code className="block bg-yellow-100 p-2 rounded text-xs mt-1">
                {`// In Firebase Console > Firestore > admin_users collection
// Create document with ID = your_user_id
{
  uid: "your_user_id",
  email: "your_email@example.com", 
  isAdmin: true,
  adminLevel: "super",
  createdAt: new Date()
}`}
              </code>
              <p>
                <strong>Step 3:</strong> Refresh the admin page - you should now have access!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
