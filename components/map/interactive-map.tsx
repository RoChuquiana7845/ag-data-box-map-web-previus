"use client"

import { useEffect, useState, useCallback } from "react"
import ReactMapGL, { Source, Layer, Marker, useMap } from "react-map-gl@7.1.7"
import { MapControls } from "./map-controls"
import { MapCharts } from "./map-charts"
import { GeocodingSearch } from "./geocoding-search"
import { searchSatelliteImages, type EOSDAError } from "@/lib/services/eosda-api"
import type { Area, SamplePoint, MapViewState, LayerVisibility } from "@/lib/types/geospatial"
import { MapPin } from "lucide-react"
import "mapbox-gl/dist/mapbox-gl.css"
import { Alert } from "@/components/ui/alert"
import { DraggableCardProvider } from "@/components/ui/draggable-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { GeometryControls } from "./geometry-controls"
import { MapDrawTools } from "./map-draw-tools"
import type { AreaGeometry } from "@/lib/types/geometry"
import type * as GeoJSON from "geojson"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "YOUR_MAPBOX_TOKEN"
const FALLBACK_STYLE = "mapbox://styles/mapbox/satellite-v9"

// Coordenadas del Valle del Maipo (San Bernardo - Buin)
const INITIAL_VIEW_STATE = {
  longitude: -70.7157,
  latitude: -33.6147,
  zoom: 12,
  pitch: 0,
  bearing: 0,
}

// Mock de áreas agrícolas en la zona
const MOCK_AREAS: Area[] = [
  {
    id: "1",
    code: "AREA-001",
    description: "Viña del Maipo",
    size: 150,
    user_id: "user1",
    geom: {
      type: "Polygon",
      coordinates: [
        [
          [-70.7257, -33.6147],
          [-70.7157, -33.6147],
          [-70.7157, -33.6047],
          [-70.7257, -33.6047],
          [-70.7257, -33.6147],
        ],
      ],
    },
  },
  {
    id: "2",
    code: "AREA-002",
    description: "Cultivos Buin",
    size: 200,
    user_id: "user1",
    geom: {
      type: "Polygon",
      coordinates: [
        [
          [-70.7357, -33.6247],
          [-70.7257, -33.6247],
          [-70.7257, -33.6147],
          [-70.7357, -33.6147],
          [-70.7357, -33.6247],
        ],
      ],
    },
  },
]

// Mock de puntos de sensores en la zona
const MOCK_SAMPLE_POINTS: SamplePoint[] = [
  {
    id: "1",
    sample_id: "SENSOR-001",
    geom: {
      type: "Point",
      coordinates: [-70.7207, -33.6097],
    },
    value: 0.75,
    type: "NDVI",
    status: "active",
  },
  {
    id: "2",
    sample_id: "SENSOR-002",
    geom: {
      type: "Point",
      coordinates: [-70.7307, -33.6197],
    },
    value: 0.82,
    type: "Humedad",
    status: "active",
  },
  {
    id: "3",
    sample_id: "SENSOR-003",
    geom: {
      type: "Point",
      coordinates: [-70.7157, -33.6147],
    },
    value: 24.5,
    type: "Temperatura",
    status: "active",
  },
]

interface InteractiveMapProps {
  areas?: Area[]
  samplePoints?: SamplePoint[]
}

