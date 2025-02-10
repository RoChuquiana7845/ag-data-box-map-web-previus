"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { updateArea } from "@/lib/services/areas"
import { LocationPicker } from "./location-picker"
import type { Area, UpdateAreaData } from "@/lib/types/area"
import { useState } from "react"

const locationSchema = z.object({
  address: z.string().min(1, "La dirección es requerida"),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
})

const editAreaSchema = z.object({
  code: z
    .string()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(50, "El código debe tener menos de 50 caracteres")
    .regex(/^[A-Za-z0-9-]+$/, "Solo se permiten letras, números y guiones"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción debe tener menos de 500 caracteres"),
  size: z.number().min(0.1, "El tamaño debe ser mayor a 0.1").max(10000, "El tamaño debe ser menor a 10000"),
  soilTypeId: z.string().min(1, "Seleccione un tipo de suelo"),
  projectId: z.string().min(1, "Seleccione un proyecto"),
  location: locationSchema,
})

// Mock data para el ejemplo - Reemplazar con datos reales de la API
const MOCK_SOIL_TYPES = [
  { id: "1", description_es: "Arcilloso" },
  { id: "2", description_es: "Arenoso" },
  { id: "3", description_es: "Franco" },
]

const MOCK_PROJECTS = [
  { id: "1", name: "Proyecto 1" },
  { id: "2", name: "Proyecto 2" },
  { id: "3", name: "Proyecto 3" },
]

interface EditAreaDialogProps {
  area: Area
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAreaDialog({ area, open, onOpenChange }: EditAreaDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateAreaData>({
    resolver: zodResolver(editAreaSchema),
    defaultValues: {
      code: area.code,
      description: area.description,
      size: area.size,
      soilTypeId: area.soilType.id,
      projectId: area.project.id,
      location: area.location,
    },
  })

  async function onSubmit(data: UpdateAreaData) {
    try {
      setIsSubmitting(true)
      await updateArea(area.id, data)

      toast({
        title: "Área actualizada",
        description: "El área se ha actualizado correctamente",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el área",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Área</DialogTitle>
          <DialogDescription>Modifique los datos del área agrícola.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="AREA-001" {...field} />
                      </FormControl>
                      <FormDescription>Código único del área</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Tamaño (ha)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción detallada del área..."
                        {...field}
                        className="min-h-[80px] resize-none w-full"
                      />
                    </FormControl>
                    <FormDescription>Una descripción clara del área y su propósito</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <LocationPicker
                        value={field.value}
                        onChange={(location) => {
                          field.onChange(location)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Busque una dirección o mueva el marcador para establecer la ubicación del área
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="soilTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Suelo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOCK_SOIL_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.description_es}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Tipo de suelo predominante</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proyecto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un proyecto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOCK_PROJECTS.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Proyecto asociado</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Área"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

