import type { UserRole } from "./auth"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  status: "active" | "inactive"
}

export interface UsersResponse {
  success: boolean
  data: User[]
  message?: string
}

export interface UserResponse {
  success: boolean
  data: User
  message?: string
}

