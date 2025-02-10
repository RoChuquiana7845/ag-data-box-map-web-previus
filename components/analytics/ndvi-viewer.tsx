"use client"

import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface NDVIViewerProps {
  imageUrl: string | null
  isLoading: boolean
  error: string | null
  onRefresh?: () => void
}

export default function NDVIViewer({ imageUrl, isLoading, error, onRefresh }: NDVIViewerProps) {
  const [imageError, setImageError] = useState(false)

  if (isLoading) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Cargando NDVI</h3>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Card>
    )
  }

  if (error || imageError) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-red-500">Error al cargar NDVI</h3>
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
      <h3 className="font-semibold mb-4">Visualización NDVI</h3>
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="NDVI"
          className="w-full h-full object-contain"
          onError={(e) => {
            console.error("Error loading NDVI image")
            setImageError(true)
          }}
        />
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Leyenda NDVI</h4>
        <div className="flex items-center gap-2">
          <div className="w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded" />
          <div className="flex justify-between w-full text-xs text-gray-500">
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Rojo: Vegetación escasa o nula | Amarillo: Vegetación moderada | Verde: Vegetación densa y saludable
        </p>
      </div>
    </Card>
  )
}

