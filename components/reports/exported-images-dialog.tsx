"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export interface ExportedImage {
  id: string
  url: string
  type: "ndvi" | "hillshade" | "slope" | "natural"
  date: string
  analysisId: string
  analysisName: string
  parameters?: Record<string, any>
}

interface ExportedImagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: ExportedImage[]
  onInsertImage: (image: ExportedImage) => void
}

export function ExportedImagesDialog({ open, onOpenChange, images, onInsertImage }: ExportedImagesDialogProps) {
  const [selectedImage, setSelectedImage] = useState<ExportedImage | null>(null)
  const { toast } = useToast()

  const handleDownload = async (image: ExportedImage) => {
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${image.type}-${image.date}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Imagen descargada",
        description: "La imagen se ha descargado correctamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar la imagen.",
      })
    }
  }

  const handleInsert = (image: ExportedImage) => {
    onInsertImage(image)
    onOpenChange(false)
    toast({
      title: "Imagen insertada",
      description: "La imagen se ha insertado en el reporte.",
    })
  }

  const getTypeLabel = (type: ExportedImage["type"]) => {
    switch (type) {
      case "ndvi":
        return "NDVI"
      case "hillshade":
        return "Sombreado"
      case "slope":
        return "Pendiente"
      case "natural":
        return "Natural"
      default:
        return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Imágenes Exportadas</DialogTitle>
          <DialogDescription>Visualice y descargue las imágenes exportadas de los análisis</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{image.analysisName}</h3>
                    <Badge variant="outline">{getTypeLabel(image.type)}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(image.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={`${image.type} visualization`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleDownload(image)}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleInsert(image)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Insertar
                    </Button>
                  </div>
                </div>

                {image.parameters && (
                  <div className="text-sm space-y-1">
                    <h4 className="font-medium">Parámetros:</h4>
                    {Object.entries(image.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-muted-foreground">
                        <span>{key}:</span>
                        <span>{typeof value === "number" ? value.toFixed(2) : value.toString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

