"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"

interface Props {
  text: string
  lang?: string
}

export default function SimpleAudioPlayer({ text, lang = "cy-GB" }: Props) {
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    const handleEnd = () => setSpeaking(false)
    window.speechSynthesis.addEventListener("end", handleEnd)
    return () => window.speechSynthesis.removeEventListener("end", handleEnd)
  }, [])

  const speak = () => {
    if (speaking) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <Button size="icon" variant="ghost" disabled={speaking} onClick={speak} aria-label="Play pronunciation">
      <Volume2 className="size-4" />
    </Button>
  )
}
