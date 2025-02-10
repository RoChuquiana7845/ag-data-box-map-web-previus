"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Layers, Download, Calendar, PenTool } from "lucide-react"
import { DraggableCard } from "@/components/ui/draggable-card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LayerVisibility } from "@/lib/types/geospatial"

interface MapControlsProps {
  layerVisibility: LayerVisibility
  onLayerVisibilityChange: (visibility: LayerVisibility) => void
  satelliteOpacity: number
  onOpacityChange: (value: number) => void
  onExport: (format: "geojson" | "csv" | "pdf") => void
  onToggleGeometryEditor: () => void
  isEditingGeometry: boolean
}

export function MapControls({
  layerVisibility,
  onLayerVisibilityChange,
  satelliteOpacity,
  onOpacityChange,
  onExport,
  onToggleGeometryEditor,
  isEditingGeometry,
}: MapControlsProps) {
  return (
    <DraggableCard
      id="map-controls"
      title="Controles del Mapa"
      defaultPosition={{ x: 20, y: 80 }}
      className="w-[300px]"
    >
      <div className="p-4 space-y-4">
        <Tabs defaultValue="layers" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="layers">Capas</TabsTrigger>
            <TabsTrigger value="tools">Herramientas</TabsTrigger>
          </TabsList>

          <TabsContent value="layers" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Capas
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Áreas</label>
                  <Switch
                    checked={layerVisibility.areas}
                    onCheckedChange={(checked) => onLayerVisibilityChange({ ...layerVisibility, areas: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Sensores</label>
                  <Switch
                    checked={layerVisibility.sensors}
                    onCheckedChange={(checked) => onLayerVisibilityChange({ ...layerVisibility, sensors: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Imágenes Satelitales</label>
                  <Switch
                    checked={layerVisibility.satellite}
                    onCheckedChange={(checked) => onLayerVisibilityChange({ ...layerVisibility, satellite: checked })}
                  />
                </div>
              </div>
            </div>

            {layerVisibility.satellite && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Opacidad de Imagen
                </h3>
                <Slider
                  value={[satelliteOpacity]}
                  onValueChange={(value) => onOpacityChange(value[0])}
                  max={100}
                  step={1}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Edición
              </h3>
              <Button
                variant={isEditingGeometry ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={onToggleGeometryEditor}
              >
                <PenTool className="mr-2 h-4 w-4" />
                Editor de Geometría
                {isEditingGeometry && (
                  <Badge variant="secondary" className="ml-auto">
                    Activo
                  </Badge>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" onClick={() => onExport("geojson")}>
                  GeoJSON
                </Button>
                <Button size="sm" variant="outline" onClick={() => onExport("csv")}>
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => onExport("pdf")}>
                  PDF
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DraggableCard>
  )
}

