"use server"

import { cookies } from "next/headers"
import Logger from "@/lib/utils/logger"
import { axiosInstance } from "@/lib/utils/axios"
import type { UserRole } from "@/lib/types/auth"
import type {
  AreaGeometry,
  GeometryQueryParams,
  GeometriesResponse,
  GeometryResponse,
  GeometryStyle,
} from "@/lib/types/geometry"
import type * as GeoJSON from "geojson"

export async function getGeometries(params?: GeometryQueryParams): Promise<AreaGeometry[]> {
  try {
    Logger.info("Fetching geometries", "GEOMETRIES_SERVICE", { params })

    const userRole = cookies().get("user-role")?.value as UserRole
    const userId = cookies().get("user-id")?.value

    // Build query params
    const queryParams = new URLSearchParams()
    if (params?.bbox) {
      queryParams.append("bbox", params.bbox.join(","))
    }
    if (params?.simplified !== undefined) {
      queryParams.append("simplified", params.simplified.toString())
    }
    if (params?.projectId) {
      queryParams.append("projectId", params.projectId)
    }

    const response = await axiosInstance.get<GeometriesResponse>(`/geometries?${queryParams.toString()}`)

    let geometries = response.data.data

    // Filter geometries if user is User
    if (userRole === "User" && userId) {
      geometries = geometries.filter((geom) => geom.userId === userId)
    }

    Logger.info("Geometries fetched successfully", "GEOMETRIES_SERVICE", {
      count: geometries.length,
      role: userRole,
    })

    return geometries
  } catch (error) {
    Logger.error("Error fetching geometries", "GEOMETRIES_SERVICE", error)
    return []
  }
}

export async function getGeometry(areaId: string): Promise<AreaGeometry | null> {
  try {
    Logger.info("Fetching geometry", "GEOMETRIES_SERVICE", { areaId })

    const response = await axiosInstance.get<GeometryResponse>(`/geometries/${areaId}`)
    return response.data.data
  } catch (error) {
    Logger.error("Error fetching geometry", "GEOMETRIES_SERVICE", {
      areaId,
      error,
    })
    return null
  }
}

export async function updateGeometry(
  areaId: string,
  data: { geom: GeoJSON.Polygon; style: GeometryStyle } | null,
): Promise<AreaGeometry | null> {
  try {
    Logger.info("Updating geometry", "GEOMETRIES_SERVICE", { areaId })

    const response = await axiosInstance.put<GeometryResponse>(`/geometries/${areaId}`, data)

    Logger.info("Geometry updated successfully", "GEOMETRIES_SERVICE", {
      areaId,
    })

    return response.data.data
  } catch (error) {
    Logger.error("Error updating geometry", "GEOMETRIES_SERVICE", {
      areaId,
      error,
    })
    return null
  }
}

