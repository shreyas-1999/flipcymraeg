"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, Loader2 } from "lucide-react"
import { ttsService } from "@/lib/text-to-speech"

interface AudioPlayerProps {
  text: string
  className?: string
}

export function AudioPlayer({ text, className }: AudioPlayerProps) {
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
          <Loader2 className="h-4 w-4 animate-spin" />
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