export function InteractiveMap({ areas = MOCK_AREAS, samplePoints = MOCK_SAMPLE_POINTS }: InteractiveMapProps) {
  const { current: map } = useMap()
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE)
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    areas: true,
    sensors: true,
    satellite: true,
  })

  const [satelliteOpacity, setSatelliteOpacity] = useState(50)
  const [selectedPoint, setSelectedPoint] = useState<SamplePoint | null>(null)
  const [isLoadingSatellite, setIsLoadingSatellite] = useState(false)
  const [satelliteError, setSatelliteError] = useState<EOSDAError | null>(null)
  const [searchedLocation, setSearchedLocation] = useState<{
    longitude: number
    latitude: number
  } | null>(null)
  const [isEditingGeometry, setIsEditingGeometry] = useState(false)
  const [isDrawingGeometry, setIsDrawingGeometry] = useState(false)
  const [selectedGeometry, setSelectedGeometry] = useState<AreaGeometry | null>(null)
  const [currentGeometry, setCurrentGeometry] = useState<GeoJSON.Polygon | null>(null)

  const vegetationData = [
    { date: "2024-01", ndvi: 0.65, evi: 0.58 },
    { date: "2024-02", ndvi: 0.68, evi: 0.6 },
    { date: "2024-03", ndvi: 0.72, evi: 0.63 },
    { date: "2024-04", ndvi: 0.75, evi: 0.65 },
    { date: "2024-05", ndvi: 0.78, evi: 0.68 },
  ]

  const sensorDistribution = [
    { type: "Temperatura", count: 30 },
    { type: "Humedad", count: 25 },
    { type: "NDVI", count: 15 },
    { type: "Lluvia", count: 10 },
  ]

  const handleLocationSelect = (longitude: number, latitude: number) => {
    setSearchedLocation({ longitude, latitude })
    setViewState((prev) => ({
      ...prev,
      longitude,
      latitude,
      zoom: 14,
      transitionDuration: 1000,
    }))
  }

  useEffect(() => {
    if (!layerVisibility.satellite) return

    const loadSatelliteData = async () => {
      setIsLoadingSatellite(true)
      setSatelliteError(null)

      try {
        // Aumentamos el área de búsqueda para encontrar más imágenes
        const bbox: [number, number, number, number] = [
          viewState.longitude - 0.2,
          viewState.latitude - 0.2,
          viewState.longitude + 0.2,
          viewState.latitude + 0.2,
        ]

        await searchSatelliteImages({
          bbox,
          dateFrom: "2024-01-01",
          dateTo: "2024-03-01",
          satellite: "sentinel-2",
        })

        setSatelliteError(null)
      } catch (error) {
        setSatelliteError(error as EOSDAError)
      } finally {
        setIsLoadingSatellite(false)
      }
    }

    const timeoutId = setTimeout(loadSatelliteData, 1000)
    return () => clearTimeout(timeoutId)
  }, [viewState.longitude, viewState.latitude, layerVisibility.satellite])

  useEffect(() => {
    if (satelliteError) {
      const timer = setTimeout(() => {
        setSatelliteError(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [satelliteError])

  const handleExport = (format: "geojson" | "csv" | "pdf") => {
    console.log(`Exporting in ${format} format`)
  }

  const handleGeometryCreate = useCallback((geometry: GeoJSON.Polygon) => {
    setCurrentGeometry(geometry)
  }, [])

  const handleGeometryUpdate = useCallback((geometry: GeoJSON.Polygon) => {
    setCurrentGeometry(geometry)
  }, [])

  const handleGeometryDelete = useCallback(() => {
    setCurrentGeometry(null)
    setSelectedGeometry(null)
  }, [])

  return (
    <div className="w-full h-screen relative">
      <div className="absolute inset-0">
        <ReactMapGL
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={FALLBACK_STYLE}
          style={{ width: "100%", height: "100%" }}
          reuseMaps
          cursor={isDrawingGeometry ? "crosshair" : "grab"}
          dragRotate={false}
        >
          {layerVisibility.areas && (
            <Source
              id="areas-source"
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: areas.map((area) => ({
                  type: "Feature",
                  geometry: area.geom,
                  properties: area,
                })),
              }}
            >
              <Layer
                id="areas-fill"
                source="areas-source"
                type="fill"
                paint={{
                  "fill-color": "#00ff00",
                  "fill-opacity": 0.2,
                }}
              />
              <Layer
                id="areas-outline"
                source="areas-source"
                type="line"
                paint={{
                  "line-color": "#00ff00",
                  "line-width": 2,
                }}
              />
            </Source>
          )}

          {layerVisibility.sensors &&
            samplePoints.map((point) => (
              <Marker
                key={point.id}
                longitude={point.geom.coordinates[0]}
                latitude={point.geom.coordinates[1]}
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  // Just prevent default behavior without setting selectedPoint
                  e.preventDefault()
                }}
              >
                <HoverCard openDelay={0}>
                  <HoverCardTrigger>
                    <div
                      className={`w-4 h-4 rounded-full cursor-pointer transform transition-transform hover:scale-125 ring-2 ring-background
                      ${point.status === "active" ? "bg-green-500/80" : "bg-red-500/80"}`}
                    />
                  </HoverCardTrigger>
                  <HoverCardContent side="top" align="center" className="w-48 p-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Sensor {point.id}</h4>
                        <Badge variant={point.status === "active" ? "success" : "destructive"}>{point.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="font-medium">{point.type}</span>
                        <span className="text-muted-foreground">Valor:</span>
                        <span className="font-medium">{point.value}</span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </Marker>
            ))}

          {searchedLocation && (
            <Marker longitude={searchedLocation.longitude} latitude={searchedLocation.latitude} anchor="bottom">
              <MapPin className="h-6 w-6 text-primary animate-bounce" />
            </Marker>
          )}

          <MapDrawTools
            map={map}
            onGeometryCreate={handleGeometryCreate}
            onGeometryUpdate={handleGeometryUpdate}
            onGeometryDelete={handleGeometryDelete}
            isDrawingEnabled={isDrawingGeometry}
            initialGeometry={selectedGeometry?.geom || null}
          />
        </ReactMapGL>
      </div>

      <DraggableCardProvider>
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            <div className="pointer-events-auto absolute top-4 left-4 z-10">
              <GeocodingSearch onLocationSelect={handleLocationSelect} />
            </div>

            <MapControls
              layerVisibility={layerVisibility}
              onLayerVisibilityChange={setLayerVisibility}
              satelliteOpacity={satelliteOpacity}
              onOpacityChange={setSatelliteOpacity}
              onExport={handleExport}
              onToggleGeometryEditor={() => setIsEditingGeometry(!isEditingGeometry)}
              isEditingGeometry={isEditingGeometry}
            />

            {isEditingGeometry && (
              <GeometryControls
                selectedArea={selectedGeometry}
                onStartDrawing={() => setIsDrawingGeometry(true)}
                onCancelDrawing={() => {
                  setIsDrawingGeometry(false)
                  setCurrentGeometry(null)
                }}
                onSaveGeometry={(geometry) => {
                  setCurrentGeometry(geometry)
                  setIsDrawingGeometry(false)
                }}
                isDrawing={isDrawingGeometry}
                currentGeometry={currentGeometry}
                onDeleteGeometry={handleGeometryDelete}
              />
            )}

            <MapCharts vegetationData={vegetationData} sensorDistribution={sensorDistribution} />

            {satelliteError && (
              <div className="absolute top-4 right-4 z-50 w-[400px]">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Aviso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Alert
                        variant={satelliteError.type === "notFound" ? "info" : "warning"}
                        onClose={() => setSatelliteError(null)}
                      >
                        {satelliteError.message}
                      </Alert>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </DraggableCardProvider>
    </div>
  )
}

