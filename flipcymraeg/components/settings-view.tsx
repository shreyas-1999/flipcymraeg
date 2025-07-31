"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useSettings } from "@/contexts/settings-context"
import { Mic, Check, X } from "lucide-react"

// Custom Radio Group Component
interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <div className={`space-y-2 ${className}`} role="radiogroup">
      {children}
    </div>
  )
}

interface RadioGroupItemProps {
  value: string
  id: string
  children: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function RadioGroupItem({ value, id, children, checked, onCheckedChange }: RadioGroupItemProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={id}
        name="practice-mode"
        value={value}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
      />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        {children}
      </label>
    </div>
  )
}

export default function SettingsView() {
  const { practiceMode, setPracticeMode } = useSettings()
  const [microphoneAccess, setMicrophoneAccess] = useState<"unknown" | "granted" | "denied">("unknown")
  const [isCheckingMicrophone, setIsCheckingMicrophone] = useState(false)

  // Check microphone permissions on component mount
  useEffect(() => {
    checkMicrophonePermissions()
  }, [])

  const checkMicrophonePermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: "microphone" as PermissionName })
      setMicrophoneAccess(result.state === "granted" ? "granted" : result.state === "denied" ? "denied" : "unknown")

      result.onchange = () => {
        setMicrophoneAccess(result.state === "granted" ? "granted" : result.state === "denied" ? "denied" : "unknown")
      }
    } catch (error) {
      console.log("Permissions API not supported")
      // Fallback: try to access microphone to check permissions
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setMicrophoneAccess("granted")
        stream.getTracks().forEach((track) => track.stop())
      } catch (micError) {
        setMicrophoneAccess("denied")
      }
    }
  }

  const requestMicrophoneAccess = async () => {
    setIsCheckingMicrophone(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      setMicrophoneAccess("granted")
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      console.error("Microphone access denied:", error)
      setMicrophoneAccess("denied")

      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          alert(
            "Microphone access denied. Please allow microphone access in your browser settings for voice practice features to work.",
          )
        } else if (error.name === "NotFoundError") {
          alert("No microphone found. Please connect a microphone to use voice practice features.")
        } else {
          alert(`Microphone error: ${error.message}`)
        }
      }
    } finally {
      setIsCheckingMicrophone(false)
    }
  }

  const getMicrophoneStatusIcon = () => {
    switch (microphoneAccess) {
      case "granted":
        return <Check className="h-4 w-4 text-green-600" />
      case "denied":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Mic className="h-3 w-3 text-gray-600" />
    }
  }

  const getMicrophoneStatusText = () => {
    switch (microphoneAccess) {
      case "granted":
        return "Microphone access granted"
      case "denied":
        return "Microphone access denied"
      default:
        return "Microphone access unknown"
    }
  }

  const getMicrophoneStatusColor = () => {
    switch (microphoneAccess) {
      case "granted":
        return "text-green-600"
      case "denied":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Customize your learning experience</p>
      </div>

      {/* Practice Mode Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Mode</CardTitle>
          <CardDescription>Choose how you want to practice vocabulary flashcards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Practice Direction</Label>
            <RadioGroup value={practiceMode} onValueChange={setPracticeMode} className="mt-2">
              <RadioGroupItem
                value="english-to-welsh"
                id="english-to-welsh"
                checked={practiceMode === "english-to-welsh"}
                onCheckedChange={(checked) => checked && setPracticeMode("english-to-welsh")}
              >
                English to Welsh
              </RadioGroupItem>
              <RadioGroupItem
                value="welsh-to-english"
                id="welsh-to-english"
                checked={practiceMode === "welsh-to-english"}
                onCheckedChange={(checked) => checked && setPracticeMode("welsh-to-english")}
              >
                Welsh to English
              </RadioGroupItem>
            </RadioGroup>
          </div>
          <div className="text-sm text-gray-500">
            {practiceMode === "english-to-welsh"
              ? "You'll see English words first and need to recall the Welsh translation"
              : "You'll see Welsh words first and need to recall the English translation"}
          </div>
        </CardContent>
      </Card>

      {/* Microphone Access Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Microphone Access</CardTitle>
          <CardDescription>Required for voice practice features in vocabulary flashcards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getMicrophoneStatusIcon()}
              <span className={`text-sm font-medium ${getMicrophoneStatusColor()}`}>{getMicrophoneStatusText()}</span>
            </div>
            {microphoneAccess !== "granted" && (
              <Button
                onClick={requestMicrophoneAccess}
                disabled={isCheckingMicrophone}
                size="sm"
                variant="outline"
                className="bg-transparent"
              >
                {isCheckingMicrophone ? "Checking..." : "Grant Access"}
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-500">
            {microphoneAccess === "granted" &&
              "Voice practice features are available. You can test your pronunciation on vocabulary flashcards."}
            {microphoneAccess === "denied" &&
              "Voice practice features are disabled. Grant microphone access to use pronunciation testing."}
            {microphoneAccess === "unknown" &&
              "Click 'Grant Access' to enable voice practice features for pronunciation testing."}
          </div>

          {microphoneAccess === "denied" && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Microphone access was denied.</strong> To enable voice practice:
              </p>
              <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                <li>Click the microphone icon in your browser's address bar</li>
                <li>Select "Allow" for microphone access</li>
                <li>Refresh the page and try again</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
