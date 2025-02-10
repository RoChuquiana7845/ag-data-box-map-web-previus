import axios from "axios"
import Logger from "@/lib/utils/logger"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for logging
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1]

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    Logger.info(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, "API", {
      data: config.data,
      params: config.params,
      headers: config.headers,
    })

    return config
  },
  (error) => {
    Logger.error("[API Request Error]", "API", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for logging
axiosInstance.interceptors.response.use(
  (response) => {
    Logger.info(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, "API", {
      status: response.status,
      data: response.data,
    })
    return response
  },
  (error) => {
    Logger.error("[API Response Error]", "API", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    })

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = "/auth/login"
      return Promise.reject(new Error("Sesión expirada. Por favor, inicie sesión nuevamente."))
    }

    if (error.response?.status === 403) {
      return Promise.reject(new Error("No tiene permisos para realizar esta acción."))
    }

    if (error.response?.status === 404) {
      return Promise.reject(new Error("El recurso solicitado no existe."))
    }

    if (error.response?.status === 409) {
      return Promise.reject(new Error("Ya existe un proyecto con ese nombre."))
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error("Error de conexión. Por favor, verifique su conexión a internet."))
    }

    // Handle other errors
    return Promise.reject(error.response?.data?.message || "Ha ocurrido un error. Por favor, inténtelo nuevamente.")
  },
)

