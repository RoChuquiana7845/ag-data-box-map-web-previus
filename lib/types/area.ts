import type { Project } from "./project"
import type { SoilType } from "./soil-type"
import type * as GeoJSON from "geojson"

export interface AreaLocation {
  address: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface Area {
  id: string
  code: string
  description: string
  size: number
  soilType: SoilType
  project: Project
  geom: GeoJSON.Polygon
  location: AreaLocation
  registrationDate: string
  userId: string
}

export interface CreateAreaData {
  code: string
  description: string
  size: number
  soilTypeId: string
  projectId: string
  geom: GeoJSON.Polygon
  location: AreaLocation
}

export interface UpdateAreaData {
  code?: string
  description?: string
  size?: number
  soilTypeId?: string
  projectId?: string
  geom?: GeoJSON.Polygon
  location?: AreaLocation
}

export interface AreaResponse {
  success: boolean
  data: Area
  message?: string
}

export interface AreasResponse {
  success: boolean
  data: Area[]
  pagination: {
    total: number
    page: number
    limit: number
  }
  message?: string
}

export interface AreaStatistics {
  samplesCount: number
  gridsCount: number
  mapsCount: number
  lastUpdate: string
}

export interface AreaStatisticsResponse {
  success: boolean
  data: AreaStatistics
  message?: string
}

export interface AreasResult {
  areas: Area[]
  isBackendError: boolean
  pagination?: {
    total: number
    page: number
    limit: number
  }
}

