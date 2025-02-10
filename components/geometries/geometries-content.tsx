"use client"

import { useCallback, useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/hooks/use-auth"
import { fadeIn } from "@/lib/config/animations"
import { getGeometryManagement } from "@/lib/services/geometry-management"
import { EmptyGeometries } from "./empty-geometries"
import { GeometriesTable } from "./geometries-table"
import { GeometryDrawingForm } from "./geometry-drawing-form"
import { Button } from "@/components/ui/button"
import { BrushIcon as Draw } from "lucide-react"
import type { Area } from "@/lib/types/area"
import type { GeometryManagement } from "@/lib/types/geometry-management"

interface GeometriesContentProps {
  initialGeometries: GeometryManagement[]
  initialAreas: Area[]
  isBackendError?: boolean
  pagination?: {
    total: number
    page: number
    limit: number
  }
}

export function GeometriesContent({
  initialGeometries,
  initialAreas,
  isBackendError,
  pagination,
}: GeometriesContentProps) {
  const { user } = useAuth()
  const [isDrawingFormOpen, setIsDrawingFormOpen] = useState(false)
  const [geometries, setGeometries] = useState(initialGeometries)

  const handleGeometryCreate = useCallback(() => {
    // Refresh geometries after creation
    getGeometryManagement().then(({ geometries }) => {
      setGeometries(geometries)
    })
  }, [])

  if (geometries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Geometrías</h2>
            <p className="text-muted-foreground">Gestiona las geometrías de las áreas agrícolas</p>
          </div>
          <Button onClick={() => setIsDrawingFormOpen(true)}>
            <Draw className="mr-2 h-4 w-4" />
            Nueva geometría
          </Button>
        </div>
        <EmptyGeometries showBackendError={isBackendError} />
        <GeometryDrawingForm
          open={isDrawingFormOpen}
          onOpenChange={setIsDrawingFormOpen}
          areas={initialAreas}
          onGeometryCreate={handleGeometryCreate}
        />
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Geometrías</h2>
          <p className="text-muted-foreground">
            {`${pagination?.total || geometries.length} geometría${geometries.length === 1 ? "" : "s"} en total`}
          </p>
        </div>
        <Button onClick={() => setIsDrawingFormOpen(true)}>
          <Draw className="mr-2 h-4 w-4" />
          Nueva geometría
        </Button>
      </div>

      <GeometriesTable geometries={geometries} pagination={pagination} onDelete={handleGeometryCreate} />

      <GeometryDrawingForm
        open={isDrawingFormOpen}
        onOpenChange={setIsDrawingFormOpen}
        areas={initialAreas}
        onGeometryCreate={handleGeometryCreate}
      />
    </motion.div>
  )
}

