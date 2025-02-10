"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { AnalyticsSkeleton } from "./analytics-skeleton"
import { createGeoStatistic } from "@/lib/services/geo-statistics"
import { getGeometries } from "@/lib/services/geometries"
import type { AreaGeometry } from "@/lib/types/geometry"
import { AnalysisRecordsTable } from "./analysis-records-table"

const analysisTypes = [
  {
    id: "hillshade",
    name: "Sombreado del Terreno",
    description: "Análisis de sombreado del terreno basado en la posición solar",
    parameters: {
      azimuth: { min: 0, max: 360, default: 315, step: 15 },
      altitude: { min: 0, max: 90, default: 45, step: 5 },
    },
  },
  {
    id: "slope",
    name: "Análisis de Pendiente",
    description: "Evaluación de la inclinación del terreno",
    parameters: {
      slopeRange: { min: 0, max: 70, default: [0, 70], step: 1 },
    },
  },
  {
    id: "ndvi",
    name: "NDVI",
    description: "Índice de vegetación de diferencia normalizada",
    parameters: {
      threshold: { min: -1, max: 1, default: 0.3, step: 0.1 },
    },
  },
] as const

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  description: z.string().optional(),
  type: z.enum(["hillshade", "slope", "ndvi"], {
    required_error: "Por favor seleccione un tipo de análisis.",
  }),
  geometryId: z.string().refine((value) => value !== "placeholder", {
    message: "Por favor seleccione una geometría.",
  }),
  parameters: z
    .object({
      azimuth: z.number().optional(),
      altitude: z.number().optional(),
      slopeRange: z.array(z.number()).optional(),
      threshold: z.number().optional(),
    })
    .optional(),
})

export default function AnalyticsContent() {
  const [loading, setLoading] = useState(false)
  const [geometries, setGeometries] = useState<AreaGeometry[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      parameters: {},
    },
  })

  useEffect(() => {
    const loadGeometries = async () => {
      try {
        setLoading(true)
        const response = await getGeometries()
        setGeometries(response.data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las geometrías.",
        })
      } finally {
        setLoading(false)
      }
    }

    loadGeometries()
  }, [toast])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const analysisType = analysisTypes.find((type) => type.id === values.type)
      if (!analysisType) throw new Error("Tipo de análisis no válido")

      const response = await createGeoStatistic({
        geometryId: values.geometryId,
        name: values.name,
        description: values.description || "",
        type: values.type,
        parameters: values.parameters || {},
      })

      toast({
        title: "Análisis creado",
        description: "El análisis se ha registrado correctamente.",
      })

      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el análisis. Por favor, intente nuevamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    const analysisType = analysisTypes.find((t) => t.id === type)
    if (analysisType) {
      // Establecer valores por defecto según el tipo
      const defaultParams: any = {}
      if (type === "hillshade") {
        defaultParams.azimuth = analysisType.parameters.azimuth.default
        defaultParams.altitude = analysisType.parameters.altitude.default
      } else if (type === "slope") {
        defaultParams.slopeRange = analysisType.parameters.slopeRange.default
      } else if (type === "ndvi") {
        defaultParams.threshold = analysisType.parameters.threshold.default
      }
      form.setValue("parameters", defaultParams)
    }
  }

  if (loading) {
    return <AnalyticsSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análisis Geoespacial</h2>
          <p className="text-muted-foreground">Gestione y visualice análisis estadísticos de sus datos geoespaciales</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Análisis
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Análisis</DialogTitle>
              <DialogDescription>Complete los detalles para crear un nuevo análisis geoespacial.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del análisis" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Descripción opcional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="geometryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geometría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una geometría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="placeholder" disabled>
                            Seleccionar geometría
                          </SelectItem>
                          {(geometries || []).map((geometry) => (
                            <SelectItem key={geometry.id} value={geometry.id}>
                              {geometry.areaId} - {geometry.area?.name || "Sin nombre"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Análisis</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleTypeChange(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo de análisis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {analysisTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parámetros específicos según el tipo de análisis */}
                {selectedType === "hillshade" && (
                  <>
                    <FormField
                      control={form.control}
                      name="parameters.azimuth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Azimuth (Dirección del Sol): {field.value}°</FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value || 315]}
                              min={0}
                              max={360}
                              step={15}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parameters.altitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Altitud Solar: {field.value}°</FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value || 45]}
                              min={0}
                              max={90}
                              step={5}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {selectedType === "slope" && (
                  <FormField
                    control={form.control}
                    name="parameters.slopeRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Rango de Pendiente: {field.value?.[0]}° - {field.value?.[1]}°
                        </FormLabel>
                        <FormControl>
                          <Slider
                            value={field.value || [0, 70]}
                            min={0}
                            max={70}
                            step={1}
                            onValueChange={(value) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedType === "ndvi" && (
                  <FormField
                    control={form.control}
                    name="parameters.threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Umbral NDVI: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            value={[field.value || 0.3]}
                            min={-1}
                            max={1}
                            step={0.1}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creando..." : "Crear Análisis"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analysisTypes.map((type) => (
          <Card key={type.id}>
            <CardHeader>
              <CardTitle>{type.name}</CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
            <CardContent>{/* Aquí podrían ir estadísticas o información del tipo de análisis */}</CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Ver Registros
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Registros de {type.name}</DialogTitle>
                    <DialogDescription>Lista de análisis registrados para {type.name.toLowerCase()}.</DialogDescription>
                  </DialogHeader>
                  <AnalysisRecordsTable
                    records={[
                      // Mock data - replace with actual data from your API
                      {
                        id: "1",
                        name: `${type.name} - Análisis 1`,
                        description: "Descripción del análisis",
                        createdAt: new Date().toISOString(),
                        type: type.id as "hillshade" | "slope" | "ndvi", // Explicitly set the type to match the parent card
                        parameters: type.parameters,
                      },
                      // Add more mock records as needed
                    ]}
                    onDelete={async (id) => {
                      // Implement delete logic
                      console.log("Delete analysis", id)
                    }}
                    onUpdate={async (id, data) => {
                      // Implement update logic
                      console.log("Update analysis", id, data)
                    }}
                    onExecute={async (id) => {
                      // Implement execute logic
                      console.log("Execute analysis", id)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

