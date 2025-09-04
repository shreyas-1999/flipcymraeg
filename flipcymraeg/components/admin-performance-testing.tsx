"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Play, Clock, CheckCircle, XCircle, Zap, Network, Database, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { vocabularyService } from "@/lib/vocabulary-service"

interface TestResult {
  id: string
  timestamp: number
  type: "flashcard" | "deck"
  success: boolean
  data: any
  error?: string
}

export default function AdminPerformanceTesting() {
  // Single Flashcard Test State
  const [flashcardWord, setFlashcardWord] = useState("")
  const [flashcardCategory, setFlashcardCategory] = useState("")
  const [isTestingFlashcard, setIsTestingFlashcard] = useState(false)
  const [flashcardResults, setFlashcardResults] = useState<TestResult[]>([])

  // Deck Test State
  const [deckCategory, setDeckCategory] = useState("")
  const [deckDescription, setDeckDescription] = useState("")
  const [deckCardCount, setDeckCardCount] = useState(5)
  const [isTestingDeck, setIsTestingDeck] = useState(false)
  const [deckResults, setDeckResults] = useState<TestResult[]>([])

  const categories = vocabularyService.getCategories()

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const testSingleFlashcard = async () => {
    if (!flashcardWord.trim() || !flashcardCategory) return

    setIsTestingFlashcard(true)

    try {
      const startTime = Date.now()
      const result = await apiClient.testFlashcardPerformance({
        englishWord: flashcardWord.trim(),
        category: flashcardCategory,
      })
      const endTime = Date.now()

      const testResult: TestResult = {
        id: `flashcard-${Date.now()}`,
        timestamp: Date.now(),
        type: "flashcard",
        success: true,
        data: {
          ...result,
          clientTime: endTime - startTime,
        },
      }

      setFlashcardResults((prev) => [testResult, ...prev.slice(0, 9)])
    } catch (error: any) {
      const testResult: TestResult = {
        id: `flashcard-${Date.now()}`,
        timestamp: Date.now(),
        type: "flashcard",
        success: false,
        data: null,
        error: error.message,
      }

      setFlashcardResults((prev) => [testResult, ...prev.slice(0, 9)])
    } finally {
      setIsTestingFlashcard(false)
    }
  }

  const testDeckGeneration = async () => {
    if (!deckCategory || deckCardCount < 1 || deckCardCount > 20) return

    setIsTestingDeck(true)

    try {
      const startTime = Date.now()
      const result = await apiClient.testDeckPerformance({
        category: deckCategory,
        description: deckDescription.trim() || undefined,
        numberOfCards: deckCardCount,
      })
      const endTime = Date.now()

      const testResult: TestResult = {
        id: `deck-${Date.now()}`,
        timestamp: Date.now(),
        type: "deck",
        success: true,
        data: {
          ...result,
          clientTime: endTime - startTime,
        },
      }

      setDeckResults((prev) => [testResult, ...prev.slice(0, 9)])
    } catch (error: any) {
      const testResult: TestResult = {
        id: `deck-${Date.now()}`,
        timestamp: Date.now(),
        type: "deck",
        success: false,
        data: null,
        error: error.message,
      }

      setDeckResults((prev) => [testResult, ...prev.slice(0, 9)])
    } finally {
      setIsTestingDeck(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Testing</h2>
        <p className="text-gray-600">Test and measure the performance of flashcard and deck generation functions</p>
      </div>

      {/* Single Flashcard Performance Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Single Flashcard Performance Test
          </CardTitle>
          <CardDescription>Test the performance of generating a single custom flashcard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flashcard-word">English Word</Label>
              <Input
                id="flashcard-word"
                value={flashcardWord}
                onChange={(e) => setFlashcardWord(e.target.value)}
                placeholder="e.g., house, happy, run"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={flashcardCategory} onValueChange={setFlashcardCategory}>
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
          </div>

          <Button
            onClick={testSingleFlashcard}
            disabled={isTestingFlashcard || !flashcardWord.trim() || !flashcardCategory}
            className="w-full"
          >
            {isTestingFlashcard ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Performance...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Flashcard Test
              </>
            )}
          </Button>

          {/* Flashcard Test Results */}
          {flashcardResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Recent Test Results</h4>
              {flashcardResults.map((result) => (
                <Card key={result.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>

                  {result.success && result.data ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">Total Time</div>
                          <div className="text-gray-600">
                            {formatTime(result.data.performance?.totalTime || result.data.clientTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">Network Time</div>
                          <div className="text-gray-600">{formatTime(result.data.performance?.networkTime || 0)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="font-medium">Processing Time</div>
                          <div className="text-gray-600">
                            {formatTime(result.data.performance?.processingTime || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-600" />
                        <div>
                          <div className="font-medium">Response Size</div>
                          <div className="text-gray-600">{formatBytes(result.data.performance?.responseSize || 0)}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>{result.error}</div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deck Generation Performance Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            Deck Generation Performance Test
          </CardTitle>
          <CardDescription>Test the performance of generating multiple flashcards as a deck</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={deckCategory} onValueChange={setDeckCategory}>
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
              <Label htmlFor="card-count">Number of Cards (1-20)</Label>
              <Input
                id="card-count"
                type="number"
                min="1"
                max="20"
                value={deckCardCount}
                onChange={(e) => setDeckCardCount(Number.parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deck-description">Description (Optional)</Label>
            <Textarea
              id="deck-description"
              value={deckDescription}
              onChange={(e) => setDeckDescription(e.target.value)}
              placeholder="Optional description for the deck"
              rows={2}
            />
          </div>

          <Button
            onClick={testDeckGeneration}
            disabled={isTestingDeck || !deckCategory || deckCardCount < 1 || deckCardCount > 20}
            className="w-full"
          >
            {isTestingDeck ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Deck Generation...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Deck Test ({deckCardCount} cards)
              </>
            )}
          </Button>

          {/* Deck Test Results */}
          {deckResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Recent Deck Test Results</h4>
              {deckResults.map((result) => (
                <Card key={result.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>

                  {result.success && result.data ? (
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium">Total Time</div>
                            <div className="text-gray-600">
                              {formatTime(result.data.performance?.totalTime || result.data.clientTime)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium">Avg Per Card</div>
                            <div className="text-gray-600">
                              {formatTime(result.data.performance?.averageCardTime || 0)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium">Success Rate</div>
                            <div className="text-gray-600">
                              {((result.data.performance?.successRate || 0) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="font-medium">Total Size</div>
                            <div className="text-gray-600">
                              {formatBytes(result.data.performance?.totalResponseSize || 0)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Stats */}
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          Cards: {result.data.performance?.successfulCards || 0} successful,{" "}
                          {result.data.performance?.failedCards || 0} failed
                        </div>
                        <div>Average Network Time: {formatTime(result.data.performance?.averageNetworkTime || 0)}</div>
                        <div>
                          Average Response Size: {formatBytes(result.data.performance?.averageResponseSize || 0)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>{result.error}</div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
