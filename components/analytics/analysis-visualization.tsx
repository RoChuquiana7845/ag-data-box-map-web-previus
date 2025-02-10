"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Download, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ReactMapGL, { Source, Layer } from "react-map-gl@7.1.7"
import { FIELD_COORDINATES } from "@/lib/utils/coordinates"
import { calculatePolygonCenter } from "@/lib/utils/coordinates"
import { getTerrainImage, getPointElevation } from "@/lib/services/terrain-service"
import { getNDVIImage, getNaturalImage, searchSatelliteImages, type SatelliteImage } from "@/lib/services/eos-service"
import "mapbox-gl/dist/mapbox-gl.css"
import Logger from "@/lib/utils/logger"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { ExportedImage } from "@/components/reports/exported-images-dialog"

const getCurrentDateRange = () => {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  return {
    startDate: threeMonthsAgo.toISOString().split("T")[0],
    endDate: now.toISOString().split("T")[0],
  }
}

interface AnalysisVisualizationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysisId: string
  analysisType: "hillshade" | "slope" | "ndvi"
  parameters: Record<string, any>
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

function AnalysisLegend({ type }: { type: "hillshade" | "slope" | "ndvi" }) {
  if (type === "hillshade") {
    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Leyenda de Sombreado</h4>
        <div className="flex flex-col gap-2">
          <div className="w-full h-4 bg-gradient-to-r from-gray-900 via-gray-500 to-white rounded" />
          <div className="flex justify-between w-full text-xs text-gray-500">
            <span>Sombra</span>
            <span>Iluminación</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Oscuro: Áreas sombreadas | Claro: Áreas iluminadas por el sol</p>
      </div>
    )
  }

  if (type === "slope") {
    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Leyenda de Pendiente</h4>
        <div className="flex flex-col gap-2">
          <div className="w-full h-4 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded" />
          <div className="flex justify-between w-full text-xs text-gray-500">
            <span>0°</span>
            <span>35°</span>
            <span>70°</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Verde: Terreno plano | Amarillo: Pendiente moderada | Rojo: Pendiente pronunciada
        </p>
      </div>
    )
  }

  // NDVI legend
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Leyenda NDVI</h4>
      <div className="flex flex-col gap-2">
        <div className="w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded" />
        <div className="flex justify-between w-full text-xs text-gray-500">
          <span>-1.0</span>
          <span>0.0</span>
          <span>1.0</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Rojo: Sin vegetación | Amarillo: Vegetación moderada | Verde: Vegetación densa y saludable
      </p>
    </div>
  )
}

