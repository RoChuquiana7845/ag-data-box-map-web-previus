"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import Logger from "@/lib/utils/logger"
import { axiosInstance } from "@/lib/utils/axios"
import type { UserRole } from "@/lib/types/auth"
import type { GeometryManagementResult, GeometryManagementResponse } from "@/lib/types/geometry-management"
import type { AreaGeometry } from "@/lib/types/geometry" // Import AreaGeometry

export async function getGeometryManagement(params?: {
  page?: number
  limit?: number
  areaId?: string
  projectId?: string
}): Promise<GeometryManagementResult> {
  try {
    Logger.info("Fetching geometry management", "GEOMETRY_MANAGEMENT_SERVICE", { params })

    const userRole = cookies().get("user-role")?.value as UserRole
    const userId = cookies().get("user-id")?.value

    // Build query params
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.areaId) queryParams.append("areaId", params.areaId)
    if (params?.projectId) queryParams.append("projectId", params.projectId)

    const response = await axiosInstance.get<GeometryManagementResponse>(
      `/api/geometries/management?${queryParams.toString()}`,
    )

    let geometries = response.data.data

    // Filter geometries if user is User
    if (userRole === "User" && userId) {
      geometries = geometries.filter((geom) => geom.area.userId === userId)
    }

    Logger.info("Geometry management fetched successfully", "GEOMETRY_MANAGEMENT_SERVICE", {
      count: geometries.length,
      role: userRole,
    })

    return {
      geometries,
      pagination: response.data.pagination,
      isBackendError: false,
    }
  } catch (error) {
    Logger.error("Error fetching geometry management", "GEOMETRY_MANAGEMENT_SERVICE", error)
    return {
      geometries: [],
      isBackendError: true,
    }
  }
}

export async function updateGeometryManagement(
  areaId: string,
  data: {
    geometry: AreaGeometry
  },
) {
  try {
    Logger.info("Updating geometry management", "GEOMETRY_MANAGEMENT_SERVICE", { areaId })

    const response = await axiosInstance.put(`/api/geometries/management/${areaId}`, data)

    Logger.info("Geometry management updated successfully", "GEOMETRY_MANAGEMENT_SERVICE", {
      areaId,
    })

    revalidatePath("/dashboard/geometries")
    return response.data
  } catch (error) {
    Logger.error("Error updating geometry management", "GEOMETRY_MANAGEMENT_SERVICE", { areaId, error })
    throw error
  }
}

