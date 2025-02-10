"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/lib/hooks/use-auth"
import { fadeIn } from "@/lib/config/animations"
import { getAreas } from "@/lib/services/areas"
import { EmptyAreas } from "./empty-areas"
import { AreasTable } from "./areas-table"
import { CreateAreaDialog } from "./create-area-dialog"

export async function AreasContent() {
  const { user } = useAuth()
  const canCreateArea = user?.role === "Admin" || user?.role === "User"

  // Obtener las áreas con paginación inicial
  const { areas, isBackendError, pagination } = await getAreas({
    page: 1,
    limit: 10,
  })

  if (areas.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Áreas</h2>
            <p className="text-muted-foreground">Gestiona tus áreas agrícolas y visualiza sus datos</p>
          </div>
          {canCreateArea && <CreateAreaDialog />}
        </div>
        <EmptyAreas showBackendError={isBackendError} />
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Áreas</h2>
          <p className="text-muted-foreground">
            {`${pagination?.total || areas.length} área${areas.length === 1 ? "" : "s"} en total`}
          </p>
        </div>
        {canCreateArea && <CreateAreaDialog />}
      </div>
      <AreasTable areas={areas} pagination={pagination} />
    </motion.div>
  )
}