export function AnalysisVisualization({
  open,
  onOpenChange,
  analysisId,
  analysisType,
  parameters,
}: AnalysisVisualizationProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const center = calculatePolygonCenter(FIELD_COORDINATES.geom.coordinates[0])
  const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom: 15,
    pitch: 0,
    bearing: 0,
  })
  const [satelliteImages, setSatelliteImages] = useState<SatelliteImage[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [searchingImages, setSearchingImages] = useState(false)

  const [visualizationData, setVisualizationData] = useState<{
    imageUrl: string | null
    naturalImageUrl: string | null
    statistics: {
      min: number
      max: number
      mean: number
      std: number
    } | null
  }>({
    imageUrl: null,
    naturalImageUrl: null,
    statistics: null,
  })

  const [visualizationParams, setVisualizationParams] = useState(() => {
    switch (analysisType) {
      case "hillshade":
        return {
          azimuth: parameters.azimuth?.default || 315,
          altitude: parameters.altitude?.default || 45,
        }
      case "slope":
        return {
          slopeRange: parameters.slopeRange?.default || [0, 70],
        }
      case "ndvi":
        return {
          threshold: parameters.threshold?.default || 0.3,
        }
      default:
        return parameters
    }
  })

  const { toast } = useToast()
  const [mapReady, setMapReady] = useState(false)

  // Calcular coordenadas del tile
  const tileCoords = {
    zoom: 15,
    x: Math.floor(((center.lng + 180) / 360) * Math.pow(2, 15)),
    y: Math.floor(
      ((1 - Math.log(Math.tan((center.lat * Math.PI) / 180) + 1 / Math.cos((center.lat * Math.PI) / 180)) / Math.PI) /
        2) *
        Math.pow(2, 15),
    ),
  }

  const areaGeometry = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: FIELD_COORDINATES.style,
        geometry: FIELD_COORDINATES.geom,
      },
    ],
  }

  // Función para buscar imágenes de satélite
  const fetchSatelliteImages = async () => {
    try {
      setSearchingImages(true)
      const { startDate, endDate } = getCurrentDateRange()

      Logger.info("Searching satellite images", "AnalysisVisualization", {
        coordinates: FIELD_COORDINATES.geom.coordinates[0],
        startDate,
        endDate,
      })

      const response = await searchSatelliteImages(FIELD_COORDINATES.geom.coordinates[0], startDate, endDate)

      if (!response) {
        throw new Error("Respuesta de searchSatelliteImages no válida.")
      }

      Logger.debug("📡 Respuesta de searchSatelliteImages recibida", "AnalysisVisualization", { response })

      setSatelliteImages(response.results || [])

      if (response.results.length > 0) {
        setSelectedImageId(response.results[0].sceneID)
      }

      Logger.info("Satellite images found", "AnalysisVisualization", {
        count: response.results.length,
      })
    } catch (error) {
      Logger.error("Error fetching satellite images", "AnalysisVisualization", { error: error.message || error })
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron obtener las imágenes de satélite. Intente nuevamente más tarde.",
      })
    } finally {
      setSearchingImages(false)
    }
  }

  useEffect(() => {
    const loadVisualization = async () => {
      try {
        Logger.info(`Initializing ${analysisType} visualization`, "AnalysisVisualization", {
          analysisId,
          type: analysisType,
          parameters: visualizationParams,
          coordinates: {
            center: { lat: center.lat, lng: center.lng },
            tile: tileCoords,
          },
        })
        setLoading(true)
        setError(null)

        let imageUrl: string | null = null
        let statistics = {
          min: 0,
          max: 0,
          mean: 0,
          std: 0,
        }

        switch (analysisType) {
          case "hillshade":
            Logger.info("Processing hillshade analysis", "AnalysisVisualization", {
              endpoint: "/api/terrain",
              format: "hillshade",
              parameters: {
                azimuth: visualizationParams.azimuth || 315,
                altitude: visualizationParams.altitude || 45,
              },
            })
            imageUrl = await getTerrainImage(tileCoords.zoom, tileCoords.x, tileCoords.y, {
              format: "hillshade",
              azimuth: visualizationParams.azimuth || 315,
              altitude: visualizationParams.altitude || 45,
            })
            const elevation = await getPointElevation(center.lat, center.lng)
            statistics = {
              min: elevation - 50,
              max: elevation + 50,
              mean: elevation,
              std: 25,
            }
            break

          case "slope":
            Logger.info("Processing slope analysis", "AnalysisVisualization", {
              endpoint: "/api/terrain",
              format: "slope",
              parameters: {
                slopeRange: visualizationParams.slopeRange || [0, 70],
                colormap: "Spectral",
              },
            })
            imageUrl = await getTerrainImage(tileCoords.zoom, tileCoords.x, tileCoords.y, {
              format: "slope",
              colormap: "Spectral",
              slopeRange: visualizationParams.slopeRange
                ? `${visualizationParams.slopeRange[0]},${visualizationParams.slopeRange[1]}`
                : "0,70",
            })
            statistics = {
              min: 0,
              max: 70,
              mean: 35,
              std: 15,
            }
            break

          case "ndvi":
            if (!selectedImageId) {
              throw new Error("No se ha seleccionado una imagen de satélite")
            }

            Logger.info("Processing NDVI analysis", "AnalysisVisualization", {
              endpoint: `/api/satellite/ndvi/${selectedImageId}`,
              parameters: {
                threshold: visualizationParams.threshold || 0,
                clustering: "kmeans",
                clustersNo: 5,
                minArea: 2000,
              },
            })

            imageUrl = await getNDVIImage(selectedImageId, tileCoords.zoom, tileCoords.x, tileCoords.y, {
              calibrate: true,
              clustering: "kmeans",
              clustersNo: 5,
              minArea: 2000,
              threshold: visualizationParams.threshold || 0,
            })

            Logger.info("Fetching natural image for comparison", "AnalysisVisualization", {
              endpoint: `/api/satellite/natural/${selectedImageId}`,
            })
            const naturalImageUrl = await getNaturalImage(selectedImageId, tileCoords.zoom, tileCoords.x, tileCoords.y)

            Logger.info("Analysis data processed successfully", "AnalysisVisualization", {
              type: analysisType,
              hasNaturalImage: !!naturalImageUrl,
              hasNDVIImage: !!imageUrl,
            })

            setVisualizationData((prev) => ({
              ...prev,
              naturalImageUrl,
              imageUrl,
              statistics: {
                min: -1,
                max: 1,
                mean: 0.3,
                std: 0.2,
              },
            }))
            return
        }

        setVisualizationData({
          imageUrl,
          statistics,
          naturalImageUrl: null,
        })

        Logger.info("Visualization data updated", "AnalysisVisualization", {
          type: analysisType,
          hasImage: !!imageUrl,
          statistics,
        })
      } catch (error) {
        Logger.error(`Error in ${analysisType} visualization`, "AnalysisVisualization", {
          error,
          analysisId,
          parameters: visualizationParams,
        })
        setError("Error al cargar la visualización. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      if (analysisType === "ndvi") {
        fetchSatelliteImages()
      } else {
        loadVisualization()
      }
    }
  }, [open, analysisId, analysisType, visualizationParams, center.lat, center.lng, tileCoords.x, tileCoords.zoom])

  // Effect para cargar visualización cuando se selecciona una imagen
  useEffect(() => {
    const loadVisualization = async () => {
      try {
        if (!selectedImageId) return

        Logger.info("Loading NDVI visualization for selected image", "AnalysisVisualization", {
          sceneId: selectedImageId,
        })

        setLoading(true)
        setError(null)

        // Only update NDVI image when parameters change
        const imageUrl = await getNDVIImage(selectedImageId, tileCoords.zoom, tileCoords.x, tileCoords.y, {
          calibrate: true,
          clustering: "kmeans",
          clustersNo: 5,
          minArea: 2000,
          threshold: visualizationParams.threshold || 0,
        })

        setVisualizationData((prev) => ({
          ...prev,
          imageUrl,
          statistics: {
            min: -1,
            max: 1,
            mean: 0.3,
            std: 0.2,
          },
        }))

        Logger.info("NDVI visualization loaded successfully", "AnalysisVisualization", {
          sceneId: selectedImageId,
          hasNDVIImage: !!imageUrl,
        })
      } catch (error) {
        Logger.error("Error loading NDVI visualization", "AnalysisVisualization", { error })
        setError("Error al cargar la visualización NDVI. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    if (selectedImageId && analysisType === "ndvi") {
      loadVisualization()
    }
  }, [selectedImageId, analysisType, tileCoords.zoom, tileCoords.x, tileCoords.y, visualizationParams.threshold])

  // Add new effect to handle natural image loading separately
  useEffect(() => {
    const loadNaturalImage = async () => {
      if (!selectedImageId || analysisType !== "ndvi") return

      try {
        const naturalImageUrl = await getNaturalImage(selectedImageId, tileCoords.zoom, tileCoords.x, tileCoords.y)

        setVisualizationData((prev) => ({
          ...prev,
          naturalImageUrl,
        }))

        Logger.info("Natural image loaded successfully", "AnalysisVisualization", {
          sceneId: selectedImageId,
          hasNaturalImage: !!naturalImageUrl,
        })
      } catch (error) {
        Logger.error("Error loading natural image", "AnalysisVisualization", { error })
      }
    }

    loadNaturalImage()
  }, [selectedImageId, analysisType, tileCoords.zoom, tileCoords.x, tileCoords.y])

  const handleExport = async () => {
    try {
      if (!visualizationData.imageUrl) {
        throw new Error("No hay imagen para exportar")
      }

      const exportedImage: ExportedImage = {
        id: `${analysisId}-${Date.now()}`,
        url: visualizationData.imageUrl,
        type: analysisType,
        date: new Date().toISOString(),
        analysisId,
        analysisName: `Análisis de ${
          analysisType === "ndvi" ? "NDVI" : analysisType === "hillshade" ? "Sombreado" : "Pendiente"
        }`,
        parameters: visualizationParams,
      }

      // If it's NDVI and we have a natural image, export that too
      if (analysisType === "ndvi" && visualizationData.naturalImageUrl) {
        const naturalImage: ExportedImage = {
          id: `${analysisId}-natural-${Date.now()}`,
          url: visualizationData.naturalImageUrl,
          type: "natural",
          date: new Date().toISOString(),
          analysisId,
          analysisName: "Vista Natural",
        }

        // Store both images
        const existingImages = JSON.parse(localStorage.getItem("exportedImages") || "[]")
        localStorage.setItem("exportedImages", JSON.stringify([...existingImages, exportedImage, naturalImage]))
      } else {
        // Store just the analysis image
        const existingImages = JSON.parse(localStorage.getItem("exportedImages") || "[]")
        localStorage.setItem("exportedImages", JSON.stringify([...existingImages, exportedImage]))
      }

      toast({
        title: "Imágenes exportadas",
        description: "Las imágenes se han exportado correctamente y están disponibles en el editor de reportes.",
      })
    } catch (error) {
      Logger.error("Error exporting images", "AnalysisVisualization", { error })
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron exportar las imágenes.",
      })
    }
  }

  const handleParameterChange = async (updates: Partial<typeof visualizationParams>) => {
    const newParams = { ...visualizationParams, ...updates }
    setVisualizationParams(newParams)

    try {
      setLoading(true)
      let imageUrl: string | null = null

      switch (analysisType) {
        case "hillshade":
          imageUrl = await getTerrainImage(tileCoords.zoom, tileCoords.x, tileCoords.y, {
            format: "hillshade",
            azimuth: newParams.azimuth,
            altitude: newParams.altitude,
          })
          break

        case "slope":
          imageUrl = await getTerrainImage(tileCoords.zoom, tileCoords.x, tileCoords.y, {
            format: "slope",
            colormap: "Spectral",
            slopeRange: `${newParams.slopeRange[0]},${newParams.slopeRange[1]}`,
          })
          break

        case "ndvi":
          if (!selectedImageId) {
            throw new Error("No se ha seleccionado una imagen de satélite")
          }
          imageUrl = await getNDVIImage(selectedImageId, tileCoords.zoom, tileCoords.x, tileCoords.y, {
            calibrate: true,
            clustering: "kmeans",
            clustersNo: 5,
            minArea: 2000,
            threshold: newParams.threshold,
          })
          break
      }

      // Only update the analysis image URL, keeping the natural image URL unchanged
      setVisualizationData((prev) => ({
        ...prev,
        imageUrl,
      }))
    } catch (error) {
      Logger.error("Error updating visualization", "AnalysisVisualization", { error })
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar la visualización.",
      })
    } finally {
      setLoading(false)
    }
  }

  const getMapLayer = () => {
    if (!visualizationData.imageUrl) return null

    return {
      source: {
        id: "analysis-source",
        type: "image",
        url: visualizationData.imageUrl,
        coordinates: [
          [center.lng - 0.02, center.lat + 0.02],
          [center.lng + 0.02, center.lat + 0.02],
          [center.lng + 0.02, center.lat - 0.02],
          [center.lng - 0.02, center.lat - 0.02],
        ],
      },
      layer: {
        id: "analysis-layer",
        type: "raster",
        source: "analysis-source",
        paint: {
          "raster-opacity": 0.0,
        },
      },
    }
  }

  const renderSatelliteButtons = () => {
    if (!satelliteImages.length) {
      return (
        <div className="text-center p-4 text-muted-foreground">No se encontraron imágenes satelitales disponibles</div>
      )
    }

    return (
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-2">
          {satelliteImages.map((image) => (
            <Button
              key={image.sceneID}
              variant={selectedImageId === image.sceneID ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setSelectedImageId(image.sceneID)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(image.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{image.satellite}</Badge>
                  <Badge variant="secondary">{image.cloudCoverage.toFixed(1)}% nubosidad</Badge>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {analysisType === "ndvi" && "Visualización NDVI"}
            {analysisType === "hillshade" && "Visualización de Sombreado"}
            {analysisType === "slope" && "Análisis de Pendiente"}
          </DialogTitle>
          <DialogDescription>Visualización y análisis de datos geoespaciales</DialogDescription>
        </DialogHeader>

        {loading || searchingImages ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {analysisType === "ndvi" && (
              <Card className="p-4">
                <div className="space-y-4">
                  <Label>Seleccionar imagen de satélite</Label>
                  {renderSatelliteButtons()}
                  {selectedImageId && (
                    <div className="space-y-2">
                      <Label>Umbral NDVI: {visualizationParams.threshold}</Label>
                      <Slider
                        value={[visualizationParams.threshold]}
                        min={-1}
                        max={1}
                        step={0.1}
                        onValueChange={([value]) => handleParameterChange({ threshold: value })}
                      />
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Tabs defaultValue="visualization">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="visualization"
                  onClick={() => Logger.info("Switched to visualization tab", "AnalysisVisualization")}
                >
                  Visualización
                </TabsTrigger>
                <TabsTrigger value="map" onClick={() => Logger.info("Switched to map tab", "AnalysisVisualization")}>
                  Mapa
                </TabsTrigger>
                <TabsTrigger
                  value="statistics"
                  onClick={() => Logger.info("Switched to statistics tab", "AnalysisVisualization")}
                >
                  Estadísticas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visualization" className="space-y-4">
                <Card className="p-4">
                  <div className="space-y-4">
                    {analysisType === "hillshade" && (
                      <>
                        <div className="space-y-2">
                          <Label>Azimuth: {visualizationParams.azimuth}°</Label>
                          <Slider
                            value={[visualizationParams.azimuth]}
                            min={0}
                            max={360}
                            step={15}
                            onValueChange={([value]) => handleParameterChange({ azimuth: value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Altitud: {visualizationParams.altitude}°</Label>
                          <Slider
                            value={[visualizationParams.altitude]}
                            min={0}
                            max={90}
                            step={5}
                            onValueChange={([value]) => handleParameterChange({ altitude: value })}
                          />
                        </div>
                      </>
                    )}

                    {analysisType === "ndvi" && (
                      <div className="space-y-2">
                        <Label>Umbral NDVI: {visualizationParams.threshold}</Label>
                        <Slider
                          value={[visualizationParams.threshold]}
                          min={-1}
                          max={1}
                          step={0.1}
                          onValueChange={([value]) => handleParameterChange({ threshold: value })}
                        />
                      </div>
                    )}

                    {analysisType === "slope" && (
                      <div className="space-y-2">
                        <Label>
                          Rango de Pendiente: {visualizationParams.slopeRange[0]}° - {visualizationParams.slopeRange[1]}
                          °
                        </Label>
                        <Slider
                          value={visualizationParams.slopeRange}
                          min={0}
                          max={70}
                          step={1}
                          onValueChange={(value) => handleParameterChange({ slopeRange: value })}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {analysisType === "ndvi" && visualizationData.naturalImageUrl && (
                        <div className="space-y-2">
                          <Label>Imagen Natural</Label>
                          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                            <img
                              src={visualizationData.naturalImageUrl || "/placeholder.svg"}
                              alt="Vista natural"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>
                          {analysisType === "ndvi"
                            ? "Visualización NDVI"
                            : analysisType === "hillshade"
                              ? "Sombreado del Terreno"
                              : "Análisis de Pendiente"}
                        </Label>
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                          {visualizationData.imageUrl && (
                            <img
                              src={visualizationData.imageUrl || "/placeholder.svg"}
                              alt="Visualización del análisis"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <AnalysisLegend type={analysisType} />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="map">
                <Card className="p-4">
                  <div className="h-[400px] rounded-lg overflow-hidden">
                    <ReactMapGL
                      {...viewState}
                      onMove={(evt) => setViewState(evt.viewState)}
                      mapboxAccessToken={MAPBOX_TOKEN}
                      mapStyle="mapbox://styles/mapbox/satellite-v9"
                      onLoad={() => setMapReady(true)}
                    >
                      {mapReady && (
                        <>
                          {visualizationData.imageUrl && (
                            <Source {...getMapLayer().source}>
                              <Layer {...getMapLayer().layer} />
                            </Source>
                          )}
                          <Source id="area-data" type="geojson" data={areaGeometry}>
                            <Layer
                              id="area-fill"
                              type="fill"
                              source="area-data"
                              paint={{
                                "fill-color": "#ffffff",
                                "fill-opacity": 0.2,
                              }}
                            />
                            <Layer
                              id="area-outline"
                              type="line"
                              source="area-data"
                              paint={{
                                "line-color": "#ffffff",
                                "line-width": 2,
                              }}
                            />
                          </Source>
                        </>
                      )}
                    </ReactMapGL>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="statistics">
                <Card className="p-4">
                  {visualizationData.statistics && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor Mínimo</Label>
                        <div className="text-2xl font-bold">{visualizationData.statistics.min.toFixed(3)}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Valor Máximo</Label>
                        <div className="text-2xl font-bold">{visualizationData.statistics.max.toFixed(3)}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Media</Label>
                        <div className="text-2xl font-bold">{visualizationData.statistics.mean.toFixed(3)}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Desviación Estándar</Label>
                        <div className="text-2xl font-bold">{visualizationData.statistics.std.toFixed(3)}</div>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar Resultados
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

