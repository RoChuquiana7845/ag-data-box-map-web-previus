export interface GeoStatistic {
  id?: string
  geometryId: string
  ndviValue: number
  cloudCoverage: number
  date: string
  elevation?: number
  slope?: number
  aspect?: number
}

export interface GeoStatisticResponse {
  success: boolean
  data: GeoStatistic
  message?: string
}

export interface GeoStatisticsResponse {
  success: boolean
  data: GeoStatistic[]
  message?: string
}

