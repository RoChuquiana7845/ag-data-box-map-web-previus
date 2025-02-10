"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/lib/hooks/use-auth"
import { fadeIn } from "@/lib/config/animations"
import { getGeometryManagement } from "@/lib/services/geometry-management"
import { GeometryManagementTable } from "./geometry-management-table"
import { Alert } from "@/components/ui/alert"

export async function GeometryManagementContent() {
  const { user } = useAuth()

  // Get geometries with initial pagination
  const { geometries, isBackendError, pagination } = await getGeometryManagement({
    page: 1,
    limit: 10,
  })

  if (isBackendError) {
    return <Alert variant="destructive">Error al cargar las geometrías. Por favor, intente más tarde.</Alert>
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Geometrías</h2>
        <p className="text-muted-foreground">Gestión de geometrías de áreas agrícolas</p>
      </div>

      <GeometryManagementTable geometries={geometries} pagination={pagination} />
    </motion.div>
  )
}

