"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { searchSatelliteImages, getNDVIImage, type SatelliteImage, getNaturalImage } from "@/lib/services/eos-service"
import { validatePolygon, calculatePolygonCenter } from "@/lib/utils/coordinates"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { useParams } from "next/navigation"
import { getGeometry } from "@/lib/services/geometries"
import { createGeoStatistic, getGeoStatistics } from "@/lib/services/geo-statistics"
import type { AreaGeometry } from "@/lib/types/geometry"
import type { GeoStatistic } from "@/lib/types/geo-statistics"
import FieldMap from "./field-map"
import NDVIViewer from "./ndvi-viewer"
import NaturalViewer from "./natural-viewer"
import TerrainAnalysis from "./terrain-analysis"
import DataVisualization from "./data-visualization"

export default function FieldAnalysis() {
  const params = useParams()
  const geometryId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ message: string; details?: string } | null>(null)
  const [geometry, setGeometry] = useState<AreaGeometry | null>(null)
  const [images, setImages] = useState<SatelliteImage[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalImages, setTotalImages] = useState(0)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })
  const [selectedNaturalImage, setSelectedNaturalImage] = useState<{
    url: string | null
    date: string | null
    source: string | null
  }>({
    url: null,
    date: null,
    source: null,
  })
  const [ndviData, setNdviData] = useState<GeoStatistic[]>([])
  const [terrainData, setTerrainData] = useState<{
    elevation: number
    slope: number
    aspect: number
  }>({
    elevation: 0,
    slope: 0,
    aspect: 0,
  })

  // Fetch geometry data
  useEffect(() => {
    const fetchGeometry = async () => {
      try {
        const response = await getGeometry(geometryId)
        if (response.success) {
          setGeometry(response.data)
        } else {
          throw new Error(response.message || "Failed to fetch geometry")
        }
      } catch (error) {
        console.error("Error fetching geometry:", error)
        setError({
          message: "Error fetching geometry",
          details: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    if (geometryId) {
      fetchGeometry()
    }
  }, [geometryId])

  // Fetch existing geo-statistics
  useEffect(() => {
    const fetchGeoStatistics = async () => {
      try {
        const response = await getGeoStatistics(geometryId)
        if (response.success) {
          setNdviData(response.data)
        }
      } catch (error) {
        console.error("Error fetching geo-statistics:", error)
      }
    }

    if (geometryId) {
      fetchGeoStatistics()
    }
  }, [geometryId])

  const fetchImages = useCallback(async () => {
    if (!geometry || !validatePolygon(geometry)) {
      setError({ message: "Invalid geometry data" })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await searchSatelliteImages(
        geometry.geom.coordinates[0],
        dateRange.start.toISOString().split("T")[0],
        dateRange.end.toISOString().split("T")[0],
        currentPage,
        10,
      )
      setImages(result.items || [])
      setTotalImages(result.total || 0)
    } catch (error) {
      console.error("Error searching images:", error)
      setError({
        message: "Error searching images",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }, [geometry, dateRange, currentPage])

  const saveGeoStatistic = async (data: Omit<GeoStatistic, "geometryId">) => {
    try {
      await createGeoStatistic({
        ...data,
        geometryId,
      })
    } catch (error) {
      console.error("Error saving geo-statistic:", error)
      throw error
    }
  }

  const loadNDVI = async (sceneID: string) => {
    if (!geometry) return

    try {
      setLoading(true)
      setError(null)

      const center = calculatePolygonCenter(geometry)
      const zoom = 15
      const x = Math.floor(((center.lng + 180) / 360) * Math.pow(2, zoom))
      const y = Math.floor(
        ((1 - Math.log(Math.tan((center.lat * Math.PI) / 180) + 1 / Math.cos((center.lat * Math.PI) / 180)) / Math.PI) /
          2) *
          Math.pow(2, zoom),
      )

      const currentImage = images.find((img) => img.id === sceneID)
      if (!currentImage) {
        throw new Error("Imagen no encontrada")
      }

      const imageUrl = await getNDVIImage(currentImage.sceneID, zoom, x, y, {
        calibrate: true,
        clustering: "kmeans",
        clustersNo: 5,
        minArea: 2000,
      })
      setSelectedImage(imageUrl)

      const ndviValue = Math.random() * 0.5 + 0.3 // Simulado - reemplazar con valor real
      await saveGeoStatistic({
        ndviValue,
        cloudCoverage: currentImage.cloudCoverage,
        date: currentImage.date,
        elevation: terrainData.elevation,
        slope: terrainData.slope,
        aspect: terrainData.aspect,
      })

      // Actualizar los datos locales
      setNdviData((prev) => [
        ...prev,
        {
          geometryId,
          ndviValue,
          cloudCoverage: currentImage.cloudCoverage,
          date: currentImage.date,
          elevation: terrainData.elevation,
          slope: terrainData.slope,
          aspect: terrainData.aspect,
        },
      ])
    } catch (error) {
      console.error("Error loading NDVI:", error)
      setError({
        message: "Error loading NDVI",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadNaturalView = async (image: SatelliteImage) => {
    if (!geometry) return

    try {
      setLoading(true)
      setError(null)

      const center = calculatePolygonCenter(geometry)
      const zoom = 15
      const x = Math.floor(((center.lng + 180) / 360) * Math.pow(2, zoom))
      const y = Math.floor(
        ((1 - Math.log(Math.tan((center.lat * Math.PI) / 180) + 1 / Math.cos((center.lat * Math.PI) / 180)) / Math.PI) /
          2) *
          Math.pow(2, zoom),
      )

      const imageUrl = await getNaturalImage(image.sceneID, zoom, x, y)
      setSelectedNaturalImage({
        url: imageUrl,
        date: image.date,
        source: image.source,
      })
    } catch (error) {
      console.error("Error loading natural view:", error)
      setError({
        message: "Error loading natural view",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (geometry) {
      fetchImages()
    }
  }, [geometry, fetchImages])

  if (!geometry) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{error.message}</AlertTitle>
          {error.details && (
            <AlertDescription className="mt-2 text-sm whitespace-pre-wrap font-mono">{error.details}</AlertDescription>
          )}
        </Alert>
      )}

      <FieldMap geometry={geometry} />
      <TerrainAnalysis geometry={geometry} onDataUpdate={setTerrainData} />
      <DataVisualization ndviData={ndviData} terrainData={terrainData} />

      {images.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NaturalViewer
            imageUrl={selectedNaturalImage.url}
            date={selectedNaturalImage.date}
            source={selectedNaturalImage.source}
            isLoading={loading}
            error={error?.message || null}
            onRefresh={() => {
              const currentImage = images.find((img) => img.date === selectedNaturalImage.date)
              if (currentImage) {
                loadNaturalView(currentImage)
              }
            }}
          />
          {selectedImage && <NDVIViewer imageUrl={selectedImage} isLoading={loading} error={error?.message || null} />}
        </div>
      )}

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Imágenes Satelitales Disponibles</h3>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : images.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Resolución</TableHead>
                  <TableHead>Cobertura de Nubes</TableHead>
                  <TableHead>Índices</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>{new Date(image.date).toLocaleDateString()}</TableCell>
                    <TableCell>{image.source}</TableCell>
                    <TableCell>{image.resolution}m</TableCell>
                    <TableCell>{image.cloudCoverage.toFixed(1)}%</TableCell>
                    <TableCell>{image.indices.join(", ")}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" onClick={() => loadNaturalView(image)}>
                        Vista Natural
                      </Button>
                      <Button size="sm" onClick={() => loadNDVI(image.id)}>
                        Ver NDVI
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalImages / 10)}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No hay imágenes disponibles para el período seleccionado</div>
        )}
      </Card>
    </div>
  )
}

