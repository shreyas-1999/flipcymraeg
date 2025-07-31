"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, CheckCircle, XCircle, Loader2, Volume2, Star, BookOpen, MicOff, Shuffle } from "lucide-react"
import {
  publicVocabularyService,
  type PublicVocabularyCard,
  type UserVocabularyProgress,
} from "@/lib/public-vocabulary-service"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import CustomVocabularyPractice from "./custom-vocabulary-practice"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
      console.error("Audio playback error:", error)
      throw error
    }
  }
}

const ttsService = new TextToSpeechService()

// Audio Controls Component
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

// Public Flashcards Practice Component
function PublicFlashcardsPractice() {
  const { user } = useAuth()
  const { practiceMode } = useSettings()
  const [vocabulary, setVocabulary] = useState<(PublicVocabularyCard & { userProgress?: UserVocabularyProgress })[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [showExamples, setShowExamples] = useState(false)
  const [filteredVocabulary, setFilteredVocabulary] = useState<
    (PublicVocabularyCard & { userProgress?: UserVocabularyProgress })[]
  >([])

  useEffect(() => {
    if (user) {
      loadVocabulary()
    }
  }, [user])

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredVocabulary(vocabulary)
    } else {
      setFilteredVocabulary(vocabulary.filter((card) => card.category === selectedCategory))
    }
    setCurrentIndex(0)
    setShowAnswer(false)
    setShowExamples(false)
  }, [vocabulary, selectedCategory])

  const loadVocabulary = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [vocabWithProgress, categoryData] = await Promise.all([
        publicVocabularyService.getVocabularyWithProgress(user.uid),
        publicVocabularyService.getCategories(),
      ])

      setVocabulary(vocabWithProgress)
      setCategories(categoryData)
    } catch (error) {
      console.error("Error loading vocabulary:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentCard = filteredVocabulary[currentIndex]

  const handleCorrect = async () => {
    if (!currentCard || !user) return

    const currentProgress = currentCard.userProgress
    const newPoints = Math.min((currentProgress?.points || 0) + 10, 50)
    const newMastered = newPoints >= 50
    const newReviewCount = (currentProgress?.reviewCount || 0) + 1

    // Update local state
    const updatedVocabulary = [...vocabulary]
    const originalIndex = vocabulary.findIndex((card) => card.id === currentCard.id)
    if (originalIndex !== -1) {
      updatedVocabulary[originalIndex] = {
        ...currentCard,
        userProgress: {
          ...currentProgress,
          points: newPoints,
          mastered: newMastered,
          reviewCount: newReviewCount,
        },
      }
      setVocabulary(updatedVocabulary)
    }

    // Update in database
    try {
      await publicVocabularyService.updateUserProgress(
        user.uid,
        currentCard.id!,
        newPoints,
        newMastered,
        newReviewCount,
      )
    } catch (error) {
      console.error("Failed to update progress:", error)
    }

    setSessionStats((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }))
    nextCard()
  }

  const handleIncorrect = () => {
    setSessionStats((prev) => ({ correct: prev.correct, total: prev.total + 1 }))
    nextCard()
  }

  const nextCard = () => {
    setShowAnswer(false)
    setShowExamples(false)
    if (currentIndex < filteredVocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0) // Loop back to start
    }
  }

  const resetSession = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
    setShowExamples(false)
    setSessionStats({ correct: 0, total: 0 })
  }

  const shuffleDeck = () => {
    const shuffled = [...filteredVocabulary].sort(() => Math.random() - 0.5)
    setFilteredVocabulary(shuffled)
    setCurrentIndex(0)
    setShowAnswer(false)
    setShowExamples(false)
  }

  const getDifficultyColor = (difficulty: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading vocabulary...</p>
        </div>
      </div>
    )
  }

  if (vocabulary.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>No Public Vocabulary</CardTitle>
            <CardDescription>No public vocabulary cards are available yet.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">Check back later for new content.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (filteredVocabulary.length === 0) {
    return (
      <div className="space-y-6">
        {/* Category Filter */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="category-filter">Filter by Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories ({vocabulary.length})</SelectItem>
              {categories.map((category) => {
                const count = vocabulary.filter((card) => card.category === category).length
                return (
                  <SelectItem key={category} value={category}>
                    {category} ({count})
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>No Vocabulary in "{selectedCategory}"</CardTitle>
            <CardDescription>
              {selectedCategory === "All"
                ? "You don't have any vocabulary cards yet."
                : `You don't have any vocabulary cards in the "${selectedCategory}" category.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {selectedCategory !== "All" && (
              <Button variant="outline" onClick={() => setSelectedCategory("All")} className="bg-transparent">
                View All Categories
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Label htmlFor="category-filter">Filter by Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories ({vocabulary.length})</SelectItem>
              {categories.map((category) => {
                const count = vocabulary.filter((card) => card.category === category).length
                return (
                  <SelectItem key={category} value={category}>
                    {category} ({count})
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={resetSession}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={shuffleDeck}>
            <Shuffle className="mr-2 h-4 w-4" />
            Shuffle
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredVocabulary.length} of {vocabulary.length} cards
        </div>
      </div>

      {/* Flashcard */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Badge className={getDifficultyColor(currentCard.difficulty)}>{currentCard.difficulty}</Badge>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-semibold text-blue-600">{currentCard.userProgress?.points || 0}/50 pts</div>
              {currentCard.userProgress?.mastered && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </div>
          </div>
          {practiceMode === "welsh-to-english" ? (
            <>
              <CardTitle className="text-4xl font-bold text-red-600 mb-2">{currentCard.welsh}</CardTitle>
              <CardDescription className="text-lg">Pronunciation: {currentCard.pronunciation}</CardDescription>
            </>
          ) : (
            <CardTitle className="text-4xl font-bold text-blue-600 mb-2">{currentCard.english}</CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Controls - only show for Welsh words */}
          {practiceMode === "welsh-to-english" && (
            <div className="flex justify-center">
              <AudioControls text={currentCard.welsh} />
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
                <div className="text-2xl font-semibold text-green-600">{currentCard.english}</div>
              ) : (
                <>
                  <div className="text-2xl font-semibold text-red-600">{currentCard.welsh}</div>
                  <div className="text-lg text-gray-600">Pronunciation: {currentCard.pronunciation}</div>
                  <div className="flex justify-center">
                    <AudioControls text={currentCard.welsh} />
                  </div>
                </>
              )}

              {/* Voice Practice - available for both modes but focuses on Welsh pronunciation */}
              <VoicePractice targetWord={currentCard.welsh} />

              {/* Examples Dialog */}
              <Dialog open={showExamples} onOpenChange={setShowExamples}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-transparent">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Examples
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Example Sentences</DialogTitle>
                    <DialogDescription>See how "{currentCard.welsh}" is used in context</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {currentCard.examples.map((example, index) => (
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

              <p className="text-gray-600">Did you get it right?</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={handleCorrect} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Yes
                </Button>
                <Button
                  onClick={handleIncorrect}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  No
                </Button>
              </div>
            </div>
          )}

          {/* Card Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Card Progress</span>
              <span>{currentCard.userProgress?.points || 0}/50 points</span>
            </div>
            <Progress value={((currentCard.userProgress?.points || 0) / 50) * 100} className="h-2" />
            {currentCard.userProgress?.mastered && (
              <div className="text-center text-sm text-green-600 font-semibold">
                ✨ Mastered! This card will appear less frequently.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Session Progress</span>
            <span className="text-sm text-gray-600">
              {sessionStats.correct}/{sessionStats.total} correct
            </span>
          </div>
          <Progress
            value={sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total) * 100 : 0}
            className="h-2"
          />
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-600">
        Card {currentIndex + 1} of {filteredVocabulary.length} in{" "}
        {selectedCategory === "All" ? "all categories" : selectedCategory}
      </div>
    </div>
  )
}

export default function VocabularyPractice() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vocabulary Practice</h1>
          <p className="text-gray-600">Practice Welsh vocabulary with flashcards</p>
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public">Public Flashcards</TabsTrigger>
          <TabsTrigger value="custom">My Flashcards</TabsTrigger>
        </TabsList>

        <TabsContent value="public">
          <PublicFlashcardsPractice />
        </TabsContent>

        <TabsContent value="custom">
          <CustomVocabularyPractice onBack={() => {}} onCreateNew={() => {}} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
