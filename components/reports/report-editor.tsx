"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import Document from "@tiptap/extension-document"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import { useCallback, useEffect } from "react"
import { EditorProvider } from "./editor-context"
import { ReportToolbar } from "./report-toolbar"

interface ReportEditorProps {
  content: string
  onChange: (content: string) => void
}

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      draggable: {
        default: true,
      },
      position: {
        default: null,
        parseHTML: (element) => element.dataset.position,
        renderHTML: (attributes) => {
          if (!attributes.position) {
            return {}
          }
          return {
            "data-position": attributes.position,
          }
        },
      },
    }
  },
  addNodeView() {
    return ({ node, HTMLAttributes, getPos }) => {
      const container = document.createElement("div")
      container.classList.add("report-image-container")

      const wrapper = document.createElement("div")
      wrapper.classList.add("report-image-wrapper")

      const img = document.createElement("img")
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (key !== "draggable" && key !== "position") {
          img.setAttribute(key, value)
        }
      })

      let isDragging = false
      let startX: number, startY: number
      let initialPosition: { left: number; top: number }

      const updateImagePosition = (left: number, top: number) => {
        wrapper.style.transform = `translate(${left}px, ${top}px)`
        wrapper.dataset.x = left.toString()
        wrapper.dataset.y = top.toString()
      }

      const handleMouseDown = (e: MouseEvent) => {
        if (e.target === img) {
          isDragging = true
          startX = e.clientX
          startY = e.clientY

          const rect = wrapper.getBoundingClientRect()
          const x = Number.parseFloat(wrapper.dataset.x || "0")
          const y = Number.parseFloat(wrapper.dataset.y || "0")

          initialPosition = {
            left: x,
            top: y,
          }

          wrapper.style.cursor = "move"
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return

        const deltaX = e.clientX - startX
        const deltaY = e.clientY - startY

        const newLeft = initialPosition.left + deltaX
        const newTop = initialPosition.top + deltaY

        updateImagePosition(newLeft, newTop)
      }

      const handleMouseUp = () => {
        if (isDragging) {
          isDragging = false
          wrapper.style.cursor = "default"

          // Store the final position
          const x = Number.parseFloat(wrapper.dataset.x || "0")
          const y = Number.parseFloat(wrapper.dataset.y || "0")

          if (typeof getPos === "function") {
            const pos = getPos()
            // Update the node's position attribute if needed
          }
        }
      }

      wrapper.addEventListener("mousedown", handleMouseDown)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      wrapper.appendChild(img)
      container.appendChild(wrapper)

      return {
        dom: container,
        destroy: () => {
          document.removeEventListener("mousemove", handleMouseMove)
          document.removeEventListener("mouseup", handleMouseUp)
        },
      }
    }
  },
  parseHTML() {
    return [
      {
        tag: 'div[class="report-image-container"]',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", { class: "report-image-container" }, ["img", HTMLAttributes]]
  },
})

export function ReportEditor({ content, onChange }: ReportEditorProps) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      StarterKit.configure({
        document: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: "report-image",
        },
        allowBase64: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[calc(100vh-16rem)]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const addImage = useCallback(
    (url: string, alt?: string) => {
      if (editor) {
        // Insert a new paragraph before the image if there isn't one
        if (!editor.state.selection.$from.nodeBefore?.type.name === "paragraph") {
          editor.chain().focus().insertContent("<p></p>").run()
        }

        // Insert the image
        editor
          .chain()
          .focus()
          .setImage({ src: url, alt: alt || "" })
          .run()

        // Insert a new paragraph after the image if there isn't one
        if (!editor.state.selection.$from.nodeAfter?.type.name === "paragraph") {
          editor.chain().focus().insertContent("<p></p>").run()
        }
      }
    },
    [editor],
  )

  if (!editor) {
    return null
  }

  return (
    <EditorProvider value={editor}>
      <div className="flex flex-col flex-1">
        <ReportToolbar />
        <div className="flex-1 overflow-auto bg-background">
          <div className="max-w-[850px] min-h-full mx-auto p-12 bg-white shadow-sm">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </EditorProvider>
  )
}

