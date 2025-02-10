"use server"

import { axiosInstance } from "@/lib/utils/axios"
import type { LoginData, RegisterData, AuthResponse } from "@/lib/types/auth"

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>("/auth/login", data)
  return response.data
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>("/auth/register", data)
  return response.data
}

export async function getProfile(token: string): Promise<AuthResponse> {
  const response = await axiosInstance.get<AuthResponse>("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function logout(): Promise<void> {
  await axiosInstance.post("/auth/logout")
}

