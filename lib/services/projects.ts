"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import Logger from "@/lib/utils/logger"
import { axiosInstance } from "@/lib/utils/axios"
import type {
  CreateProjectData,
  UpdateProjectData,
  Project,
  ProjectResponse,
  ProjectsResponse,
  ProjectsResult,
} from "@/lib/types/project"
import type { UserRole } from "@/lib/types/auth"

export async function getProjects(): Promise<ProjectsResult> {
  try {
    Logger.info("Fetching projects", "PROJECTS_SERVICE")

    const userRole = cookies().get("user-role")?.value as UserRole
    const userId = cookies().get("user-id")?.value

    const response = await axiosInstance.get<ProjectsResponse>("/projects")
    let projects = response.data.data

    // Filtrar proyectos solo si el usuario es User
    if (userRole === "User" && userId) {
      projects = projects.filter((project) => project.userId === userId)
    }
    // Admin y Analyst ven todos los proyectos

    Logger.info("Projects fetched successfully", "PROJECTS_SERVICE", {
      count: projects.length,
      role: userRole,
    })

    return {
      projects,
      isBackendError: false,
    }
  } catch (error) {
    Logger.error("Error fetching projects", "PROJECTS_SERVICE", error)
    return {
      projects: [],
      isBackendError: true,
    }
  }
}

export async function createProject(data: CreateProjectData): Promise<Project> {
  try {
    const userRole = cookies().get("user-role")?.value as UserRole

    // Only allow Admin and User roles to create projects
    if (!userRole || (userRole !== "Admin" && userRole !== "User")) {
      throw new Error("No tienes permisos para crear proyectos")
    }

    Logger.info("Creating project", "PROJECTS_SERVICE", { data })

    const response = await axiosInstance.post<ProjectResponse>("/projects", data)

    Logger.info("Project created successfully", "PROJECTS_SERVICE", {
      projectId: response.data.data.id,
      projectName: response.data.data.name,
    })

    revalidatePath("/dashboard")
    return response.data.data
  } catch (error) {
    Logger.error("Error creating project", "PROJECTS_SERVICE", { data, error })
    throw error
  }
}

export async function updateProject(id: string, data: UpdateProjectData): Promise<Project> {
  try {
    Logger.info("Updating project", "PROJECTS_SERVICE", { id, data })

    const userRole = cookies().get("user-role")?.value as UserRole
    const userId = cookies().get("user-id")?.value

    // Verificar permisos
    if (!userRole) {
      throw new Error("No autorizado")
    }

    // Si no es admin, verificar que sea el propietario
    if (userRole !== "Admin") {
      const project = await getProject(id)
      if (project.userId !== userId) {
        throw new Error("No tienes permisos para modificar este proyecto")
      }
    }

    const response = await axiosInstance.patch<ProjectResponse>(`/projects/${id}`, data)

    Logger.info("Project updated successfully", "PROJECTS_SERVICE", {
      projectId: id,
      updates: data,
    })

    revalidatePath("/dashboard")
    return response.data.data
  } catch (error) {
    Logger.error("Error updating project", "PROJECTS_SERVICE", { id, data, error })
    throw error
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    Logger.info("Deleting project", "PROJECTS_SERVICE", { id })

    const userRole = cookies().get("user-role")?.value as UserRole
    const userId = cookies().get("user-id")?.value

    // Verificar permisos
    if (!userRole) {
      throw new Error("No autorizado")
    }

    // Si no es admin, verificar que sea el propietario
    if (userRole !== "Admin") {
      const project = await getProject(id)
      if (project.userId !== userId) {
        throw new Error("No tienes permisos para eliminar este proyecto")
      }
    }

    await axiosInstance.delete(`/projects/${id}`)

    Logger.info("Project deleted successfully", "PROJECTS_SERVICE", {
      projectId: id,
    })

    revalidatePath("/dashboard")
  } catch (error) {
    Logger.error("Error deleting project", "PROJECTS_SERVICE", { id, error })
    throw error
  }
}

async function getProject(id: string): Promise<Project> {
  try {
    const response = await axiosInstance.get<ProjectResponse>(`/projects/${id}`)
    return response.data.data
  } catch (error) {
    throw error
  }
}

