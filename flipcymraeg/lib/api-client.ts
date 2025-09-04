const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface TTSRequest {
  text: string
  languageCode?: string
  speed?: number
}

interface TTSResponse {
  audioContent: string
}

interface TranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  dialect?: string
  formality?: string
}

interface TranslationResponse {
  translatedText: string
  pronunciation?: string
  examples: Array<{
    welsh: string
    english: string
  }>
}

interface GeminiTranslationRequest {
  englishWord: string
  category: string
}

interface GeminiTranslationResponse {
  welsh: string
  pronunciation: string
  examples: Array<{
    welsh: string
    english: string
  }>
}

interface PronunciationRequest {
  targetWord: string
  audioData: string
}

interface PronunciationResponse {
  transcription: string
  accuracy: "perfect" | "close" | "incorrect"
  feedback: string
}

interface PerformanceTestRequest {
  englishWord: string
  category: string
}

interface PerformanceTestResponse {
  welsh: string
  pronunciation: string
  examples: Array<{
    welsh: string
    english: string
  }>
  performance: {
    totalTime: number
    networkTime: number
    processingTime: number
    responseSize: number
    statusCode: number
    timestamp: number
  }
}

interface DeckTestRequest {
  category: string
  description?: string
  numberOfCards: number
}

interface DeckTestResponse {
  cards: Array<{
    english: string
    welsh: string
    pronunciation: string
    category: string
    difficulty: string
    examples: Array<{
      welsh: string
      english: string
    }>
    performance: any
  }>
  performance: {
    totalTime: number
    averageCardTime: number
    averageNetworkTime: number
    successfulCards: number
    failedCards: number
    totalCards: number
    successRate: number
    totalResponseSize: number
    averageResponseSize: number
    cardPerformances: Array<any>
    timestamp: number
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      console.log(`Making request to: ${url}`)

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      console.log(`Response status: ${response.status}`)
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

      // Get the response text first to handle parsing errors better
      const responseText = await response.text()
      console.log(`Response text (first 500 chars):`, responseText.substring(0, 500))

      if (!response.ok) {
        // Try to parse as JSON for error details, but handle cases where it's not JSON
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch (parseError) {
          console.error("Failed to parse error response as JSON:", parseError)
          // If it's HTML (common for server errors), extract a meaningful message
          if (responseText.includes("<html>") || responseText.includes("<!DOCTYPE")) {
            throw new Error(
              `Server error (${response.status}): The backend server may be down or returning HTML instead of JSON. Please check if the backend is running.`,
            )
          }
          throw new Error(`HTTP error! status: ${response.status}, response: ${responseText.substring(0, 200)}`)
        }

        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Parse the successful response
      if (!responseText.trim()) {
        throw new Error("Empty response received from server")
      }

      try {
        return JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse successful response as JSON:", parseError)
        console.error("Response text:", responseText)
        throw new Error(
          `Failed to parse translation response: Invalid JSON format. Server may be returning HTML instead of JSON. Please check if the backend is running correctly.`,
        )
      }
    } catch (error) {
      // Handle network errors (server not reachable)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Cannot connect to backend server at ${this.baseUrl}. Please ensure the backend is running and accessible.`,
        )
      }

      // Re-throw our custom errors
      throw error
    }
  }

  async synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
    return this.makeRequest<TTSResponse>("/api/tts/synthesize", {
      method: "POST",
      body: JSON.stringify({
        text: request.text,
        languageCode: request.languageCode || "cy-GB",
        speed: request.speed || 1.0,
      }),
    })
  }

  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    return this.makeRequest<TranslationResponse>("/api/translation/translate", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async translateToWelsh(request: GeminiTranslationRequest): Promise<GeminiTranslationResponse> {
    return this.makeRequest<GeminiTranslationResponse>("/api/gemini/translate-to-welsh", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async evaluatePronunciation(request: PronunciationRequest): Promise<PronunciationResponse> {
    return this.makeRequest<PronunciationResponse>("/api/pronunciation/evaluate", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // Performance testing methods
  async testFlashcardPerformance(request: PerformanceTestRequest): Promise<PerformanceTestResponse> {
    return this.makeRequest<PerformanceTestResponse>("/api/performance/test-flashcard", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async testDeckPerformance(request: DeckTestRequest): Promise<DeckTestResponse> {
    return this.makeRequest<DeckTestResponse>("/api/performance/test-deck", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }
}

export const apiClient = new ApiClient()
export type {
  TTSRequest,
  TTSResponse,
  TranslationRequest,
  TranslationResponse,
  GeminiTranslationRequest,
  GeminiTranslationResponse,
  PronunciationRequest,
  PronunciationResponse,
  PerformanceTestRequest,
  PerformanceTestResponse,
  DeckTestRequest,
  DeckTestResponse,
}
