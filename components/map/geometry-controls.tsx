"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Square, Trash2, Check, X, Save, Palette } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DraggableCard } from "@/components/ui/draggable-card"
import { updateGeometry } from "@/lib/services/geometries"
import { GeometryStyleForm } from "@/components/geometries/geometry-style-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { AreaGeometry, GeometryStyle } from "@/lib/types/geometry"
import type * as GeoJSON from "geojson"

const DEFAULT_STYLE: GeometryStyle = {
  fillColor: "#3b82f6",
  strokeColor: "#2563eb",
  fillOpacity: 0.2,
  strokeWidth: 2,
}

interface GeometryControlsProps {
  selectedArea?: AreaGeometry | null
  onStartDrawing: () => void
  onCancelDrawing: () => void
  onSaveGeometry: (geometry: GeoJSON.Polygon, style: GeometryStyle) => void
  isDrawing: boolean
  currentGeometry?: GeoJSON.Polygon | null
  onDeleteGeometry?: () => void
  onStyleChange?: (style: GeometryStyle) => void
}

export function GeometryControls({
  selectedArea,
  onStartDrawing,
  onCancelDrawing,
  onSaveGeometry,
  isDrawing,
  currentGeometry,
  onDeleteGeometry,
  onStyleChange,
}: GeometryControlsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [style, setStyle] = useState<GeometryStyle>(selectedArea?.style || DEFAULT_STYLE)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!selectedArea || !currentGeometry) return

    try {
      setIsSaving(true)
      const updated = await updateGeometry(selectedArea.areaId, {
        geom: currentGeometry,
        style,
      })

      if (updated) {
        onSaveGeometry(currentGeometry, style)
        toast({
          title: "Geometría actualizada",
          description: "La geometría del área ha sido actualizada correctamente.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la geometría del área.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedArea || !onDeleteGeometry) return

    try {
      setIsSaving(true)
      await updateGeometry(selectedArea.areaId, null)
      onDeleteGeometry()
      toast({
        title: "Geometría eliminada",
        description: "La geometría del área ha sido eliminada correctamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la geometría del área.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleStyleChange = (newStyle: GeometryStyle) => {
    setStyle(newStyle)
    onStyleChange?.(newStyle)
  }

  return (
    <DraggableCard
      id="geometry-controls"
      title="Editor de Geometría"
      defaultPosition={{ x: window.innerWidth - 340, y: 80 }}
      className="w-[300px]"
    >
      <CardContent className="p-4 space-y-4">
        {isDrawing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30">
                Dibujando polígono
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Haga clic en el mapa para agregar puntos. Para finalizar, cierre el polígono haciendo clic en el primer
              punto.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onCancelDrawing}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={!currentGeometry || isSaving}>
                {isSaving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Modo edición</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full" onClick={onStartDrawing}>
                <Square className="mr-2 h-4 w-4" />
                Dibujar
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full" disabled={!selectedArea}>
                    <Palette className="mr-2 h-4 w-4" />
                    Estilo
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Estilo de la geometría</SheetTitle>
                    <SheetDescription>Personaliza el aspecto visual de la geometría</SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">
                    <GeometryStyleForm value={style} onChange={handleStyleChange} />
                  </div>
                </SheetContent>
              </Sheet>
              <Button
                variant="outline"
                className="w-full col-span-2 text-destructive hover:text-destructive"
                disabled={!selectedArea || !currentGeometry}
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </DraggableCard>
  )
}

