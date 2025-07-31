"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Eye, Save, ArrowLeft, Play, Pause, Volume2 } from "lucide-react"
import { geminiService } from "@/lib/gemini-service"
import { customFlashcardService } from "@/lib/custom-flashcard-service"
import { useAuth } from "@/contexts/auth-context"
import { vocabularyService } from "@/lib/vocabulary-service"

// Text-to-Speech Service (same as in lessons)
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
        const errorText = await response.text()
        console.error("TTS API Error Response:", errorText)
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

// Audio Player Component
interface AudioPlayerProps {
  text: string
  className?: string
}

function AudioPlayer({ text, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSpeed, setCurrentSpeed] = useState<"normal" | "slow">("normal")

  const playAudio = async (speed: "normal" | "slow") => {
    if (isPlaying || isLoading) return

    setIsLoading(true)
    setCurrentSpeed(speed)

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
      <Button
        variant="outline"
        size="sm"
        onClick={() => playAudio("normal")}
        disabled={isLoading || isPlaying}
        className="bg-transparent"
      >
        {isLoading && currentSpeed === "normal" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying && currentSpeed === "normal" ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs">Normal</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => playAudio("slow")}
        disabled={isLoading || isPlaying}
        className="bg-transparent"
      >
        {isLoading && currentSpeed === "slow" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs">Slow</span>
      </Button>
    </div>
  )
}

interface CreateFlashcardProps {
  onBack: () => void
  onFlashcardCreated: () => void
}

export default function CreateFlashcard({ onBack, onFlashcardCreated }: CreateFlashcardProps) {
  const { user } = useAuth()
  const [englishWord, setEnglishWord] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedFlashcard, setGeneratedFlashcard] = useState<any>(null)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  // Load all categories (default + custom) on component mount
  useEffect(() => {
    const loadCategories = async () => {
      if (!user) return

      try {
        setIsLoadingCategories(true)

        // Get default categories
        const defaultCategories = vocabularyService.getCategories()

        // Get custom categories from user's flashcards
        const userFlashcards = await customFlashcardService.getUserFlashcards(user.uid)
        const customCategories = [...new Set(userFlashcards.map((card) => card.category))]

        // Combine and remove duplicates, then add "Custom" at the end
        const combinedCategories = [...new Set([...defaultCategories, ...customCategories])]
        combinedCategories.push("Custom")

        setAllCategories(combinedCategories)
      } catch (error) {
        console.error("Error loading categories:", error)
        // Fallback to default categories + Custom
        const defaultCategories = vocabularyService.getCategories()
        setAllCategories([...defaultCategories, "Custom"])
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [user])

  const handleGenerate = async () => {
    if (!englishWord.trim()) {
      setError("Please enter an English word")
      return
    }

    if (!selectedCategory) {
      setError("Please select a category")
      return
    }

    if (selectedCategory === "Custom" && !customCategory.trim()) {
      setError("Please enter a custom category name")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const category = selectedCategory === "Custom" ? customCategory : selectedCategory
      const result = await geminiService.translateToWelsh(englishWord.trim(), category)

      setGeneratedFlashcard({
        english: englishWord.trim(),
        welsh: result.welsh,
        pronunciation: result.pronunciation,
        category: category,
        examples: result.examples,
      })

      setShowPreview(true)
    } catch (error: any) {
      setError(error.message || "Failed to generate flashcard")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!user || !generatedFlashcard) return

    setIsSaving(true)
    setError("")

    try {
      await customFlashcardService.saveFlashcard(user.uid, generatedFlashcard)
      onFlashcardCreated()
    } catch (error: any) {
      setError(error.message || "Failed to save flashcard")
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setEnglishWord("")
    setSelectedCategory("")
    setCustomCategory("")
    setGeneratedFlashcard(null)
    setShowPreview(false)
    setError("")
  }

  if (showPreview && generatedFlashcard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Preview Flashcard</h2>
          <div className="w-20" /> {/* Spacer */}
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-blue-100 text-blue-800">{generatedFlashcard.category}</Badge>
              <Badge className="bg-green-100 text-green-800">Custom</Badge>
            </div>
            <CardTitle className="text-4xl font-bold text-red-600 mb-2">{generatedFlashcard.welsh}</CardTitle>
            <CardDescription className="text-lg">Pronunciation: {generatedFlashcard.pronunciation}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audio Controls */}
            <div className="flex justify-center">
              <AudioPlayer text={generatedFlashcard.welsh} />
            </div>

            {/* Translation */}
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600 mb-4">{generatedFlashcard.english}</div>
            </div>

            {/* Example Sentences */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Example Sentences</h3>
              <div className="space-y-4">
                {generatedFlashcard.examples.map((example: any, index: number) => (
                  <Card key={index} className="p-4 bg-gray-50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-red-600">{example.welsh}</div>
                        <AudioPlayer text={example.welsh} />
                      </div>
                      <div className="text-gray-700 italic">{example.english}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-4">
              <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Flashcard
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetForm} className="bg-transparent">
                Create Another
              </Button>
            </div>

            {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Create Custom Flashcard</h2>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            New Flashcard
          </CardTitle>
          <CardDescription>
            Enter an English word and we'll generate the Welsh translation with pronunciation and examples
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="english-word">English Word</Label>
            <Input
              id="english-word"
              type="text"
              placeholder="Enter English word (e.g., 'house', 'happy', 'run')"
              value={englishWord}
              onChange={(e) => setEnglishWord(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoadingCategories}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory === "Custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-category">Custom Category Name</Label>
                <Input
                  id="custom-category"
                  type="text"
                  placeholder="Enter custom category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isLoadingCategories}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Generate & Preview
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-600 text-center space-y-2">
            <p>✨ AI will generate:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Welsh translation with proper spelling</li>
              <li>Phonetic pronunciation guide</li>
              <li>3 example sentences in Welsh with English translations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
