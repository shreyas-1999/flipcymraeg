interface GeminiTranslationResponse {
  welsh: string
  pronunciation: string
  examples: {
    welsh: string
    english: string
  }[]
}

export class GeminiService {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

  constructor() {
    this.apiKey = "AIzaSyD7vLEopz_DibqtrGGX6snnz32DrT3iSkk"
  }

  async translateToWelsh(englishWord: string, category: string): Promise<GeminiTranslationResponse> {
    const prompt = `
You are a Welsh language expert. Please translate the English word "${englishWord}" to Welsh and provide the following information in JSON format:

{
  "welsh": "Welsh translation of the word",
  "pronunciation": "Phonetic pronunciation guide (like BOH-reh dah)",
  "examples": [
    {
      "welsh": "Welsh sentence using the word in context",
      "english": "English translation of the Welsh sentence"
    },
    {
      "welsh": "Another Welsh sentence using the word",
      "english": "English translation of this sentence"
    },
    {
      "welsh": "Third Welsh sentence using the word",
      "english": "English translation of this sentence"
    }
  ]
}

The word belongs to the category: ${category}

Please ensure:
1. The Welsh translation is accurate and commonly used
2. The pronunciation guide uses simple phonetic spelling that English speakers can understand
3. The example sentences are practical and show different uses of the word
4. All Welsh text uses proper Welsh spelling and grammar
5. Return ONLY the JSON object, no additional text

Word to translate: "${englishWord}"
Category: "${category}"
`

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Gemini API Error:", errorText)
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const generatedText = data.candidates[0].content.parts[0].text

      // Clean up the response and parse JSON
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim()

      try {
        const parsedResponse = JSON.parse(cleanedText)
        return parsedResponse
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", cleanedText)
        throw new Error("Failed to parse translation response")
      }
    } catch (error) {
      console.error("Gemini translation error:", error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
