import { GoogleGenerativeAI } from "@google/generative-ai"
import { collection, addDoc, query, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export interface TranslationRequest {
  text: string
  sourceLanguage: "en" | "cy"
  targetLanguage: "en" | "cy"
  dialect?: "standard" | "north" | "south"
  formality?: "standard" | "formal" | "informal"
}

export interface TranslationResponse {
  translatedText: string
  pronunciation?: string
  examples: Array<{
    welsh: string
    english: string
  }>
}

export interface TranslationHistory {
  id?: string
  sourceText: string
  translatedText: string
  sourceLanguage: "en" | "cy"
  targetLanguage: "en" | "cy"
  pronunciation?: string
  examples?: Array<{
    welsh: string
    english: string
  }>
  timestamp: Date
  userId: string
}

class TranslationService {
  private genAI: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("Gemini API key not found")
    }
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const dialectNote = this.getDialectNote(request.dialect)
    const formalityNote = this.getFormalityNote(request.formality)
    const sourceLanguageName = request.sourceLanguage === "en" ? "English" : "Welsh"
    const targetLanguageName = request.targetLanguage === "en" ? "English" : "Welsh"

    const prompt = `
Translate the following ${sourceLanguageName} text to ${targetLanguageName}:

"${request.text}"

${dialectNote}
${formalityNote}

Please provide your response in the following JSON format:
{
  "translatedText": "the translation",
  "pronunciation": "phonetic pronunciation guide (only if translating to Welsh)",
  "examples": [
    {
      "welsh": "example sentence in Welsh",
      "english": "example sentence in English"
    }
  ]
}

Provide 2-3 example sentences showing how the translated text would be used in context. Make sure the examples are natural and commonly used.
`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("Invalid response format from AI")
      }

      const translationData = JSON.parse(jsonMatch[0])

      return {
        translatedText: translationData.translatedText,
        pronunciation: translationData.pronunciation,
        examples: translationData.examples || [],
      }
    } catch (error) {
      console.error("Translation error:", error)
      throw new Error("Failed to translate text")
    }
  }

  private getDialectNote(dialect?: string): string {
    switch (dialect) {
      case "north":
        return "Use North Welsh dialect and vocabulary preferences."
      case "south":
        return "Use South Welsh dialect and vocabulary preferences."
      default:
        return "Use standard Welsh that would be understood across Wales."
    }
  }

  private getFormalityNote(formality?: string): string {
    switch (formality) {
      case "formal":
        return "Use formal language appropriate for official or academic contexts."
      case "informal":
        return "Use casual, everyday language that would be used in informal conversations."
      default:
        return "Use standard formality level appropriate for general communication."
    }
  }

  async saveToHistory(historyItem: Omit<TranslationHistory, "id">): Promise<void> {
    try {
      // Fix: Save to the correct path - users/{userId}/translationHistory
      const historyCollection = collection(db, "users", historyItem.userId, "translationHistory")
      await addDoc(historyCollection, {
        ...historyItem,
        timestamp: Timestamp.fromDate(historyItem.timestamp),
      })
    } catch (error) {
      console.error("Failed to save translation history:", error)
      throw error
    }
  }

  async getTranslationHistory(userId: string): Promise<TranslationHistory[]> {
    try {
      // Fix: Get from the correct path - users/{userId}/translationHistory
      const historyCollection = collection(db, "users", userId, "translationHistory")
      const q = query(historyCollection, orderBy("timestamp", "desc"))

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
        } as TranslationHistory
      })
    } catch (error) {
      console.error("Failed to load translation history:", error)
      return []
    }
  }
}

export const translationService = new TranslationService()
