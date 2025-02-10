import type * as GeoJSON from "geojson"

export interface GeometryStyle {
  fillColor: string
  strokeColor: string
  fillOpacity: number
  strokeWidth: number
}

export interface AreaGeometry {
  id: string
  areaId: string
  geom: GeoJSON.Polygon
  style: GeometryStyle
  bbox?: [number, number, number, number] // [minLng, minLat, maxLng, maxLat]
  simplified?: boolean
}

export interface GeometryResponse {
  success: boolean
  data: AreaGeometry
  message?: string
}

export interface GeometriesResponse {
  success: boolean
  data: AreaGeometry[]
  message?: string
}

export interface GeometryQueryParams {
  bbox?: [number, number, number, number]
  simplified?: boolean
  projectId?: string
}

