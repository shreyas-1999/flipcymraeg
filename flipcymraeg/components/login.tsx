"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Chrome } from "lucide-react"

export default function Login() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl">🏴󠁧󠁢󠁷󠁬󠁳󠁿</div>
          <CardTitle className="text-2xl font-bold text-red-600">Dysgu Cymraeg</CardTitle>
          <CardDescription>Learn Welsh with interactive lessons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={signInWithGoogle} className="w-full bg-red-600 hover:bg-red-700" size="lg">
            <Chrome className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <p className="text-sm text-center text-gray-600">Start your Welsh learning journey today!</p>
        </CardContent>
      </Card>
    </div>
  )
}
