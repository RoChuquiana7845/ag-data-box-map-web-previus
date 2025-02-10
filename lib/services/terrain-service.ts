import Logger from "@/lib/utils/logger"

const API_KEY = process.env.NEXT_PUBLIC_EOSDA_API_KEY
const TERRAIN_API_URL = "https://api-connect.eos.com/api/render/terrain"
const TERRAIN_POINT_API_URL = "https://api-connect.eos.com/api/render/terrain/point"

interface TerrainOptions {
  format: "hillshade" | "slope" | "geotiff"
  azimuth?: number
  altitude?: number
  colormap?: string
  slopeRange?: string
}

function validateApiKey(): void {
  if (!API_KEY) {
    throw new Error("EOSDA API key is not configured")
  }
}

function sanitizeUrlForLogs(url: URL): string {
  const sanitizedUrl = new URL(url)
  sanitizedUrl.searchParams.set('api_key', '[REDACTED]')
  return sanitizedUrl.toString()
}

export async function getTerrainImage(zoom: number, x: number, y: number, options: TerrainOptions): Promise<string> {
  try {
    validateApiKey()

    const url = new URL(`${TERRAIN_API_URL}/${zoom}/${x}/${y}`)
    url.searchParams.set("api_key", API_KEY)
    url.searchParams.set("format", options.format)

    if (options.format === "hillshade" && options.azimuth && options.altitude) {
      url.searchParams.set("azimuth", options.azimuth.toString())
      url.searchParams.set("altitude", options.altitude.toString())
    } else if (options.format === "slope" && options.colormap && options.slopeRange) {
      url.searchParams.set("colormap", options.colormap)
      url.searchParams.set("slopeRange", options.slopeRange)
    }

    Logger.debug("Requesting terrain image from EOSDA", "TerrainService", {
      url: sanitizeUrlForLogs(url),
      options,
      coordinates: { zoom, x, y },
    })

    const response = await fetch(url)
    Logger.debug("EOSDA terrain image response received", "TerrainService", {
      status: response.status,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.details || errorData.error || `Error fetching terrain image from EOSDA: ${response.status}`,
      )
    }

    const blob = await response.blob()
    const imageUrl = URL.createObjectURL(blob)
    Logger.info("EOSDA terrain image successfully retrieved", "TerrainService", {
      format: options.format,
      size: blob.size,
    })

    return imageUrl
  } catch (error) {
    Logger.error("Failed to get terrain image from EOSDA", "TerrainService", {
      error: error instanceof Error ? error.message : "Unknown error",
      options,
      coordinates: { zoom, x, y },
    })
    throw error
  }
}

export async function getPointElevation(lat: number, lng: number): Promise<number> {
  try {
    validateApiKey()

    const url = new URL(`${TERRAIN_POINT_API_URL}/${lat}/${lng}`)
    url.searchParams.set("api_key", API_KEY)

    Logger.debug("Requesting elevation data from EOSDA", "TerrainService", {
      url: sanitizeUrlForLogs(url),
      coordinates: { lat, lng },
    })

    const response = await fetch(url)
    Logger.debug("EOSDA elevation response received", "TerrainService", {
      status: response.status,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.details || errorData.error || `Error fetching elevation data from EOSDA: ${response.status}`,
      )
    }

    const data = await response.json()
    Logger.debug("EOSDA elevation data parsed", "TerrainService", { data })

    if (typeof data.elevation !== "number" && typeof data.index_value !== "number") {
      Logger.error("Invalid elevation data structure from EOSDA", "TerrainService", { data })
      throw new Error("Invalid elevation data structure from EOSDA")
    }

    const elevation = data.elevation || data.index_value
    Logger.info("EOSDA elevation data successfully retrieved", "TerrainService", {
      coordinates: { lat, lng },
      elevation,
    })

    return elevation
  } catch (error) {
    Logger.error("Failed to get elevation data from EOSDA", "TerrainService", {
      error: error instanceof Error ? error.message : "Unknown error",
      coordinates: { lat, lng },
    })
    throw error
  }
}

