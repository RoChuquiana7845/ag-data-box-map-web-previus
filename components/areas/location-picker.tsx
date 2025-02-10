"use client"

import { useState, useCallback, useEffect } from "react"
import { MapIcon, MapPin, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ReactMapGL, { Marker } from "react-map-gl@7.1.7"
import type { AreaLocation } from "@/lib/types/area"
import type { ViewState } from "react-map-gl@7.1.7"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Bounding box for Ecuador, centered around Milagro
const ECUADOR_BOUNDS = "-80.1,-4.5,-78.9,-1.9" // [oeste,sur,este,norte]

interface LocationPickerProps {
  value: AreaLocation
  onChange: (location: AreaLocation) => void
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: -79.5833, // Milagro longitude
    latitude: -2.1333, // Milagro latitude
    zoom: 13,
  })

  const [address, setAddress] = useState(value.address)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = useCallback(async () => {
    try {
      setIsSearching(true)
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address,
        )}.json?access_token=${MAPBOX_TOKEN}&country=ec&bbox=${ECUADOR_BOUNDS}&limit=1`,
      )

      if (!response.ok) throw new Error("Error en la búsqueda")

      const data = await response.json()
      const [lng, lat] = data.features[0].center

      // Update marker position
      onChange({
        address: data.features[0].place_name,
        coordinates: { lat, lng },
      })

      // Center map with animation
      setViewState({
        longitude: lng,
        latitude: lat,
        zoom: 14,
        transitionDuration: 1000,
      })
    } catch (error) {
      console.error("Error searching location:", error)
    } finally {
      setIsSearching(false)
    }
  }, [address, onChange])

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=ec&bbox=${ECUADOR_BOUNDS}&limit=1&types=address,place,locality`,
        )

        if (!response.ok) throw new Error("Error en geocodificación inversa")

        const data = await response.json()
        if (data.features && data.features.length > 0) {
          const newAddress = data.features[0].place_name
          setAddress(newAddress)
          onChange({
            address: newAddress,
            coordinates: { lat, lng },
          })
        }
      } catch (error) {
        console.error("Error in reverse geocoding:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [onChange],
  )

  const handleMarkerDrag = useCallback(
    async (event: { lngLat: [number, number] }) => {
      const [lng, lat] = event.lngLat
      await reverseGeocode(lat, lng)
    },
    [reverseGeocode],
  )

  const handleMapClick = useCallback(
    async (evt: { lngLat: { lng: number; lat: number } }) => {
      const { lng, lat } = evt.lngLat
      await reverseGeocode(lat, lng)
    },
    [reverseGeocode],
  )

  useEffect(() => {
    // If we have coordinates but no address, do reverse geocoding
    if (value.coordinates && !value.address) {
      reverseGeocode(value.coordinates.lat, value.coordinates.lng)
    }
  }, [value.coordinates, value.address, reverseGeocode])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar dirección..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSearch()
            }
          }}
          disabled={isLoading}
        />
        <Button
          type="button"
          variant="secondary"
          className="shrink-0"
          onClick={handleSearch}
          disabled={isLoading || !address}
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapIcon className="h-4 w-4 mr-2" />}
          Buscar
        </Button>
      </div>

      <Card className="relative w-full overflow-hidden h-[200px]">
        <ReactMapGL
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: "100%", height: "100%" }}
          containerStyle={{ width: "100%", height: "100%" }}
          maxBounds={[
            [-80.1, -4.5],
            [-78.9, -1.9],
          ]}
          onClick={handleMapClick}
        >
          <Marker
            longitude={value.coordinates.lng}
            latitude={value.coordinates.lat}
            draggable
            onDragEnd={handleMarkerDrag}
          >
            <MapPin className="h-6 w-6 text-green-500 -translate-x-1/2 -translate-y-full animate-bounce" />
          </Marker>
        </ReactMapGL>
      </Card>
      <p className="text-xs text-muted-foreground">
        {isLoading
          ? "Actualizando ubicación..."
          : "Haga clic en el mapa para colocar el marcador o arrástrelo para ajustar la ubicación"}
      </p>
    </div>
  )
}

