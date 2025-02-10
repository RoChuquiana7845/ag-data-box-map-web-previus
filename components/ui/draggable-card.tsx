"use client"

import * as React from "react"
import { motion, useDragControls, AnimatePresence } from "framer-motion"
import { Minus, Maximize2, GripVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Context definition
interface DraggableCardContext {
  registerCard: (id: string) => number
  unregisterCard: (id: string) => void
  minimizedCards: Set<string>
  addMinimizedCard: (id: string) => void
  removeMinimizedCard: (id: string) => void
}

const DraggableCardContext = React.createContext<DraggableCardContext | null>(null)

// Provider Component
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

// Hook
function useDraggableCard() {
  const context = React.useContext(DraggableCardContext)
  if (!context) {
    throw new Error("useDraggableCard must be used within a DraggableCardProvider")
  }
  return context
}

// DraggableCard Props
interface DraggableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  defaultPosition?: { x: number; y: number }
  children: React.ReactNode
  id: string
}

const CARD_HEIGHT = 48 // Altura de la tarjeta minimizada
const EDGE_MARGIN = 25 // Margen desde los bordes
const STACK_SPACING = 30 // Espacio entre tarjetas minimizadas

// DraggableCard Component
export const DraggableCard = React.forwardRef<HTMLDivElement, DraggableCardProps>(
  ({ title, defaultPosition = { x: 0, y: 0 }, className, children, id, ...props }, ref) => {
    const [isMinimized, setIsMinimized] = React.useState(false)
    const [isDragging, setIsDragging] = React.useState(false)
    const controls = useDragControls()
    const containerRef = React.useRef<HTMLDivElement>(null)
    const { registerCard, unregisterCard, minimizedCards, addMinimizedCard, removeMinimizedCard } = useDraggableCard()
    const cardIndex = React.useRef(registerCard(id))

    React.useEffect(() => {
      return () => unregisterCard(id)
    }, [id, unregisterCard])

    React.useEffect(() => {
      if (isMinimized) {
        addMinimizedCard(id)
      } else {
        removeMinimizedCard(id)
      }
    }, [id, isMinimized, addMinimizedCard, removeMinimizedCard])

    const getMinimizedPosition = () => {
      if (!containerRef.current) return { x: EDGE_MARGIN, y: EDGE_MARGIN }
      const container = containerRef.current
      const { height } = container.getBoundingClientRect()

      // Calcular posición en la pila (desde abajo hacia arriba)
      const stackPosition = Array.from(minimizedCards).indexOf(id)
      const stackOffset = stackPosition * (CARD_HEIGHT + STACK_SPACING)

      return {
        x: EDGE_MARGIN,
        y: height - (CARD_HEIGHT + EDGE_MARGIN + stackOffset),
      }
    }

    return (
      <div ref={containerRef} className="absolute inset-0 pointer-events-none">
        <motion.div
          drag
          dragControls={controls}
          dragMomentum={false}
          dragConstraints={containerRef}
          dragElastic={0}
          initial={{ x: defaultPosition.x, y: defaultPosition.y }}
          animate={isMinimized ? getMinimizedPosition() : undefined}
          transition={{ type: "spring", damping: 20 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className={cn(
            "absolute pointer-events-auto",
            isDragging ? "z-[1000]" : `z-[${100 + cardIndex.current}]`,
            className,
          )}
          {...props}
        >
          <Card
            ref={ref}
            className={cn(
              "backdrop-blur-sm shadow-lg transition-all duration-200",
              isDragging && "shadow-xl ring-2 ring-primary",
              isMinimized ? "w-[300px]" : "",
            )}
          >
            <div
              className="flex items-center justify-between p-4 border-b bg-background/80 cursor-move"
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                controls.start(e)
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{title}</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMinimized(!isMinimized)
                  }}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    )
  },
)
DraggableCard.displayName = "DraggableCard"

