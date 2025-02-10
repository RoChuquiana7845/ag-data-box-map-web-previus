"use server"

import axios, { type AxiosError } from "axios"
import Logger from "@/lib/utils/logger"

export interface EOSDAError {
  type: "network" | "auth" | "notFound" | "unknown"
  message: string
}

export interface SearchParams {
  bbox: [number, number, number, number]
  dateFrom: string
  dateTo: string
  satellite: "sentinel-2" | "landsat-8"
}

export async function searchSatelliteImages(params: SearchParams) {
  try {
    Logger.info("Iniciando búsqueda de imágenes satelitales", "EOSDA_API", params)

    const response = await axios.post("/api/satellite/search", {
      bbox: params.bbox,
      dates: {
        from: params.dateFrom,
        to: params.dateTo,
      },
      dataset: params.satellite,
      cloudCoverage: {
        from: 0,
        to: 20,
      },
      sortBy: "cloudCoverage",
      sortOrder: "asc",
      limit: 1,
    })

    Logger.info("Respuesta recibida", "EOSDA_API", {
      status: response.status,
      data: response.data,
    })

    // Si la respuesta está vacía, significa que no hay imágenes
    if (!response.data.features?.length) {
      Logger.warn("No se encontraron imágenes", "EOSDA_API", {
        bbox: params.bbox,
        dates: { from: params.dateFrom, to: params.dateTo },
      })

      throw {
        type: "notFound",
        message:
          "No hay imágenes satelitales disponibles para esta ubicación en el rango de fechas seleccionado. Por favor, intente en otra área o modifique el rango de fechas.",
      } as EOSDAError
    }

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError

      Logger.error("Error en petición EOSDA", "EOSDA_API", {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        config: axiosError.config,
      })

      // Error de red (sin conexión, CORS, etc.)
      if (!axiosError.response) {
        throw {
          type: "network",
          message:
            "El servicio de imágenes satelitales no está disponible en este momento. Visualizando imágenes de Mapbox como alternativa.",
        } as EOSDAError
      }

      // Error de autenticación
      if (axiosError.response.status === 401 || axiosError.response.status === 403) {
        throw {
          type: "auth",
          message:
            "No se pudo verificar el acceso al servicio de imágenes satelitales. Por favor, contacte al administrador.",
        } as EOSDAError
      }
    }

    // Si es nuestro error personalizado de "no encontrado", lo propagamos
    if ((error as EOSDAError).type === "notFound") {
      throw error
    }

    Logger.error("Error inesperado", "EOSDA_API", error)

    // Cualquier otro error
    throw {
      type: "unknown",
      message: "Error inesperado al buscar imágenes satelitales",
    } as EOSDAError
  }
}

