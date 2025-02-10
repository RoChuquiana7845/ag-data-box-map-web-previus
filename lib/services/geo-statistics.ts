"use server"

import type { GeoStatistic, GeoStatisticResponse, GeoStatisticsResponse } from "@/lib/types/geo-statistics"
import { axiosInstance } from "@/lib/utils/axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"

export async function createGeoStatistic(data: GeoStatistic): Promise<GeoStatisticResponse> {
  try {
    const response = await axiosInstance.post<GeoStatisticResponse>(`${BASE_URL}/geo-stadistic`, data)
    return response.data
  } catch (error) {
    console.error("Error creating geo-statistic:", error)
    throw error
  }
}

export async function getGeoStatistics(geometryId: string): Promise<GeoStatisticsResponse> {
  try {
    const response = await axiosInstance.get<GeoStatisticsResponse>(
      `${BASE_URL}/geo-stadistic?geometryId=${geometryId}`,
    )
    return response.data
  } catch (error) {
    console.error("Error fetching geo-statistics:", error)
    throw error
  }
}

