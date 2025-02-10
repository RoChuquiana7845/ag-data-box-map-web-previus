import type { Project } from "./project"
import type { Area } from "./area"
import type { AreaGeometry } from "./geometry"

export interface LinkedData {
  project: Project
  areas: (Area & {
    geometry: AreaGeometry | null
  })[]
}

export interface LinkedDataResponse {
  success: boolean
  data: LinkedData
  message?: string
}

export interface LinkedDataResult {
  data: LinkedData | null
  isBackendError: boolean
}

