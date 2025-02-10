"use client"

import * as React from "react"

interface DraggableCardContext {
  registerCard: (id: string) => number
  unregisterCard: (id: string) => void
  minimizedCards: Set<string>
  addMinimizedCard: (id: string) => void
  removeMinimizedCard: (id: string) => void
}

const DraggableCardContext = React.createContext<DraggableCardContext | null>(null)

export function DraggableCardProvider({ children }: { children: React.ReactNode }) {
  const [cards] = React.useState(new Map<string, number>())
  const [minimizedCards, setMinimizedCards] = React.useState(new Set<string>())
  const nextIndexRef = React.useRef(0)

  const registerCard = React.useCallback(
    (id: string) => {
      const index = nextIndexRef.current++
      cards.set(id, index)
      return index
    },
    [cards],
  )

  const unregisterCard = React.useCallback(
    (id: string) => {
      cards.delete(id)
    },
    [cards],
  )

  const addMinimizedCard = React.useCallback((id: string) => {
    setMinimizedCards((prev) => new Set(prev).add(id))
  }, [])

  const removeMinimizedCard = React.useCallback((id: string) => {
    setMinimizedCards((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const value = React.useMemo(
    () => ({
      registerCard,
      unregisterCard,
      minimizedCards,
      addMinimizedCard,
      removeMinimizedCard,
    }),
    [registerCard, unregisterCard, minimizedCards, addMinimizedCard, removeMinimizedCard],
  )

  return <DraggableCardContext.Provider value={value}>{children}</DraggableCardContext.Provider>
}

export function useDraggableCard() {
  const context = React.useContext(DraggableCardContext)
  if (!context) {
    throw new Error("useDraggableCard must be used within a DraggableCardProvider")
  }
  return context
}

