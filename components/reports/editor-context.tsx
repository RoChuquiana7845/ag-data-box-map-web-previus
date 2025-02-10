"use client"

import { createContext, useContext } from "react"
import type { Editor } from "@tiptap/react"

const EditorContext = createContext<Editor | null>(null)

export const EditorProvider = EditorContext.Provider

export function useEditor() {
  const editor = useContext(EditorContext)
  if (editor === undefined) {
    throw new Error("useEditor must be used within an EditorProvider")
  }
  return editor
}

