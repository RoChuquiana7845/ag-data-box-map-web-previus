export type UserRole = "User" | "Analyst" | "Admin"

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  name: string
  password: string
  role: UserRole
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (response: AuthResponse) => void
  logout: () => void
}

