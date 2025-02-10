"use client"

import { useEffect, useRef } from "react"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import type { Map } from "react-map-gl"
import type * as GeoJSON from "geojson"

interface MapDrawToolsProps {
  map: Map | null
  onGeometryCreate?: (geometry: GeoJSON.Polygon) => void
  onGeometryUpdate?: (geometry: GeoJSON.Polygon) => void
  onGeometryDelete?: () => void
  isDrawingEnabled?: boolean
  initialGeometry?: GeoJSON.Polygon | null
}

export function MapDrawTools({
  map,
  onGeometryCreate,
  onGeometryUpdate,
  onGeometryDelete,
  isDrawingEnabled = false,
  initialGeometry = null,
}: MapDrawToolsProps) {
  const drawRef = useRef<MapboxDraw | null>(null)

  useEffect(() => {
    if (!map) return

    // Cleanup previous instance if it exists
    if (drawRef.current) {
      map.removeControl(drawRef.current)
      drawRef.current = null
    }

    // Initialize draw tools
    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
      // Enable drawing with right click
      clickOnVertex: false,
      touchEnabled: false,
      boxSelect: false,
      styles: [
        // Style for vertex points
        {
          id: "gl-draw-point",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
          paint: {
            "circle-radius": 5,
            "circle-color": "#fff",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#3b82f6",
          },
        },
        // Style for midpoints
        {
          id: "gl-draw-point-mid",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
          paint: {
            "circle-radius": 3,
            "circle-color": "#fff",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#3b82f6",
          },
        },
        // Style for lines
        {
          id: "gl-draw-line",
          type: "line",
          filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
          paint: {
            "line-color": "#3b82f6",
            "line-dasharray": [0.2, 2],
            "line-width": 2,
          },
        },
        // Style for polygons
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"]],
          paint: {
            "fill-color": "#3b82f6",
            "fill-outline-color": "#3b82f6",
            "fill-opacity": 0.1,
          },
        },
        {
          id: "gl-draw-polygon-stroke",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"]],
          paint: {
            "line-color": "#3b82f6",
            "line-width": 2,
          },
        },
        // Style for active polygon
        {
          id: "gl-draw-polygon-fill-active",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
          paint: {
            "fill-color": "#3b82f6",
            "fill-outline-color": "#3b82f6",
            "fill-opacity": 0.2,
          },
        },
      ],
    })

    // Add draw tools to map
    map.addControl(drawRef.current)

    // Add initial geometry if provided
    if (initialGeometry) {
      drawRef.current.add(initialGeometry)
    }

    // Event handlers
    map.on("draw.create", (e) => {
      const geometry = e.features[0].geometry as GeoJSON.Polygon
      onGeometryCreate?.(geometry)
    })

    map.on("draw.update", (e) => {
      const geometry = e.features[0].geometry as GeoJSON.Polygon
      onGeometryUpdate?.(geometry)
    })

    map.on("draw.delete", () => {
      onGeometryDelete?.()
    })

    // Set initial mode
    if (isDrawingEnabled) {
      drawRef.current.changeMode("draw_polygon")
    }

    return () => {
      if (map && drawRef.current) {
        // Remove event listeners
        map.off("draw.create")
        map.off("draw.update")
        map.off("draw.delete")
        // Remove control
        map.removeControl(drawRef.current)
        drawRef.current = null
      }
    }
  }, [map, onGeometryCreate, onGeometryUpdate, onGeometryDelete, isDrawingEnabled, initialGeometry])

  // Update mode when drawing state changes
  useEffect(() => {
    if (drawRef.current) {
      drawRef.current.changeMode(isDrawingEnabled ? "draw_polygon" : "simple_select")
    }
  }, [isDrawingEnabled])

  return null
}

