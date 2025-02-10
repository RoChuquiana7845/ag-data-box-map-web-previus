"use client"

import { useEffect, useState } from "react"
import ReactMapGL, { Source, Layer, type ViewState } from "react-map-gl@7.1.7"
import type { AreaGeometry } from "@/lib/types/geometry"
import "mapbox-gl/dist/mapbox-gl.css"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

interface GeometryPreviewProps {
  geometry: AreaGeometry
  height?: number
}

export function GeometryPreview({ geometry, height = 200 }: GeometryPreviewProps) {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -79.5833,
    latitude: -2.1333,
    zoom: 13,
  })

  useEffect(() => {
    if (geometry.bbox) {
      const [minLng, minLat, maxLng, maxLat] = geometry.bbox
      const centerLng = (minLng + maxLng) / 2
      const centerLat = (minLat + maxLat) / 2

      setViewState({
        ...viewState,
        longitude: centerLng,
        latitude: centerLat,
        zoom: 14,
      })
    }
  }, [geometry, viewState])

  return (
    <div className="w-full rounded-lg overflow-hidden border" style={{ height }}>
      <ReactMapGL
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
      >
        <Source
          id="geometry-preview"
          type="geojson"
          data={{
            type: "Feature",
            geometry: geometry.geom,
            properties: {},
          }}
        >
          <Layer
            id="geometry-fill"
            type="fill"
            paint={{
              "fill-color": geometry.style.fillColor,
              "fill-opacity": geometry.style.fillOpacity,
            }}
          />
          <Layer
            id="geometry-outline"
            type="line"
            paint={{
              "line-color": geometry.style.strokeColor,
              "line-width": geometry.style.strokeWidth,
            }}
          />
        </Source>
      </ReactMapGL>
    </div>
  )
}

