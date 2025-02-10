import type * as GeoJSON from "geojson"

export interface Area {
  id: string
  code: string
  description: string
  size: number
  user_id: string
  geom: GeoJSON.Polygon
}

export interface SamplePoint {
  id: string
  sample_id: string
  geom: GeoJSON.Point
  value: number
  type: string
  status: "active" | "inactive"
}

export interface SatelliteImage {
  id: string
  name: string
  region_id: string
  image_url: string
  date: string
  satellite: string
  ndvi?: number
  evi?: number
}

export interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch: number
  bearing: number
}

export interface LayerVisibility {
  areas: boolean
  sensors: boolean
  satellite: boolean
}

