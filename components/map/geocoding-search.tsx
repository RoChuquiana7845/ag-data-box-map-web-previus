"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Límites aproximados de Chile
const CHILE_BOUNDS = "-75.6443953112,-55.9305368456,-66.0753944175,-17.5800118954"

interface SearchResult {
  id: string
  place_name: string
  center: [number, number]
  text: string
  context?: Array<{
    id: string
    text: string
  }>
}

interface GeocodingSearchProps {
  onLocationSelect: (lng: number, lat: number) => void
}

export function GeocodingSearch({ onLocationSelect }: GeocodingSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery,
        )}.json?access_token=${MAPBOX_TOKEN}&country=cl&bbox=${CHILE_BOUNDS}&limit=5&types=place,locality,neighborhood,address&language=es`,
      )

      if (!response.ok) {
        throw new Error("Error en la búsqueda")
      }

      const data = await response.json()

      if (data.features.length === 0) {
        setError("No se encontraron resultados")
        setResults([])
        return
      }

      setResults(
        data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center,
          text: feature.text,
          context: feature.context,
        })),
      )
    } catch (error) {
      console.error("Error en geocoding:", error)
      setError("Error al buscar ubicación")
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceTimer.current)

    if (query) {
      debounceTimer.current = setTimeout(() => {
        searchPlaces(query)
      }, 500)
    } else {
      setResults([])
    }

    return () => {
      clearTimeout(debounceTimer.current)
    }
  }, [query, searchPlaces])

  const formatAddress = (result: SearchResult) => {
    const mainText = result.text
    const contextText = result.context
      ?.map((ctx) => ctx.text)
      .filter(Boolean)
      .join(", ")
    return contextText ? `${mainText}, ${contextText}` : mainText
  }

  return (
    <div className="relative w-full max-w-sm">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background/95 backdrop-blur-sm border-background/20"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Search className="h-4 w-4 shrink-0" />
              {query ? formatAddress(results[0] || { text: query }) : "Buscar ubicación..."}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Ingrese una dirección..." value={query} onValueChange={setQuery} />
            <CommandList>
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : error ? (
                  <p className="p-4 text-sm text-muted-foreground">{error}</p>
                ) : (
                  "No se encontraron resultados."
                )}
              </CommandEmpty>
              <CommandGroup>
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.place_name}
                    onSelect={() => {
                      setQuery(formatAddress(result))
                      onLocationSelect(result.center[0], result.center[1])
                      setOpen(false)
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm">{result.text}</span>
                      {result.context && (
                        <span className="text-xs text-muted-foreground">
                          {result.context.map((ctx) => ctx.text).join(", ")}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

