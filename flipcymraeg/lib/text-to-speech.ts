interface TTSRequest {
  text: string
  languageCode: string
  speed?: number
}

class TextToSpeechService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || ""
  }

  async synthesizeSpeech(request: TTSRequest): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Google TTS API key not configured")
    }

    const { text, languageCode, speed = 1.0 } = request

    try {
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            ssmlGender: "FEMALE",
          },
          audioConfig: {
            audioEncoding: "LINEAR16",
            sampleRateHertz: 24000,
            speakingRate: speed,
            pitch: 0,
            volumeGainDb: 0,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("TTS API error:", response.status, errorData)
        throw new Error(`TTS API error: ${response.status}`)
      }

      const data = await response.json()
      return data.audioContent
    } catch (error) {
      console.error("TTS synthesis failed:", error)
      throw error
    }
  }

  async playAudio(audioContent: string): Promise<void> {
    try {
      // Convert base64 to array buffer
      const binaryString = atob(audioContent)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Create audio context and decode
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer)

      // Play audio
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      source.start()

      // Return promise that resolves when audio finishes
      return new Promise((resolve) => {
        source.onended = () => resolve()
      })
    } catch (error) {
      console.error("Audio playback failed:", error)
      throw error
    }
  }
}

export const ttsService = new TextToSpeechService()
