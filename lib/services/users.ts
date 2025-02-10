"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import Logger from "@/lib/utils/logger"
import { axiosInstance } from "@/lib/utils/axios"
import type { User, UsersResponse, UserResponse } from "@/lib/types/user"
import type { UserRole } from "@/lib/types/auth"

export interface UsersResult {
  users: User[]
  isBackendError: boolean
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  role?: UserRole
}

// Get all users
export async function getUsers(): Promise<UsersResult> {
  try {
    Logger.info("Fetching users", "USERS_SERVICE")

    const userRole = cookies().get("user-role")?.value as UserRole

    // Only allow Admin to fetch users
    if (userRole !== "Admin") {
      throw new Error("No tienes permisos para ver los usuarios")
    }

    const response = await axiosInstance.get<UsersResponse>("/users")
    const users = response.data.data

    Logger.info("Users fetched successfully", "USERS_SERVICE", {
      count: users.length,
    })

    return {
      users,
      isBackendError: false,
    }
  } catch (error) {
    Logger.error("Error fetching users", "USERS_SERVICE", error)
    return {
      users: [],
      isBackendError: true,
    }
  }
}

// Get a single user
export async function getUser(id: string): Promise<User> {
  try {
    Logger.info("Fetching user", "USERS_SERVICE", { id })

    const response = await axiosInstance.get<UserResponse>(`/users/${id}`)
    return response.data.data
  } catch (error) {
    Logger.error("Error fetching user", "USERS_SERVICE", { id, error })
    throw error
  }
}

// Create a new user
export async function createUser(data: CreateUserData): Promise<User> {
  try {
    Logger.info("Creating user", "USERS_SERVICE")

    const response = await axiosInstance.post<UserResponse>("/users", data)

    Logger.info("User created successfully", "USERS_SERVICE", {
      userId: response.data.data.id,
    })

    revalidatePath("/dashboard/users")
    return response.data.data
  } catch (error) {
    Logger.error("Error creating user", "USERS_SERVICE", error)
    throw error
  }
}

// Update a user
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  try {
    Logger.info("Updating user", "USERS_SERVICE", { id })

    const response = await axiosInstance.patch<UserResponse>(`/users/${id}`, data)

    Logger.info("User updated successfully", "USERS_SERVICE", {
      userId: id,
    })

    revalidatePath("/dashboard/users")
    return response.data.data
  } catch (error) {
    Logger.error("Error updating user", "USERS_SERVICE", { id, error })
    throw error
  }
}

// Delete a user
export async function deleteUser(id: string): Promise<void> {
  try {
    Logger.info("Deleting user", "USERS_SERVICE", { id })

    await axiosInstance.delete(`/users/${id}`)

    Logger.info("User deleted successfully", "USERS_SERVICE", {
      userId: id,
    })

    revalidatePath("/dashboard/users")
  } catch (error) {
    Logger.error("Error deleting user", "USERS_SERVICE", { id, error })
    throw error
  }
}

