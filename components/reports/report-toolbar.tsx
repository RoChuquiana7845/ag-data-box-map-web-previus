"use client"

import { useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useEditor } from "./editor-context"
import { ExportedImagesDialog } from "./exported-images-dialog"
import type { ExportedImage } from "./exported-images-dialog"

export function ReportToolbar() {
  const editor = useEditor()
  const [showImagesDialog, setShowImagesDialog] = useState(false)
  const [exportedImages, setExportedImages] = useState<ExportedImage[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("exportedImages") || "[]")
    }
    return []
  })

  if (!editor) {
    return null
  }

  const handleImageInsert = (image: ExportedImage) => {
    // Ensure there's a paragraph before the image
    if (!editor.state.selection.$from.nodeBefore?.type.name === "paragraph") {
      editor.chain().focus().insertContent("<p></p>").run()
    }

    // Insert the image
    editor.chain().focus().setImage({ src: image.url }).run()

    // Ensure there's a paragraph after the image
    if (!editor.state.selection.$from.nodeAfter?.type.name === "paragraph") {
      editor.chain().focus().insertContent("<p></p>").run()
    }
  }

  return (
    <>
      <div className="border-b p-2 flex items-center gap-1">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "left" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "center" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "right" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Button variant="outline" size="sm" onClick={() => setShowImagesDialog(true)}>
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <ExportedImagesDialog
        open={showImagesDialog}
        onOpenChange={setShowImagesDialog}
        images={exportedImages}
        onInsertImage={handleImageInsert}
      />
    </>
  )
}

