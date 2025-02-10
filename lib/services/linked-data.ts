"use server"

import { cookies } from "next/headers"
import Logger from "@/lib/utils/logger"
import { axiosInstance } from "@/lib/utils/axios"
import type { UserRole } from "@/lib/types/auth"
import type { LinkedDataResult, LinkedDataResponse } from "@/lib/types/linked-data"

export async function getLinkedData(projectId: string): Promise<LinkedDataResult> {
  try {
    Logger.info("Fetching linked data", "LINKED_DATA_SERVICE", { projectId })

    const userRole = cookies().get("user-role")?.value as UserRole
    const userId = cookies().get("user-id")?.value

    const response = await axiosInstance.get<LinkedDataResponse>(`/api/linked-data/${projectId}`)
    let data = response.data.data

    // Filter data if user is not admin or analyst
    if (userRole === "User" && userId) {
      data = {
        ...data,
        areas: data.areas.filter((area) => area.userId === userId),
      }
    }

    Logger.info("Linked data fetched successfully", "LINKED_DATA_SERVICE", {
      projectId,
      areasCount: data.areas.length,
      role: userRole,
    })

    return {
      data,
      isBackendError: false,
    }
  } catch (error) {
    Logger.error("Error fetching linked data", "LINKED_DATA_SERVICE", error)
    return {
      data: null,
      isBackendError: true,
    }
  }
}

