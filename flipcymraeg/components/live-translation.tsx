"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftRight, Copy, Save, Loader2, History, Play, Pause, Volume2 } from "lucide-react"
import {
  translationService,
  type TranslationRequest,
  type TranslationResponse,
  type TranslationHistory,
} from "@/lib/translation-service"
import { useAuth } from "@/contexts/auth-context"
import { ttsService } from "@/lib/text-to-speech"

// Audio Player Component - using shared TTS service
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
      const audioContent = await ttsService.synthesizeSpeech({
        text,
        languageCode: "cy-GB",
        speed: speakingRate,
      })

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
          <Volume2 className="h-4 w-4 animate-spin" />
        ) : isPlaying && currentSpeed === "slow" ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs">Slow</span>
      </Button>
    </div>
  )
}

export default function LiveTranslation() {
  const { user } = useAuth()
  const [sourceText, setSourceText] = useState("")
  const [translationResult, setTranslationResult] = useState<TranslationResponse | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState<"en" | "cy">("en")
  const [targetLanguage, setTargetLanguage] = useState<"en" | "cy">("cy")
  const [dialect, setDialect] = useState<"standard" | "north" | "south">("standard")
  const [formality, setFormality] = useState<"standard" | "formal" | "informal">("standard")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [translationHistory, setTranslationHistory] = useState<TranslationHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (user) {
      loadTranslationHistory()
    }
  }, [user])

  const loadTranslationHistory = async () => {
    if (!user) return
    try {
      const history = await translationService.getTranslationHistory(user.uid)
      setTranslationHistory(history)
    } catch (error) {
      console.error("Failed to load translation history:", error)
    }
  }

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
    setSourceText("")
    setTranslationResult(null)
  }

  const handleTranslate = async () => {
    if (!sourceText.trim() || !user) return

    setIsTranslating(true)
    try {
      const request: TranslationRequest = {
        text: sourceText.trim(),
        sourceLanguage,
        targetLanguage,
        dialect,
        formality,
      }

      const result = await translationService.translateText(request)
      setTranslationResult(result)
    } catch (error) {
      console.error("Translation failed:", error)
      alert("Translation failed. Please try again.")
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSaveToHistory = async () => {
    if (!translationResult || !user || !sourceText.trim()) return

    setIsSaving(true)
    try {
      const historyItem: Omit<TranslationHistory, "id"> = {
        sourceText: sourceText.trim(),
        translatedText: translationResult.translatedText,
        sourceLanguage,
        targetLanguage,
        pronunciation: translationResult.pronunciation,
        examples: translationResult.examples,
        timestamp: new Date(),
        userId: user.uid,
      }

      await translationService.saveToHistory(historyItem)
      await loadTranslationHistory()
      alert("Translation saved to history!")
    } catch (error) {
      console.error("Failed to save translation:", error)
      alert("Failed to save translation to history.")
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("Copied to clipboard!")
    } catch (error) {
      alert("Failed to copy to clipboard")
    }
  }

  const loadFromHistory = (historyItem: TranslationHistory) => {
    setSourceText(historyItem.sourceText)
    setSourceLanguage(historyItem.sourceLanguage)
    setTargetLanguage(historyItem.targetLanguage)
    setTranslationResult({
      translatedText: historyItem.translatedText,
      pronunciation: historyItem.pronunciation,
      examples: historyItem.examples || [],
    })
    setShowHistory(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Translation</h1>
        <p className="text-gray-600">Translate text and practice pronunciation in real-time</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={showHistory ? "default" : "outline"}
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>
      </div>

      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Translation History</CardTitle>
          </CardHeader>
          <CardContent>
            {translationHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No translation history yet</p>
            ) : (
              <div className="space-y-3">
                {translationHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge variant="outline">{item.sourceLanguage === "en" ? "English" : "Welsh"}</Badge>
                        <ArrowLeftRight className="h-4 w-4 text-gray-400" />
                        <Badge variant="outline">{item.targetLanguage === "en" ? "English" : "Welsh"}</Badge>
                      </div>
                      <span className="text-xs text-gray-500">{item.timestamp.toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{item.sourceText}</div>
                      <div className="text-gray-600">{item.translatedText}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Language Panel */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Select value={sourceLanguage} onValueChange={(value: "en" | "cy") => setSourceLanguage(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="cy">Welsh</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={swapLanguages}>
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="min-h-32 resize-none"
            />
          </CardContent>
        </Card>

        {/* Target Language Panel */}
        <Card>
          <CardHeader className="pb-4">
            <Select value={targetLanguage} onValueChange={(value: "en" | "cy") => setTargetLanguage(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="cy">Welsh</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="min-h-32 p-3 border rounded-md bg-gray-50">
              {translationResult ? (
                <div className="space-y-3">
                  <div className="text-lg font-medium">{translationResult.translatedText}</div>
                  {translationResult.pronunciation && (
                    <div className="text-sm text-gray-600 italic">{translationResult.pronunciation}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <AudioPlayer text={translationResult.translatedText} />
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(translationResult.translatedText)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSaveToHistory} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save to History
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Translation will appear here...</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Translation Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Dialect</label>
              <Select value={dialect} onValueChange={(value: "standard" | "north" | "south") => setDialect(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="north">North Welsh</SelectItem>
                  <SelectItem value="south">South Welsh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Formality</label>
              <Select
                value={formality}
                onValueChange={(value: "standard" | "formal" | "informal") => setFormality(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleTranslate} disabled={!sourceText.trim() || isTranslating} className="w-full">
                {isTranslating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Translating...
                  </>
                ) : (
                  "Translate"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Sentences */}
      {translationResult && translationResult.examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Example Sentences</CardTitle>
            <p className="text-sm text-gray-600">See how the translation is used in context</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {translationResult.examples.map((example, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-green-600 font-medium mb-1">{example.welsh}</div>
                      <div className="text-gray-600">{example.english}</div>
                    </div>
                    <AudioPlayer text={example.welsh} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
