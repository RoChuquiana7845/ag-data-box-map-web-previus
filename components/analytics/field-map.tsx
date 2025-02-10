"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card } from "@/components/ui/card"
import { FIELD_COORDINATES, calculatePolygonCenter } from "@/utils/coordinates"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Cambiar de export function a export default function
export default function FieldMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const center = calculatePolygonCenter(FIELD_COORDINATES.polygon)

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-v9",
        center: [center.lng, center.lat],
        zoom: 17, // Increased zoom level for better detail
      })

      map.current.on("load", () => {
        if (!map.current) return

        map.current.addSource("field", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [FIELD_COORDINATES.polygon],
            },
            properties: {},
          },
        })

        map.current.addLayer({
          id: "field-fill",
          type: "fill",
          source: "field",
          paint: {
            "fill-color": "#ffffff",
            "fill-opacity": 0.2,
          },
        })

        map.current.addLayer({
          id: "field-border",
          type: "line",
          source: "field",
          paint: {
            "line-color": "#ffffff",
            "line-width": 3,
          },
        })

        // Agregar marcadores en los vértices
        FIELD_COORDINATES.polygon.forEach((coord, index) => {
          if (index < FIELD_COORDINATES.polygon.length - 1) {
            // No agregar marcador en el último punto (que cierra el polígono)
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="text-xs">
                <strong>Punto ${index + 1}</strong><br/>
                Lat: ${coord[1].toFixed(6)}°<br/>
                Lng: ${coord[0].toFixed(6)}°
              </div>
            `)

            new mapboxgl.Marker({
              color: "#ffffff",
              scale: 0.8,
            })
              .setLngLat(coord)
              .setPopup(popup)
              .addTo(map.current!)
          }
        })
      })
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [center.lat, center.lng])

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Visualización del Campo</h3>
      <div ref={mapContainer} className="h-[400px] rounded-lg overflow-hidden" />
    </Card>
  )
}

