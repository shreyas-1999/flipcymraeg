"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, Save, Loader2, Play, Pause } from "lucide-react"
import { publicVocabularyService, type PublicVocabularyCard } from "@/lib/public-vocabulary-service"
import { geminiService } from "@/lib/gemini-service"
import type { AdminUser } from "@/lib/admin-service"

// TTS Service (same as before)
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

// Audio Player Component
interface AudioPlayerProps {
  text: string
  className?: string
}

function AudioPlayer({ text, className }: AudioPlayerProps) {
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => playAudio("normal")}
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

interface EditCardFormProps {
  card: PublicVocabularyCard
  onSave: (card: PublicVocabularyCard) => void
  onCancel: () => void
}

function EditCardForm({ card, onSave, onCancel }: EditCardFormProps) {
  const [welsh, setWelsh] = useState(card.welsh)
  const [english, setEnglish] = useState(card.english)
  const [pronunciation, setPronunciation] = useState(card.pronunciation)
  const [category, setCategory] = useState(card.category)
  const [difficulty, setDifficulty] = useState(card.difficulty)
  const [examples, setExamples] = useState(card.examples)
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
    const updatedCard = {
      ...card,
      welsh,
      english,
      pronunciation,
      category,
      difficulty,
      examples: examples.filter((ex) => ex.welsh.trim() && ex.english.trim()),
    }
    await onSave(updatedCard)
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
        </div>

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

interface AdminVocabularyManagerProps {
  adminUser: AdminUser
}

export default function AdminVocabularyManager({ adminUser }: AdminVocabularyManagerProps) {
  const [vocabulary, setVocabulary] = useState<PublicVocabularyCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCard, setEditingCard] = useState<PublicVocabularyCard | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [filterCategory, setFilterCategory] = useState<string>("All")
  const [filteredVocabulary, setFilteredVocabulary] = useState<PublicVocabularyCard[]>([])

  // Form states
  const [englishWord, setEnglishWord] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedCard, setGeneratedCard] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    loadVocabulary()
  }, [])

  useEffect(() => {
    if (filterCategory === "All") {
      setFilteredVocabulary(vocabulary)
    } else {
      setFilteredVocabulary(vocabulary.filter((card) => card.category === filterCategory))
    }
  }, [vocabulary, filterCategory])

  const loadVocabulary = async () => {
    try {
      setLoading(true)
      const [vocabData, categoryData] = await Promise.all([
        publicVocabularyService.getAllVocabulary(),
        publicVocabularyService.getCategories(),
      ])
      setVocabulary(vocabData)
      setCategories(categoryData)
    } catch (error) {
      console.error("Failed to load vocabulary:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!englishWord.trim()) {
      setError("Please enter an English word")
      return
    }

    if (!selectedCategory && !customCategory.trim()) {
      setError("Please select or enter a category")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const category = customCategory.trim() || selectedCategory
      const result = await geminiService.translateToWelsh(englishWord.trim(), category)

      setGeneratedCard({
        english: englishWord.trim(),
        welsh: result.welsh,
        pronunciation: result.pronunciation,
        category: category,
        difficulty: selectedDifficulty,
        examples: result.examples,
      })
    } catch (error: any) {
      setError(error.message || "Failed to generate vocabulary card")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedCard) return

    setIsSaving(true)
    setError("")

    try {
      await publicVocabularyService.addVocabularyCard(generatedCard, adminUser.uid)
      await loadVocabulary()
      resetForm()
      setShowCreateDialog(false)
    } catch (error: any) {
      setError(error.message || "Failed to save vocabulary card")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this vocabulary card?")) return

    try {
      await publicVocabularyService.deleteVocabularyCard(cardId)
      await loadVocabulary()
    } catch (error) {
      console.error("Failed to delete card:", error)
    }
  }

  const resetForm = () => {
    setEnglishWord("")
    setSelectedCategory("")
    setCustomCategory("")
    setSelectedDifficulty("Beginner")
    setGeneratedCard(null)
    setError("")
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

  const handleEditSave = async (updatedCard: PublicVocabularyCard) => {
    if (!editingCard?.id) return

    setIsSaving(true)
    setError("")

    try {
      await publicVocabularyService.updateVocabularyCard(editingCard.id, updatedCard)
      await loadVocabulary()
      setEditingCard(null)
    } catch (error: any) {
      setError(error.message || "Failed to update vocabulary card")
    } finally {
      setIsSaving(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Public Vocabulary Management</h2>
          <p className="text-gray-600">Manage the public vocabulary cards that all users can practice</p>
        </div>
        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <Label htmlFor="category-filter">Filter by Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
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
            <div className="text-sm text-gray-600">
              Showing {filteredVocabulary.length} of {vocabulary.length} cards
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Vocabulary
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Vocabulary Card</DialogTitle>
                <DialogDescription>
                  Use AI to generate Welsh vocabulary with pronunciation and examples
                </DialogDescription>
              </DialogHeader>

              {!generatedCard ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="english-word">English Word</Label>
                    <Input
                      id="english-word"
                      value={englishWord}
                      onChange={(e) => setEnglishWord(e.target.value)}
                      placeholder="Enter English word"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-category">Or New Category</Label>
                      <Input
                        id="custom-category"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter new category"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={selectedDifficulty} onValueChange={(value: any) => setSelectedDifficulty(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

                  <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Generate Card
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-100 text-blue-800">{generatedCard.category}</Badge>
                        <Badge className={getDifficultyColor(generatedCard.difficulty)}>
                          {generatedCard.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl text-red-600">{generatedCard.welsh}</CardTitle>
                      <CardDescription>Pronunciation: {generatedCard.pronunciation}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <AudioPlayer text={generatedCard.welsh} />
                      </div>

                      <div className="text-center">
                        <div className="text-xl font-semibold text-green-600">{generatedCard.english}</div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Example Sentences:</h4>
                        <div className="space-y-2">
                          {generatedCard.examples.map((example: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-red-600">{example.welsh}</div>
                                <AudioPlayer text={example.welsh} />
                              </div>
                              <div className="text-gray-700 italic">{example.english}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

                  <div className="flex space-x-4">
                    <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-green-600 hover:bg-green-700">
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <span>
                          <Save className="mr-2 h-4 w-4" />
                          Save to Public Vocabulary
                        </span>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetForm} className="bg-transparent">
                      Create Another
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVocabulary.map((card) => (
          <Card key={card.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-blue-100 text-blue-800">{card.category}</Badge>
                <Badge className={getDifficultyColor(card.difficulty)}>{card.difficulty}</Badge>
              </div>
              <CardTitle className="text-xl text-red-600">{card.welsh}</CardTitle>
              <CardDescription>
                {card.english} • {card.pronunciation}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <AudioPlayer text={card.welsh} />
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingCard(card)} className="bg-transparent">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(card.id!)}
                    className="text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">{card.examples.length} example sentences</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vocabulary.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">No vocabulary cards found</div>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create First Card
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vocabulary Card</DialogTitle>
            <DialogDescription>Update the Welsh vocabulary card details</DialogDescription>
          </DialogHeader>

          {editingCard && (
            <EditCardForm card={editingCard} onSave={handleEditSave} onCancel={() => setEditingCard(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
