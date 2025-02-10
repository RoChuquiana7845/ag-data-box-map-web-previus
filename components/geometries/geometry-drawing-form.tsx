"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import ReactMapGL, { type Map, NavigationControl } from "react-map-gl@7.1.7"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { Check, ChevronsUpDown, BrushIcon as Draw } from "lucide-react"
import { cn } from "@/lib/utils"
import { GeometryStyleForm } from "./geometry-style-form"
import { updateGeometry } from "@/lib/services/geometries"
import type { Area } from "@/lib/types/area"
import type { GeometryStyle } from "@/lib/types/geometry"
import type * as GeoJSON from "geojson"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

const DEFAULT_STYLE: GeometryStyle = {
  fillColor: "#3b82f6",
  strokeColor: "#2563eb",
  fillOpacity: 0.2,
  strokeWidth: 2,
}

const formSchema = z.object({
  areaId: z.string().optional(),
})

const DRAW_MODES = [{ id: "draw_polygon", label: "Polígono", icon: Draw }] as const

type DrawMode = (typeof DRAW_MODES)[number]["id"]

interface GeometryDrawingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  areas?: Area[]
  onGeometryCreate?: () => void
}

export function GeometryDrawingForm({ open, onOpenChange, areas = [], onGeometryCreate }: GeometryDrawingFormProps) {
  const [currentGeometry, setCurrentGeometry] = useState<GeoJSON.Polygon | null>(null)
  const [style, setStyle] = useState<GeometryStyle>(DEFAULT_STYLE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  //const [drawMode, setDrawMode] = useState<DrawMode>("draw_polygon")
  const [viewState, setViewState] = useState({
    longitude: -79.5833,
    latitude: -2.1333,
    zoom: 13,
    pitch: 0,
    bearing: 0,
  })
  const { toast } = useToast()
  const mapRef = useRef<Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const initializeDraw = useCallback(() => {
    if (!mapRef.current) return

    if (drawRef.current) {
      mapRef.current.removeControl(drawRef.current)
    }

    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
      styles: [
        {
          id: "gl-draw-polygon-fill-active",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
          paint: {
            "fill-color": style.fillColor,
            "fill-opacity": style.fillOpacity,
          },
        },
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
          paint: {
            "line-color": style.strokeColor,
            "line-width": style.strokeWidth,
          },
        },
        {
          id: "gl-draw-polygon-fill-inactive",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
          paint: {
            "fill-color": style.fillColor,
            "fill-opacity": style.fillOpacity,
          },
        },
        {
          id: "gl-draw-polygon-stroke-inactive",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
          paint: {
            "line-color": style.strokeColor,
            "line-width": style.strokeWidth,
          },
        },
      ],
    })

    mapRef.current.addControl(drawRef.current)

    if (currentGeometry) {
      drawRef.current.add({
        type: "Feature",
        geometry: currentGeometry,
        properties: {},
      })
    }

    const updateGeometryFromDraw = (e: { features: Array<GeoJSON.Feature> }) => {
      if (e.features && e.features[0]) {
        const newGeometry = e.features[0].geometry as GeoJSON.Polygon

        // Evita la recursión infinita
        if (JSON.stringify(newGeometry) !== JSON.stringify(currentGeometry)) {
          setCurrentGeometry(newGeometry)
        }

        if (drawRef.current) {
          setTimeout(() => {
            if (drawRef.current && drawRef.current.getAll().features.length > 0) {
              drawRef.current.changeMode("simple_select", { featureIds: [e.features[0].id] })
            }
          }, 100)
        }
      }
    }

    const handleGeometryDelete = () => {
      setCurrentGeometry(null)
      if (drawRef.current) {
        setTimeout(() => {
          if (drawRef.current) {
            drawRef.current.changeMode("draw_polygon")
          }
        }, 100)
      }
    }

    const listeners = [
      { type: "draw.create", listener: updateGeometryFromDraw },
      { type: "draw.update", listener: updateGeometryFromDraw },
      { type: "draw.delete", listener: handleGeometryDelete },
    ]

    listeners.forEach(({ type, listener }) => {
      mapRef.current?.on(type, listener)
    })

    return () => {
      listeners.forEach(({ type, listener }) => {
        mapRef.current?.off(type, listener)
      })
      if (mapRef.current && drawRef.current) {
        mapRef.current.removeControl(drawRef.current)
        drawRef.current = null
      }
    }
  }, [currentGeometry, style])

  useEffect(() => {
    if (mapRef.current) {
      initializeDraw()
    }
  }, [initializeDraw])

  //useEffect(() => {
  //  if (drawRef.current) {
  //    drawRef.current.changeMode(drawMode)
  //  }
  //}, [drawMode])

  // Reset state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentGeometry(null)
      //setDrawMode("draw_polygon")
      if (drawRef.current) {
        drawRef.current.deleteAll()
      }
      form.reset()
    }
    onOpenChange(open)
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!currentGeometry) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debe dibujar una geometría antes de guardar",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Si hay un área seleccionada, actualizar la geometría
      if (data.areaId) {
        await updateGeometry(data.areaId, {
          geom: currentGeometry,
          style,
        })

        toast({
          title: "Geometría guardada",
          description: "La geometría se ha guardado correctamente",
        })
      } else {
        // Solo mostrar mensaje de éxito para pruebas
        toast({
          title: "Geometría válida",
          description: "La geometría se ha dibujado correctamente (modo prueba)",
        })
      }

      // Reset form and close dialog
      form.reset()
      setCurrentGeometry(null)
      setStyle(DEFAULT_STYLE)
      onOpenChange(false)
      onGeometryCreate?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la geometría",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Dibujar Geometría</DialogTitle>
          <DialogDescription>Dibuje la geometría en el mapa y seleccione el área a la que pertenece</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="areaId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Área (opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("justify-between", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? areas.find((area) => area.id === field.value)?.code : "Seleccione un área"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Buscar área..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron áreas.</CommandEmpty>
                            <CommandGroup>
                              {areas.map((area) => (
                                <CommandItem
                                  value={area.code}
                                  key={area.id}
                                  onSelect={() => {
                                    form.setValue("areaId", area.id)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      area.id === field.value ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {area.code}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-2">
                <FormField
                  name="style"
                  render={() => (
                    <FormItem>
                      <FormLabel>Estilo</FormLabel>
                      <FormControl>
                        <GeometryStyleForm value={style} onChange={setStyle} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex-1 relative rounded-lg border overflow-hidden">
              <ReactMapGL
                ref={mapRef}
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/satellite-v9"
                style={{ width: "100%", height: "100%" }}
                cursor={currentGeometry ? "grab" : "crosshair"}
                dragRotate={false}
                touchZoomRotate={false}
              >
                <NavigationControl showCompass={false} />
              </ReactMapGL>
            </div>

            <div className="flex justify-between gap-2">
              <div className="flex gap-2">
                {DRAW_MODES.map((mode) => {
                  const Icon = mode.icon
                  return (
                    <Button
                      key={mode.id}
                      type="button"
                      variant="default"
                      onClick={() => {
                        if (drawRef.current) {
                          // First clear any existing drawings and selections
                          drawRef.current.deleteAll()
                          drawRef.current.trash()
                          setCurrentGeometry(null)

                          // Use the mode property if available, otherwise use the id
                          const newMode = mode.mode || mode.id
                          //setDrawMode(newMode as DrawMode)

                          // Add a small delay to ensure the previous mode is cleaned up
                          setTimeout(() => {
                            if (drawRef.current) {
                              if (newMode === "draw_rectangle") {
                                drawRef.current.changeMode("draw_polygon", { type: "rectangle" })
                              } else if (newMode === "draw_circle") {
                                drawRef.current.changeMode("draw_polygon", { type: "circle" })
                              } else {
                                drawRef.current.changeMode(newMode)
                              }
                            }
                          }, 100)
                        }
                      }}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {mode.label}
                    </Button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !currentGeometry}>
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

