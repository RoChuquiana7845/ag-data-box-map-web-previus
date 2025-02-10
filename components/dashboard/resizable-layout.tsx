"use client"

import { useState, useCallback, type ReactNode } from "react"

interface ResizableLayoutProps {
  sidebar: ReactNode
  content: ReactNode
  defaultSidebarWidth?: number
  minSidebarWidth?: number
  maxSidebarWidth?: number
}

export function ResizableLayout({
  sidebar,
  content,
  defaultSidebarWidth = 280,
  minSidebarWidth = 200,
  maxSidebarWidth = 500,
}: ResizableLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback(() => {
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX
        if (newWidth >= minSidebarWidth && newWidth <= maxSidebarWidth) {
          setSidebarWidth(newWidth)
        }
      }
    },
    [isResizing, minSidebarWidth, maxSidebarWidth],
  )

  return (
    <div
      className="flex h-[calc(100vh-4rem)] overflow-hidden"
      onMouseMove={(e) => resize(e as unknown as MouseEvent)}
      onMouseUp={stopResizing}
      onMouseLeave={stopResizing}
    >
      <div className="relative shrink-0 border-r bg-background w-[60px]">{sidebar}</div>
      <main className="flex-1 overflow-auto">{content}</main>
    </div>
  )
}

