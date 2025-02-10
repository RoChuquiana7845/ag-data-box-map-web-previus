"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { getTerrainImage, getPointElevation } from "@/lib/services/terrain-service"
import { calculatePolygonCenter } from "@/lib/utils/coordinates"
import { FIELD_COORDINATES } from "@/lib/utils/coordinates"

export default function TerrainAnalysis() {
  const [activeTab, setActiveTab] = useState("hillshade")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hillshadeImage, setHillshadeImage] = useState<string | null>(null)
  const [slopeImage, setSlopeImage] = useState<string | null>(null)
  const [elevation, setElevation] = useState<number | null>(null)
  const [sunPosition, setSunPosition] = useState({
    azimuth: 315,
    altitude: 45,
  })
  const [localSunPosition, setLocalSunPosition] = useState(sunPosition)

  const center = calculatePolygonCenter(FIELD_COORDINATES.polygon)
  const zoom = 15
  // Reemplazar el cálculo existente de x, y con:
  const tileCoords = {
    zoom: 15,
    x: Math.floor(((center.lng + 180) / 360) * Math.pow(2, 15)),
    y: Math.floor(
      ((1 - Math.log(Math.tan((center.lat * Math.PI) / 180) + 1 / Math.cos((center.lat * Math.PI) / 180)) / Math.PI) /
        2) *
        Math.pow(2, 15),
    ),
  }

  useEffect(() => {
    const loadTerrainData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Iniciando carga de datos del terreno:", {
          center,
          tileCoords,
          sunPosition,
        })

        // Cargar elevación del centro del campo
        console.log("Solicitando elevación para:", { lat: center.lat, lng: center.lng })
        const elevation = await getPointElevation(center.lat, center.lng)
        console.log("Elevación recibida:", elevation)
        setElevation(elevation)

        // Cargar hillshade
        console.log("Solicitando hillshade")
        const hillshadeUrl = await getTerrainImage(tileCoords.zoom, tileCoords.x, tileCoords.y, {
          format: "hillshade",
          azimuth: sunPosition.azimuth,
          altitude: sunPosition.altitude,
        })
        setHillshadeImage(hillshadeUrl)

        // Cargar análisis de pendiente
        console.log("Solicitando análisis de pendiente")
        const slopeUrl = await getTerrainImage(tileCoords.zoom, tileCoords.x, tileCoords.y, {
          format: "slope",
          colormap: "Spectral",
          slopeRange: "0,70",
        })
        setSlopeImage(slopeUrl)
      } catch (error) {
        console.error("Error en loadTerrainData:", error)
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    loadTerrainData()
  }, [center.lat, center.lng, sunPosition.altitude, sunPosition.azimuth, tileCoords.x, tileCoords.y])

  useEffect(() => {
    setLocalSunPosition(sunPosition)
  }, [sunPosition])

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Card>
    )
  }

  // Reemplazar el bloque de error existente con:
  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500 space-y-2">
          <h3 className="font-semibold">Error en el análisis del terreno</h3>
          <p>{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Análisis del Terreno</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Elevación en el centro del campo:{" "}
          {elevation ? `${elevation.toFixed(1)} metros sobre el nivel del mar` : "Cargando..."}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="hillshade">Sombreado del Terreno</TabsTrigger>
          <TabsTrigger value="slope">Análisis de Pendiente</TabsTrigger>
        </TabsList>

        <TabsContent value="hillshade">
          {hillshadeImage && (
            <>
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label>Azimuth (Dirección del Sol): {localSunPosition.azimuth}°</Label>
                  <Slider
                    value={[localSunPosition.azimuth]}
                    min={0}
                    max={360}
                    step={15}
                    onValueChange={(value) => setLocalSunPosition((prev) => ({ ...prev, azimuth: value[0] }))}
                    onValueCommit={(value) => setSunPosition((prev) => ({ ...prev, azimuth: value[0] }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altitud Solar: {localSunPosition.altitude}°</Label>
                  <Slider
                    value={[localSunPosition.altitude]}
                    min={0}
                    max={90}
                    step={5}
                    onValueChange={(value) => setLocalSunPosition((prev) => ({ ...prev, altitude: value[0] }))}
                    onValueCommit={(value) => setSunPosition((prev) => ({ ...prev, altitude: value[0] }))}
                  />
                </div>
              </div>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={hillshadeImage || "/placeholder.svg"}
                  alt="Sombreado del terreno"
                  className="w-full h-full object-cover"
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="slope">
          {slopeImage && (
            <>
              <div className="mb-4 space-y-2">
                <div className="w-full h-4 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded" />
                <div className="flex justify-between w-full text-xs text-gray-500">
                  <span>0°</span>
                  <span>35°</span>
                  <span>70°</span>
                </div>
                <p className="text-xs text-gray-500">
                  Azul: Terreno plano | Amarillo: Pendiente moderada | Rojo: Pendiente pronunciada
                </p>
              </div>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={slopeImage || "/placeholder.svg"}
                  alt="Análisis de pendiente"
                  className="w-full h-full object-cover"
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}

