import type { Area } from "./area"
import type { AreaGeometry } from "./geometry"

export interface GeometryManagement {
  area: Area
  geometry: AreaGeometry | null
  lastModified: string
  modifiedBy: string
}

export interface GeometryManagementResponse {
  success: boolean
  data: GeometryManagement[]
  pagination: {
    total: number
    page: number
    limit: number
  }
  message?: string
}

export interface GeometryManagementResult {
  geometries: GeometryManagement[]
  isBackendError: boolean
  pagination?: {
    total: number
    page: number
    limit: number
  }
}

