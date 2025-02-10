"use client"

import { useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"

interface TypewriterEffectProps {
  text: string
  className?: string
  delay?: number
  speed?: number
}

export function TypewriterEffect({ text, className = "", delay = 0, speed = 0.05 }: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState("")
  const controls = useAnimation()

  useEffect(() => {
    let currentText = ""
    let currentIndex = 0

    const typeNextCharacter = () => {
      if (currentIndex < text.length) {
        currentText += text[currentIndex]
        setDisplayedText(currentText)
        currentIndex++
        setTimeout(typeNextCharacter, speed * 1000)
      }
    }

    setTimeout(() => {
      typeNextCharacter()
      controls.start({ opacity: 1 })
    }, delay * 1000)

    return () => {
      setDisplayedText("")
    }
  }, [text, delay, speed, controls])

  return (
    <motion.span initial={{ opacity: 0 }} animate={controls} className={className}>
      {displayedText}
    </motion.span>
  )
}

