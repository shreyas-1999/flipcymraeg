"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import LandingPage from "@/components/landing-page"
import AuthForms from "@/components/auth-forms"
import Dashboard from "@/components/dashboard"

export default function Home() {
  const { user, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <div className="text-xl font-semibold">FlipCymraeg</div>
          <div className="text-gray-600 mt-2">Loading...</div>
        </div>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  }

  if (showAuth) {
    return <AuthForms onBack={() => setShowAuth(false)} />
  }

  return <LandingPage onGetStarted={() => setShowAuth(true)} onSignIn={() => setShowAuth(true)} />
}
