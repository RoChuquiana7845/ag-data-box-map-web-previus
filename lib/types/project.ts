export interface Project {
  id: string
  name: string
  description: string
  userId: string
  date: Date
}

export interface CreateProjectData {
  name: string
  description: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
}

export interface ProjectResponse {
  success: boolean
  data: Project
  message?: string
}

export interface ProjectsResponse {
  success: boolean
  data: Project[]
  message?: string
}

