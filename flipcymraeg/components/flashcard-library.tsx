"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Edit,
  Trash2,
  Play,
  Pause,
  Loader2,
  Search,
  Plus,
  Save,
  ArrowLeft,
  Package,
  X,
  Volume2,
  BookOpen,
  MicOff,
} from "lucide-react"
import { publicVocabularyService, type PublicVocabularyCard } from "@/lib/public-vocabulary-service"
import { customFlashcardService, type CustomFlashcard } from "@/lib/custom-flashcard-service"
import { geminiService } from "@/lib/gemini-service"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import CreateFlashcard from "./create-flashcard"

// TTS Service
class TextToSpeechService {
  private apiKey: string
  private baseUrl = "https://texttospeech.googleapis.com/v1/text:synthesize"

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || ""
  }

  async synthesizeSpeech(text: string, speed = 1.0): Promise<string> {
    const requestBody = {
      input: { text },
      voice: {
        languageCode: "cy-GB",
        ssmlGender: "FEMALE",
      },
      audioConfig: {
        audioEncoding: "LINEAR16",
        sampleRateHertz: 24000,
        speakingRate: speed,
        pitch: 0,
        volumeGainDb: 0,
      },
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`)
      }

      const data = await response.json()
      return data.audioContent
    } catch (error) {
      console.error("Text-to-speech error:", error)
      throw error
    }
  }

  async playAudio(audioContent: string): Promise<void> {
    try {
      const audioBlob = new Blob(
        [
          new Uint8Array(
            atob(audioContent)
              .split("")
              .map((char) => char.charCodeAt(0)),
          ),
        ],
        { type: "audio/wav" },
      )

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }
        audio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl)
          reject(e)
        }
        audio.play().catch(reject)
      })
    } catch (error) {
      console.error("Audio playbook error:", error)
      throw error
    }
  }
}

const ttsService = new TextToSpeechService()

// Audio Player Component
interface AudioPlayerProps {
  text: string
  className?: string
}

function AudioPlayer({ text, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const playAudio = async () => {
    if (isPlaying || isLoading) return

    setIsLoading(true)

    try {
      const audioContent = await ttsService.synthesizeSpeech(text, 1.0)

      setIsPlaying(true)
      setIsLoading(false)

      await ttsService.playAudio(audioContent)
    } catch (error) {
      console.error("Failed to play audio:", error)
    } finally {
      setIsPlaying(false)
      setIsLoading(false)
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={playAudio}
        disabled={isLoading || isPlaying}
        className="bg-transparent"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

// Audio Controls Component (for flashcard popup)
interface AudioControlsProps {
  text: string
  className?: string
}

function AudioControls({ text, className }: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const playAudio = async (speed: "normal" | "slow") => {
    if (isPlaying || isLoading) return

    setIsLoading(true)

    try {
      const speakingRate = speed === "slow" ? 0.6 : 1.0
      const audioContent = await ttsService.synthesizeSpeech(text, speakingRate)

      setIsPlaying(true)
      setIsLoading(false)

      await ttsService.playAudio(audioContent)
    } catch (error) {
      console.error("Failed to play audio:", error)
    } finally {
      setIsPlaying(false)
      setIsLoading(false)
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Volume2 className="h-4 w-4 text-gray-600" />
      <Button
        variant="outline"
        size="sm"
        onClick={() => playAudio("normal")}
        disabled={isLoading || isPlaying}
        className="bg-transparent"
      >
        Normal
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => playAudio("slow")}
        disabled={isLoading || isPlaying}
        className="bg-transparent"
      >
        Slow
      </Button>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  )
}

// Voice Practice Component
interface VoicePracticeProps {
  targetWord: string
  className?: string
}

function VoicePractice({ targetWord, className }: VoicePracticeProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "perfect" | "close" | "incorrect"
    message: string
  } | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [microphoneAccess, setMicrophoneAccess] = useState<"unknown" | "granted" | "denied">("unknown")

  // Check microphone permissions
  const checkMicrophonePermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: "microphone" as PermissionName })
      setMicrophoneAccess(result.state === "granted" ? "granted" : result.state === "denied" ? "denied" : "unknown")

      result.onchange = () => {
        setMicrophoneAccess(result.state === "granted" ? "granted" : result.state === "denied" ? "denied" : "unknown")
      }
    } catch (error) {
      console.log("Permissions API not supported")
    }
  }

  useEffect(() => {
    checkMicrophonePermissions()
  }, [])

  const startRecording = async () => {
    try {
      console.log("Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      console.log("Microphone access granted")
      setMicrophoneAccess("granted")

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      let hasAudioInput = false
      let audioContext: AudioContext | null = null
      let audioMonitor: NodeJS.Timeout
      let recordedChunks: Blob[] = []

      // Create audio context to monitor audio levels
      try {
        audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8
        source.connect(analyser)

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        // Function to check for audio input
        const checkAudioLevel = () => {
          if (audioContext && audioContext.state !== "closed") {
            analyser.getByteFrequencyData(dataArray)
            const average = dataArray.reduce((a, b) => a + b) / bufferLength

            // Update visual audio level
            setAudioLevel(average)

            // Higher threshold for voice detection (was 5, now 15)
            if (average > 15) {
              console.log("Voice detected, level:", average)
              hasAudioInput = true
            }
          }
        }

        // Monitor audio levels more frequently
        audioMonitor = setInterval(() => {
          if (audioContext && audioContext.state !== "closed") {
            checkAudioLevel()
          } else {
            clearInterval(audioMonitor)
          }
        }, 50) // Check every 50ms instead of 100ms

        // Auto-stop recording after 5 seconds
        const autoStopTimeout = setTimeout(() => {
          if (recorder.state === "recording") {
            console.log("Auto-stopping recording after 5 seconds")
            recorder.stop()
            setIsRecording(false)
          }
        }, 5000)

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data)
            console.log("Audio chunk received, size:", event.data.size)
          }
        }

        recorder.onstop = async () => {
          console.log("Recording stopped, chunks:", recordedChunks.length)
          clearInterval(audioMonitor)
          clearTimeout(autoStopTimeout)
          setAudioLevel(0)

          if (audioContext && audioContext.state !== "closed") {
            audioContext.close()
          }

          // Process audio if we have chunks
          if (recordedChunks.length > 0) {
            const audioBlob = new Blob(recordedChunks, { type: "audio/webm" })
            console.log("Processing audio blob, size:", audioBlob.size)
            await processAudio(audioBlob)
          } else {
            console.log("No audio chunks to process")
            setFeedback({
              type: "incorrect",
              message: "No audio was recorded. Please try again and make sure to speak into your microphone.",
            })
          }

          recordedChunks = []
          // Stop all tracks to release microphone
          stream.getTracks().forEach((track) => track.stop())
        }

        setMediaRecorder(recorder)
        recorder.start()
        setIsRecording(true)
        setFeedback(null)
        console.log("Recording started")
      } catch (audioContextError) {
        console.error("Error creating audio context:", audioContextError)
        // Fallback without audio monitoring

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data)
            console.log("Audio chunk received (fallback), size:", event.data.size)
          }
        }

        recorder.onstop = async () => {
          console.log("Recording stopped (fallback)")
          if (recordedChunks.length > 0) {
            const audioBlob = new Blob(recordedChunks, { type: "audio/webm" })
            console.log("Processing audio blob (fallback), size:", audioBlob.size)
            await processAudio(audioBlob)
          } else {
            console.log("No audio chunks to process (fallback)")
            setFeedback({
              type: "incorrect",
              message: "No audio was recorded. Please try again and make sure to speak into your microphone.",
            })
          }
          recordedChunks = []
          stream.getTracks().forEach((track) => track.stop())
        }

        setMediaRecorder(recorder)
        recorder.start()
        setIsRecording(true)
        setFeedback(null)

        // Simple timeout without audio monitoring
        setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop()
            setIsRecording(false)
          }
        }, 5000) // Longer timeout for fallback
      }
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setMicrophoneAccess("denied")

      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          alert("Microphone access denied. Please allow microphone access in your browser settings and try again.")
        } else if (error.name === "NotFoundError") {
          alert("No microphone found. Please connect a microphone and try again.")
        } else {
          alert(`Microphone error: ${error.message}`)
        }
      } else {
        alert("Could not access microphone. Please check permissions and try again.")
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      console.log("Manually stopping recording")
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    console.log("Processing audio blob of size:", audioBlob.size)

    try {
      // Convert WebM to base64
      const arrayBuffer = await audioBlob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const base64Audio = btoa(String.fromCharCode(...uint8Array))

      console.log("Sending audio to Gemini API...")

      // Send to Gemini for pronunciation evaluation
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a Welsh pronunciation expert. The user is trying to pronounce the Welsh word "${targetWord}". 

Listen to the audio and evaluate their pronunciation. Respond with ONLY a JSON object:

{
  "transcription": "What the user said phonetically",
  "accuracy": "perfect" | "close" | "incorrect", 
  "feedback": "Brief, encouraging feedback (max 2 sentences)"
}

Guidelines:
- "perfect": Pronunciation matches Welsh pronunciation very closely
- "close": Recognizable but needs minor improvement
- "incorrect": Significantly off or unrecognizable

Keep feedback brief and encouraging. Focus on the most important pronunciation tip if not perfect.

Target word: "${targetWord}"`,
                  },
                  {
                    inline_data: {
                      mime_type: "audio/webm",
                      data: base64Audio,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 512,
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const generatedText = data.candidates[0].content.parts[0].text
      console.log("Gemini response:", generatedText)

      // Clean up the response and parse JSON
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim()

      try {
        const result = JSON.parse(cleanedText)
        setFeedback({
          type: result.accuracy,
          message: result.transcription ? `You said: "${result.transcription}"\n\n${result.feedback}` : result.feedback,
        })
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", cleanedText)
        setFeedback({
          type: "incorrect",
          message: "Sorry, I couldn't evaluate your pronunciation. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error processing audio:", error)
      setFeedback({
        type: "incorrect",
        message: "Sorry, there was an error processing your pronunciation. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getFeedbackColor = (type: string) => {
    switch (type) {
      case "perfect":
        return "text-green-600 bg-green-50 border-green-200"
      case "close":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "incorrect":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "perfect":
        return "🎉"
      case "close":
        return "👍"
      case "incorrect":
        return "🔄"
      default:
        return "ℹ️"
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">Test your pronunciation skills</p>

        {/* Microphone Status - only show if access is denied */}
        {microphoneAccess === "denied" && (
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center text-red-600 text-xs">
              <MicOff className="h-3 w-3 mr-1" />
              Microphone access denied
            </div>
          </div>
        )}

        <div className="flex justify-center">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={isProcessing}
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full bg-transparent border-purple-300 text-purple-600 hover:bg-purple-50 p-0"
            >
              {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Volume2 className="h-6 w-6" />}
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              size="lg"
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 animate-pulse p-0"
            >
              <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
            </Button>
          )}
        </div>

        {/* Audio Level Indicator */}
        {isRecording && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">Audio Level</div>
            <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${audioLevel > 15 ? "bg-green-500" : "bg-red-400"}`}
                style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">{audioLevel > 15 ? "Voice detected!" : "Speak louder"}</div>
          </div>
        )}

        {isRecording && (
          <p className="text-xs text-gray-500 mt-2">
            Recording will auto-stop after 5 seconds or click to stop manually
          </p>
        )}
      </div>

      {feedback && (
        <div className={`p-4 rounded-lg border ${getFeedbackColor(feedback.type)}`}>
          <div className="flex items-start space-x-2">
            <span className="text-lg">{getFeedbackIcon(feedback.type)}</span>
            <div>
              <div className="font-semibold capitalize mb-1">
                {feedback.type === "perfect" && "Perfect Pronunciation!"}
                {feedback.type === "close" && "Close, but can be better"}
                {feedback.type === "incorrect" && "That wasn't correct, try again"}
              </div>
              <p className="text-sm whitespace-pre-line">{feedback.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Flashcard Popup Component
interface FlashcardPopupProps {
  card: PublicVocabularyCard | CustomFlashcard | null
  isOpen: boolean
  onClose: () => void
}

function FlashcardPopup({ card, isOpen, onClose }: FlashcardPopupProps) {
  const { practiceMode } = useSettings()
  const [showAnswer, setShowAnswer] = useState(false)
  const [showExamples, setShowExamples] = useState(false)

  // Reset state when card changes or popup opens
  useEffect(() => {
    if (isOpen) {
      setShowAnswer(false)
      setShowExamples(false)
    }
  }, [isOpen, card])

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Don't render if card is null
  if (!card) {
    return null
  }

  const isCustomCard = "points" in card

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Flashcard Details</DialogTitle>
          <DialogDescription>
            {isCustomCard ? "Custom flashcard" : "Public flashcard"} from {card.category} category
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="text-center px-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Badge className={isCustomCard ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                  {card.category}
                </Badge>
                {"difficulty" in card && card.difficulty && (
                  <Badge className={getDifficultyColor(card.difficulty)}>{card.difficulty}</Badge>
                )}
                {isCustomCard && <Badge className="bg-gray-100 text-gray-800">Custom</Badge>}
              </div>
              {isCustomCard && <div className="text-sm font-semibold text-blue-600">{card.points}/50 pts</div>}
            </div>
            {practiceMode === "welsh-to-english" ? (
              <>
                <CardTitle className="text-4xl font-bold text-red-600 mb-2">{card.welsh}</CardTitle>
                <CardDescription className="text-lg">Pronunciation: {card.pronunciation}</CardDescription>
              </>
            ) : (
              <CardTitle className="text-4xl font-bold text-blue-600 mb-2">{card.english}</CardTitle>
            )}
          </CardHeader>
          <CardContent className="space-y-6 px-0">
            {/* Audio Controls - only show for Welsh words */}
            {practiceMode === "welsh-to-english" && (
              <div className="flex justify-center">
                <AudioControls text={card.welsh} />
              </div>
            )}

            {!showAnswer ? (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  {practiceMode === "welsh-to-english" ? "What does this mean in English?" : "What is this in Welsh?"}
                </p>
                <Button onClick={() => setShowAnswer(true)} className="bg-blue-600 hover:bg-blue-700">
                  Show Answer
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                {practiceMode === "welsh-to-english" ? (
                  <div className="text-2xl font-semibold text-green-600">{card.english}</div>
                ) : (
                  <>
                    <div className="text-2xl font-semibold text-red-600">{card.welsh}</div>
                    <div className="text-lg text-gray-600">Pronunciation: {card.pronunciation}</div>
                    <div className="flex justify-center">
                      <AudioControls text={card.welsh} />
                    </div>
                  </>
                )}

                {/* Voice Practice - available for both modes but focuses on Welsh pronunciation */}
                <VoicePractice targetWord={card.welsh} />

                {/* Examples Dialog */}
                <Dialog open={showExamples} onOpenChange={setShowExamples}>
                  <Button variant="outline" onClick={() => setShowExamples(true)} className="bg-transparent">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Examples
                  </Button>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Example Sentences</DialogTitle>
                      <DialogDescription>See how "{card.welsh}" is used in context</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {card.examples.map((example, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-red-600">{example.welsh}</div>
                              <AudioControls text={example.welsh} />
                            </div>
                            <div className="text-gray-700 italic">{example.english}</div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

// Create Deck Component
interface CreateDeckProps {
  onBack: () => void
  onDeckCreated: () => void
  existingCategories: string[]
  customFlashcards: CustomFlashcard[]
}

function CreateDeck({ onBack, onDeckCreated, existingCategories, customFlashcards }: CreateDeckProps) {
  const { user } = useAuth()
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isNewCategory, setIsNewCategory] = useState(true)
  const [numberOfCards, setNumberOfCards] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCards, setGeneratedCards] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState<"input" | "preview" | "saving">("input")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isCancelled, setIsCancelled] = useState(false)
  const cancelRef = useRef(false)

  const difficulties = ["Beginner", "Intermediate", "Advanced"]

  const generateDeck = async () => {
    if (!category.trim() || numberOfCards < 1 || numberOfCards > 50) {
      alert("Please fill in all fields correctly")
      return
    }

    setIsGenerating(true)
    setCurrentStep("preview")
    setGeneratedCards([])
    setCurrentCardIndex(0)
    setIsCancelled(false)
    cancelRef.current = false

    try {
      const existingCardsInCategory = customFlashcards.filter((card) => card.category === category)
      const existingWords = existingCardsInCategory.map((card) => card.english.toLowerCase())

      // Generate cards one by one and display them as they're created
      for (let i = 0; i < numberOfCards; i++) {
        // Check if generation was cancelled
        if (cancelRef.current) {
          setIsCancelled(true)
          break
        }

        setCurrentCardIndex(i + 1)
        const difficulty = difficulties[i % difficulties.length]

        // Create a more sophisticated prompt for diverse word generation
        let generateWordPrompt = `
You are a Welsh language expert creating diverse vocabulary cards for the category "${category}".

Generate a single English word that is:
1. Related to or associated with the theme of "${category}" (but doesn't need to contain the exact category word)
2. Appropriate for ${difficulty} level learners
3. Different from these already used words: ${existingWords.join(", ")}
4. A common, useful word that Welsh learners would benefit from knowing

For the category "${category}", consider words that are:
- Directly related (core vocabulary)
- Contextually related (things you might find, do, or experience in this context)
- Descriptively related (adjectives, verbs, or concepts associated with this theme)

Examples for different categories:
- Food: ingredients, cooking methods, utensils, flavors, meal types, dining experiences
- Animals: habitats, behaviors, body parts, sounds, animal care, wildlife concepts
- Weather: phenomena, measurements, clothing, activities, seasonal concepts
- Colors: shades, artistic terms, emotional associations, objects typically that color`

        // Add description context if provided
        if (description.trim()) {
          generateWordPrompt += `

Additional context: ${description.trim()}
Please consider this context when selecting words that fit the category and user's specific needs.`
        }

        generateWordPrompt += `

Respond with ONLY a single English word, nothing else.

Word ${i + 1} for "${category}" (${difficulty} level):`

        try {
          // First, get a diverse English word suggestion
          const wordResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyD7vLEopz_DibqtrGGX6snnz32DrT3iSkk`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: generateWordPrompt,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.8,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 50,
                },
              }),
            },
          )

          if (!wordResponse.ok) {
            throw new Error(`Word generation failed: ${wordResponse.status}`)
          }

          const wordData = await wordResponse.json()
          const suggestedWord = wordData.candidates[0].content.parts[0].text.trim().toLowerCase()

          // Add the word to existing words to avoid duplicates in subsequent generations
          existingWords.push(suggestedWord)

          // Now translate this specific word to Welsh
          const translation = await geminiService.translateToWelsh(suggestedWord, category)
          const newCard = {
            welsh: translation.welsh,
            english: translation.english || suggestedWord,
            pronunciation: translation.pronunciation,
            examples: translation.examples || [],
            difficulty: difficulty,
          }

          // Add the card immediately to the display
          setGeneratedCards((prev) => [...prev, newCard])
        } catch (error) {
          console.error(`Failed to generate card ${i + 1}:`, error)
          // Fallback to a simple word if generation fails
          try {
            const fallbackWords = {
              food: [
                "recipe",
                "flavor",
                "ingredient",
                "kitchen",
                "meal",
                "taste",
                "cooking",
                "dining",
                "nutrition",
                "appetite",
              ],
              animals: [
                "habitat",
                "wildlife",
                "creature",
                "mammal",
                "species",
                "behavior",
                "nature",
                "forest",
                "ocean",
                "farm",
              ],
              weather: [
                "climate",
                "season",
                "temperature",
                "forecast",
                "atmosphere",
                "storm",
                "sunshine",
                "rainfall",
                "wind",
                "humidity",
              ],
              colors: [
                "shade",
                "bright",
                "dark",
                "rainbow",
                "paint",
                "artistic",
                "vibrant",
                "pale",
                "colorful",
                "design",
              ],
              feelings: ["emotion", "mood", "heart", "mind", "spirit", "joy", "peace", "energy", "comfort", "hope"],
            }

            const categoryLower = category.toLowerCase()
            const fallbackList = fallbackWords[categoryLower] || ["word", "language", "learning", "study", "practice"]
            const fallbackWord = fallbackList[i % fallbackList.length]

            const translation = await geminiService.translateToWelsh(fallbackWord, category)
            const fallbackCard = {
              welsh: translation.welsh,
              english: translation.english || fallbackWord,
              pronunciation: translation.pronunciation,
              examples: translation.examples || [],
              difficulty: difficulty,
            }

            // Add the fallback card immediately to the display
            setGeneratedCards((prev) => [...prev, fallbackCard])
          } catch (fallbackError) {
            console.error(`Fallback also failed for card ${i + 1}:`, fallbackError)
          }
        }
      }
    } catch (error) {
      console.error("Failed to generate deck:", error)
      alert("Failed to generate deck. Please try again.")
    } finally {
      setIsGenerating(false)
      setCurrentCardIndex(0)
    }
  }

  const cancelGeneration = () => {
    cancelRef.current = true
    setIsGenerating(false)
    setIsCancelled(true)
  }

  const saveDeck = async () => {
    if (!user || generatedCards.length === 0) return

    setCurrentStep("saving")

    try {
      for (const card of generatedCards) {
        await customFlashcardService.saveFlashcard(user.uid, {
          english: card.english,
          welsh: card.welsh,
          pronunciation: card.pronunciation,
          category: category,
          examples: card.examples || [],
        })
      }

      alert(`Successfully created ${generatedCards.length} flashcards in "${category}" category!`)
      onDeckCreated()
    } catch (error) {
      console.error("Failed to save deck:", error)
      alert("Failed to save some cards. Please try again.")
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === "new-category") {
      setIsNewCategory(true)
      setCategory("")
    } else {
      setIsNewCategory(false)
      setCategory(value)
    }
  }

  const existingCardsInCategory = customFlashcards.filter((card) => card.category === category).length

  if (currentStep === "saving") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saving Deck</h1>
            <p className="text-gray-600">Please wait while we save your flashcards...</p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>
              Saving {generatedCards.length} flashcards to "{category}" category...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "preview") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setCurrentStep("input")} className="bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isGenerating ? "Generating Deck" : "Preview Generated Deck"}
            </h1>
            <p className="text-gray-600">
              {isGenerating
                ? "Cards will appear as they are generated"
                : "Review your generated flashcards before saving"}
            </p>
          </div>
        </div>

        {isGenerating && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Generation Progress</h3>
                <p className="text-blue-700">
                  Generating card {currentCardIndex} of {numberOfCards} for "{category}" category...
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {generatedCards.length} cards completed • Creating unique words with varied difficulty levels
                  {description.trim() && " • Using your custom description"}
                </p>
              </div>
              <Button
                onClick={cancelGeneration}
                variant="outline"
                className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
            <div className="mt-3">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(generatedCards.length / numberOfCards) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {isCancelled && !isGenerating && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900">Generation Cancelled</h3>
            <p className="text-yellow-700">
              Generation was cancelled. {generatedCards.length} cards were created before cancellation.
            </p>
          </div>
        )}

        {!isGenerating && !isCancelled && generatedCards.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Generation Complete</h3>
            <p className="text-green-700">
              Successfully generated {generatedCards.length} flashcards for "{category}" category.
            </p>
          </div>
        )}

        {generatedCards.length > 0 && (
          <>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Deck Summary</h3>
              <p className="text-blue-700">
                Category: {category} | Generated Cards: {generatedCards.length}
                {existingCardsInCategory > 0 && ` | Existing Cards: ${existingCardsInCategory}`}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Mixed difficulty levels with diverse vocabulary related to {category}
                {description.trim() && " • Generated using your custom description"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedCards.map((card, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-purple-100 text-purple-800">{category}</Badge>
                      <div className="flex space-x-1">
                        <Badge
                          className={
                            card.difficulty === "Beginner"
                              ? "bg-green-100 text-green-800"
                              : card.difficulty === "Intermediate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {card.difficulty}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800">Card {index + 1}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-red-600">{card.welsh}</CardTitle>
                    <CardDescription>
                      {card.english} • {card.pronunciation}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <AudioPlayer text={card.welsh} />
                      <div className="text-xs text-gray-500">{card.examples?.length || 0} examples</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {!isGenerating && generatedCards.length > 0 && (
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setCurrentStep("input")} className="bg-transparent">
              Regenerate
            </Button>
            <Button onClick={saveDeck} className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              Save {generatedCards.length} Cards
            </Button>
          </div>
        )}

        {!isGenerating && generatedCards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No cards were generated. Please try again.</div>
            <Button onClick={() => setCurrentStep("input")} className="mt-4 bg-blue-600 hover:bg-blue-700">
              Back to Settings
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Flashcard Deck</h1>
          <p className="text-gray-600">Generate diverse flashcards for a specific category</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Category Selection</Label>

            {existingCategories.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Choose from existing categories:</Label>
                  <Select onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an existing category" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingCategories.map((cat) => {
                        const cardCount = customFlashcards.filter((card) => card.category === cat).length
                        return (
                          <SelectItem key={cat} value={cat}>
                            {cat} ({cardCount} existing cards)
                          </SelectItem>
                        )
                      })}
                      <SelectItem value="new-category">+ Create New Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {(isNewCategory || existingCategories.length === 0) && (
              <div className="space-y-2">
                <Label htmlFor="new-category">
                  {existingCategories.length === 0 ? "Category Name" : "New Category Name"}
                </Label>
                <Input
                  id="new-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Food & Drink, Animals, Colors, Weather"
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">Enter a category name for organizing your flashcards</p>
              </div>
            )}

            {!isNewCategory && category && existingCardsInCategory > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You have {existingCardsInCategory} existing cards in "{category}". New cards
                  will be added to this category and will avoid duplicating existing words.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Focus on cooking verbs and kitchen utensils, Include advanced medical terminology, Words related to outdoor activities and hiking..."
              className="min-h-20"
            />
            <p className="text-sm text-gray-500">
              Provide additional context about the type of words you want. This helps generate more targeted vocabulary.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-count">Number of Cards to Generate</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="card-count"
                type="number"
                min="1"
                max="50"
                value={numberOfCards}
                onChange={(e) => setNumberOfCards(Math.max(1, Math.min(50, Number.parseInt(e.target.value) || 1)))}
                className="w-24 text-lg"
              />
              <div className="flex-1">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={numberOfCards}
                  onChange={(e) => setNumberOfCards(Number.parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Choose between 1 and 50 cards (recommended: 10-20 for comprehensive learning)
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">How it works:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>
                • AI will generate {numberOfCards} unique words related to "{category || "your category"}"
              </li>
              {description.trim() && <li>• Your description will guide the AI to generate more specific vocabulary</li>}
              <li>• Each card will appear as soon as it's generated (no waiting for all cards)</li>
              <li>• You can cancel generation at any time and save the cards created so far</li>
              <li>• Words will be contextually related but diverse (not just the category word repeated)</li>
              <li>• Cards include mixed difficulty levels (Beginner, Intermediate, Advanced)</li>
              <li>• Each card includes pronunciation and example sentences</li>
              {!isNewCategory && existingCardsInCategory > 0 && (
                <li>• New cards will avoid duplicating your existing {existingCardsInCategory} words</li>
              )}
            </ul>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onBack} className="bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={generateDeck}
              disabled={!category.trim() || isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Package className="mr-2 h-4 w-4" />
              Generate Diverse Deck
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Edit Custom Flashcard Form
interface EditCustomFlashcardFormProps {
  flashcard: CustomFlashcard
  onSave: (flashcard: CustomFlashcard) => void
  onCancel: () => void
}

function EditCustomFlashcardForm({ flashcard, onSave, onCancel }: EditCustomFlashcardFormProps) {
  const [welsh, setWelsh] = useState(flashcard.welsh)
  const [english, setEnglish] = useState(flashcard.english)
  const [pronunciation, setPronunciation] = useState(flashcard.pronunciation)
  const [category, setCategory] = useState(flashcard.category)
  const [examples, setExamples] = useState(flashcard.examples)
  const [isSaving, setIsSaving] = useState(false)

  const handleExampleChange = (index: number, field: "welsh" | "english", value: string) => {
    const updatedExamples = [...examples]
    updatedExamples[index] = { ...updatedExamples[index], [field]: value }
    setExamples(updatedExamples)
  }

  const addExample = () => {
    setExamples([...examples, { welsh: "", english: "" }])
  }

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const updatedFlashcard = {
      ...flashcard,
      welsh,
      english,
      pronunciation,
      category,
      examples: examples.filter((ex) => ex.welsh.trim() && ex.english.trim()),
    }
    await onSave(updatedFlashcard)
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Main Card Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-welsh">Welsh Word</Label>
          <Input id="edit-welsh" value={welsh} onChange={(e) => setWelsh(e.target.value)} placeholder="Welsh word" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-english">English Translation</Label>
          <Input
            id="edit-english"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="English translation"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-pronunciation">Pronunciation</Label>
        <Input
          id="edit-pronunciation"
          value={pronunciation}
          onChange={(e) => setPronunciation(e.target.value)}
          placeholder="Phonetic pronunciation"
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
      </div>

      {/* Audio Preview */}
      <div className="space-y-2">
        <Label>Audio Preview</Label>
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-red-600">{welsh}</div>
          <AudioPlayer text={welsh} />
        </div>
      </div>

      {/* Example Sentences */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Example Sentences</Label>
          <Button type="button" onClick={addExample} variant="outline" size="sm" className="bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Add Example
          </Button>
        </div>

        <div className="space-y-4">
          {examples.map((example, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Example {index + 1}</Label>
                  {examples.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeExample(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={example.welsh}
                      onChange={(e) => handleExampleChange(index, "welsh", e.target.value)}
                      placeholder="Welsh sentence"
                      className="flex-1"
                    />
                    <AudioPlayer text={example.welsh} />
                  </div>
                  <Input
                    value={example.english}
                    onChange={(e) => handleExampleChange(index, "english", e.target.value)}
                    placeholder="English translation"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} className="bg-transparent">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <span>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}

export default function FlashcardLibrary() {
  const { user } = useAuth()
  const { practiceMode } = useSettings()
  const [publicFlashcards, setPublicFlashcards] = useState<PublicVocabularyCard[]>([])
  const [customFlashcards, setCustomFlashcards] = useState<CustomFlashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [categories, setCategories] = useState<{ public: string[]; custom: string[] }>({ public: [], custom: [] })
  const [editingFlashcard, setEditingFlashcard] = useState<CustomFlashcard | null>(null)
  const [viewingFlashcard, setViewingFlashcard] = useState<PublicVocabularyCard | CustomFlashcard | null>(null)
  const [view, setView] = useState<"library" | "create" | "create-deck">("library")

  useEffect(() => {
    if (user) {
      loadFlashcards()
    }
  }, [user])

  const loadFlashcards = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [publicData, customData, categoryData] = await Promise.all([
        publicVocabularyService.getAllVocabulary(),
        customFlashcardService.getUserFlashcards(user.uid),
        publicVocabularyService.getCategories(),
      ])

      setPublicFlashcards(publicData)
      setCustomFlashcards(customData)

      // Keep separate categories for each tab
      const customCategories = [...new Set(customData.map((card) => card.category))].sort()
      const publicCategories = [...new Set(publicData.map((card) => card.category))].sort()

      // Store both sets of categories
      setCategories({ public: publicCategories, custom: customCategories })
    } catch (error) {
      console.error("Failed to load flashcards:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomFlashcard = async (flashcardId: string) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) return

    try {
      await customFlashcardService.deleteFlashcard(flashcardId)
      await loadFlashcards()
    } catch (error) {
      console.error("Failed to delete flashcard:", error)
    }
  }

  const handleEditSave = async (updatedFlashcard: CustomFlashcard) => {
    if (!editingFlashcard?.id || !user) return

    try {
      // Update the flashcard in the service (we need to add an update method)
      // For now, we'll delete and recreate
      await customFlashcardService.deleteFlashcard(editingFlashcard.id)
      await customFlashcardService.saveFlashcard(user.uid, {
        english: updatedFlashcard.english,
        welsh: updatedFlashcard.welsh,
        pronunciation: updatedFlashcard.pronunciation,
        category: updatedFlashcard.category,
        examples: updatedFlashcard.examples,
      })
      await loadFlashcards()
      setEditingFlashcard(null)
    } catch (error) {
      console.error("Failed to update flashcard:", error)
    }
  }

  const handleCardClick = (card: PublicVocabularyCard | CustomFlashcard, event: React.MouseEvent) => {
    // Don't open popup if clicking on action buttons
    const target = event.target as HTMLElement
    if (target.closest("button") || target.closest('[role="button"]')) {
      return
    }
    setViewingFlashcard(card)
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filterFlashcards = (flashcards: (PublicVocabularyCard | CustomFlashcard)[]) => {
    return flashcards.filter((card) => {
      const matchesSearch =
        searchTerm === "" ||
        card.welsh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.english.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "All" || card.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }

  const filteredPublicFlashcards = filterFlashcards(publicFlashcards)
  const filteredCustomFlashcards = filterFlashcards(customFlashcards)

  // Get unique custom categories for the CreateDeck component
  const customCategories = [...new Set(customFlashcards.map((card) => card.category))].sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading flashcard library...</p>
        </div>
      </div>
    )
  }

  if (view === "create") {
    return <CreateFlashcard onBack={() => setView("library")} onFlashcardCreated={() => setView("library")} />
  }

  if (view === "create-deck") {
    return (
      <CreateDeck
        onBack={() => setView("library")}
        onDeckCreated={() => {
          setView("library")
          loadFlashcards()
        }}
        existingCategories={customCategories}
        customFlashcards={customFlashcards}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flashcard Library</h1>
          <p className="text-gray-600">Browse and manage your flashcard collection</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setView("create")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Flashcard
          </Button>
          <Button onClick={() => setView("create-deck")} className="bg-purple-600 hover:bg-purple-700">
            <Package className="mr-2 h-4 w-4" />
            Create Deck
          </Button>
        </div>
      </div>

      {/* Tabs for Public and Custom Flashcards */}
      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public">Public Flashcards ({filteredPublicFlashcards.length})</TabsTrigger>
          <TabsTrigger value="custom">My Flashcards ({filteredCustomFlashcards.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search flashcards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.public.map((category) => {
                    const count = publicFlashcards.filter((card) => card.category === category).length
                    return (
                      <SelectItem key={category} value={category}>
                        {category} ({count})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">{filteredPublicFlashcards.length} flashcards found</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPublicFlashcards.map((card) => (
              <Card
                key={card.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={(e) => handleCardClick(card, e)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-100 text-blue-800">{card.category}</Badge>
                    {"difficulty" in card && (
                      <Badge className={getDifficultyColor(card.difficulty)}>{card.difficulty}</Badge>
                    )}
                  </div>
                  {practiceMode === "welsh-to-english" ? (
                    <>
                      <CardTitle className="text-xl text-red-600">{card.welsh}</CardTitle>
                      <CardDescription>
                        {card.english} • {card.pronunciation}
                      </CardDescription>
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-xl text-blue-600">{card.english}</CardTitle>
                      <CardDescription>
                        {card.welsh} • {card.pronunciation}
                      </CardDescription>
                    </>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <AudioPlayer text={card.welsh} />
                    <div className="text-xs text-gray-500">{card.examples.length} examples</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPublicFlashcards.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No public flashcards found matching your criteria</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search flashcards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.custom.map((category) => {
                    const count = customFlashcards.filter((card) => card.category === category).length
                    return (
                      <SelectItem key={category} value={category}>
                        {category} ({count})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">{filteredCustomFlashcards.length} flashcards found</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomFlashcards.map((card) => (
              <Card
                key={card.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={(e) => handleCardClick(card, e)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-100 text-purple-800">{card.category}</Badge>
                    <Badge className="bg-gray-100 text-gray-800">Custom</Badge>
                  </div>
                  {practiceMode === "welsh-to-english" ? (
                    <>
                      <CardTitle className="text-xl text-red-600">{card.welsh}</CardTitle>
                      <CardDescription className="text-green-600 font-medium">{card.english}</CardDescription>
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-xl text-blue-600">{card.english}</CardTitle>
                      <CardDescription className="text-red-600 font-medium">{card.welsh}</CardDescription>
                    </>
                  )}
                  {card.pronunciation && <p className="text-sm text-gray-600">/{card.pronunciation}/</p>}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <AudioPlayer text={card.welsh} />
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingFlashcard(card)
                        }}
                        className="bg-transparent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCustomFlashcard(card.id!)
                        }}
                        className="text-red-600 hover:text-red-700 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">{card.examples.length} examples</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustomFlashcards.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No custom flashcards found matching your criteria</div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Flashcard Popup */}
      <FlashcardPopup card={viewingFlashcard} isOpen={!!viewingFlashcard} onClose={() => setViewingFlashcard(null)} />

      {/* Edit Dialog */}
      <Dialog open={!!editingFlashcard} onOpenChange={() => setEditingFlashcard(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Custom Flashcard</DialogTitle>
            <DialogDescription>Update your custom flashcard details</DialogDescription>
          </DialogHeader>

          {editingFlashcard && (
            <EditCustomFlashcardForm
              flashcard={editingFlashcard}
              onSave={handleEditSave}
              onCancel={() => setEditingFlashcard(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
