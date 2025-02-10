import { GeometriesContent } from "./geometries-content"
import { getGeometryManagement } from "@/lib/services/geometry-management"
import { getAreas } from "@/lib/services/areas"

export async function GeometriesServer() {
  // Get geometries with initial pagination
  const { geometries, isBackendError, pagination } = await getGeometryManagement({
    page: 1,
    limit: 10,
  })

  // Get areas for the drawing form
  const { areas } = await getAreas()

  return (
    <GeometriesContent
      initialGeometries={geometries}
      initialAreas={areas}
      isBackendError={isBackendError}
      pagination={pagination}
    />
  )
}

