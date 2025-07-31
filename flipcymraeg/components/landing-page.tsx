"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, MessageCircle, Mic, CreditCard } from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
  onSignIn: () => void
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const features = [
    {
      icon: BookOpen,
      title: "Curated Lessons",
      description: "Structured lessons tailored to your proficiency level with comprehensive vocabulary and exercises",
      color: "text-purple-600",
    },
    {
      icon: CreditCard,
      title: "Smart Flashcards",
      description: "AI-generated flashcards with pronunciation guides and contextual examples",
      color: "text-blue-600",
    },
    {
      icon: MessageCircle,
      title: "Live Translation",
      description: "Instant English-Welsh translation with dialect and formality options",
      color: "text-green-600",
    },
    {
      icon: Mic,
      title: "Voice Practice",
      description: "Speech-to-text and text-to-speech for perfect pronunciation practice",
      color: "text-red-600",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FlipCymraeg</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onSignIn}>
                Login
              </Button>
              <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Learn Welsh with <span className="text-red-600">AI</span> <span className="text-green-600">Power</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Master the Welsh language through interactive flashcards, real-time translation, and curated lessons based
            on your proficiency. Your modern Welsh learning companion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg" onClick={onGetStarted}>
              Start Learning Free
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg bg-transparent" onClick={onSignIn}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <Icon className={`w-12 h-12 mx-auto ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">FlipCymraeg</span>
          </div>
          <p className="text-gray-600">© 2024 FlipCymraeg. Empowering Welsh language learning through AI.</p>
        </div>
      </footer>
    </div>
  )
}
