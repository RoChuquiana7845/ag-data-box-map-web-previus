"use client"

import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface NaturalViewerProps {
  imageUrl: string | null
  date: string | null
  source: string | null
  isLoading: boolean
  error: string | null
  onRefresh?: () => void
}

export default function NaturalViewer({ imageUrl, date, source, isLoading, error, onRefresh }: NaturalViewerProps) {
  const [imageError, setImageError] = useState(false)

  if (isLoading) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Cargando Vista Natural</h3>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Card>
    )
  }

  if (error || imageError) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-red-500">Error al cargar la vista natural</h3>
        <p className="text-sm text-gray-500 mb-4">{error || "Error al cargar la imagen"}</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" size="sm">
            Intentar nuevamente
          </Button>
        )}
      </Card>
    )
  }

  if (!imageUrl) {
    return null
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Vista Natural del Campo</h3>
      <div className="space-y-2">
        {date && <p className="text-sm text-gray-500">Fecha: {new Date(date).toLocaleDateString()}</p>}
        {source && <p className="text-sm text-gray-500">Fuente: {source}</p>}
      </div>
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mt-4">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Vista Natural"
          className="w-full h-full object-contain"
          onError={(e) => {
            console.error("Error loading natural view image")
            setImageError(true)
          }}
        />
      </div>
    </Card>
  )
}

