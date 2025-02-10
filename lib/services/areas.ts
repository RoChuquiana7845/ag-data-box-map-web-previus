"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import Logger from "@/lib/utils/logger"
import { axiosInstance } from "@/lib/utils/axios"
import type { UserRole } from "@/lib/types/auth"
import type {
  Area,
  AreasResult,
  CreateAreaData,
  UpdateAreaData,
  AreaResponse,
  AreasResponse,
  AreaStatistics,
  AreaStatisticsResponse,
} from "@/lib/types/area"

// Get all areas with pagination and filters
export async function getAreas(params?: {
  page?: number
  limit?: number
  projectId?: string
  soilTypeId?: string
  search?: string
}): Promise<AreasResult> {
  try {
    Logger.info("Fetching areas", "AREAS_SERVICE", { params })

    const userRole = cookies().get("user-role")?.value as UserRole
    const userId = cookies().get("user-id")?.value

    // Build query params
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.projectId) queryParams.append("projectId", params.projectId)
    if (params?.soilTypeId) queryParams.append("soilTypeId", params.soilTypeId)
    if (params?.search) queryParams.append("search", params.search)

    const response = await axiosInstance.get<AreasResponse>(`/areas?${queryParams.toString()}`)
    let areas = response.data.data

    // Filter areas if user is User
    if (userRole === "User" && userId) {
      areas = areas.filter((area) => area.userId === userId)
    }

    Logger.info("Areas fetched successfully", "AREAS_SERVICE", {
      count: areas.length,
      role: userRole,
    })

    return {
      areas,
      pagination: response.data.pagination,
      isBackendError: false,
    }
  } catch (error) {
    Logger.error("Error fetching areas", "AREAS_SERVICE", error)
    return {
      areas: [],
      isBackendError: true,
    }
  }
}

// Get a single area
export async function getArea(id: string): Promise<Area> {
  try {
    Logger.info("Fetching area", "AREAS_SERVICE", { id })

    const response = await axiosInstance.get<AreaResponse>(`/areas/${id}`)
    return response.data.data
  } catch (error) {
    Logger.error("Error fetching area", "AREAS_SERVICE", { id, error })
    throw error
  }
}

// Create a new area
export async function createArea(data: CreateAreaData): Promise<Area> {
  try {
    Logger.info("Creating area", "AREAS_SERVICE")

    const userRole = cookies().get("user-role")?.value as UserRole

    // Only Admin and User can create areas
    if (!userRole || (userRole !== "Admin" && userRole !== "User")) {
      throw new Error("No tienes permisos para crear áreas")
    }

    const response = await axiosInstance.post<AreaResponse>("/areas", data)

    Logger.info("Area created successfully", "AREAS_SERVICE", {
      areaId: response.data.data.id,
      areaCode: response.data.data.code,
    })

    revalidatePath("/dashboard/areas")
    return response.data.data
  } catch (error) {
    Logger.error("Error creating area", "AREAS_SERVICE", error)
    throw error
  }
}

// Update an area
export async function updateArea(id: string, data: UpdateAreaData): Promise<Area> {
  try {
    Logger.info("Updating area", "AREAS_SERVICE", { id, data })

    const userRole = cookies().get("user-role")?.value as UserRole
    const userId = cookies().get("user-id")?.value

    // Check permissions
    if (!userRole) {
      throw new Error("No autorizado")
    }

    // If not admin, verify ownership
    if (userRole !== "Admin") {
      const area = await getArea(id)
      if (area.userId !== userId) {
        throw new Error("No tienes permisos para modificar esta área")
      }
    }

    const response = await axiosInstance.put<AreaResponse>(`/areas/${id}`, data)

    Logger.info("Area updated successfully", "AREAS_SERVICE", {
      areaId: id,
      updates: data,
    })

    revalidatePath("/dashboard/areas")
    return response.data.data
  } catch (error) {
    Logger.error("Error updating area", "AREAS_SERVICE", { id, data, error })
    throw error
  }
}

// Delete an area
export async function deleteArea(id: string): Promise<void> {
  try {
    Logger.info("Deleting area", "AREAS_SERVICE", { id })

    const userRole = cookies().get("user-role")?.value as UserRole
    const userId = cookies().get("user-id")?.value

    // Check permissions
    if (!userRole) {
      throw new Error("No autorizado")
    }

    // If not admin, verify ownership
    if (userRole !== "Admin") {
      const area = await getArea(id)
      if (area.userId !== userId) {
        throw new Error("No tienes permisos para eliminar esta área")
      }
    }

    await axiosInstance.delete(`/areas/${id}`)

    Logger.info("Area deleted successfully", "AREAS_SERVICE", {
      areaId: id,
    })

    revalidatePath("/dashboard/areas")
  } catch (error) {
    Logger.error("Error deleting area", "AREAS_SERVICE", { id, error })
    throw error
  }
}

// Get area statistics
export async function getAreaStatistics(id: string): Promise<AreaStatistics> {
  try {
    Logger.info("Fetching area statistics", "AREAS_SERVICE", { id })

    const response = await axiosInstance.get<AreaStatisticsResponse>(`/areas/${id}/statistics`)
    return response.data.data
  } catch (error) {
    Logger.error("Error fetching area statistics", "AREAS_SERVICE", { id, error })
    throw error
  }
}

