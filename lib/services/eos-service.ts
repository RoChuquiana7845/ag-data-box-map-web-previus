import Logger from "@/lib/utils/logger"

export interface SatelliteImage {
  date: string
  sceneID: string
  cloudCoverage: number
  satellite: string
  tms: string
  view_id: string
  thumbnail?: string
  dataCoveragePercentage?: number
}

interface SearchResponse {
  meta: {
    found: number
    name: string
    page: number
    limit: number
  }
  results: SatelliteImage[]
}

export async function searchSatelliteImages(
  coordinates: [number, number][],
  startDate: string,
  endDate: string,
  page = 1,
  limit = 10,
): Promise<SearchResponse> {
  try {
    Logger.info("Starting satellite image search", "EOSService", {
      coordinates,
      startDate,
      endDate,
      page,
      limit,
    })

    const searchBody = {
      fields: ["cloudCoverage", "sceneID", "date", "productID", "dataCoveragePercentage"],
      onAmazon: true,
      page: page,
      limit: limit,
      search: {
        satellites: ["landsat9", "landsat8", "sentinel2l2a"],
        date: {
          from: startDate,
          to: endDate,
        },
        cloudCoverage: {
          from: 0,
          to: 50,
        },
        shape: {
          type: "Polygon",
          coordinates: [coordinates],
        },
      },
    }

    const response = await fetch("/api/satellite/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchBody),
    })

    Logger.info("Satellite search response received", "EOSService", {
      status: response.status,
      response: response,
    })

    const responseText = await response.text()
    Logger.debug("Raw satellite search response", "EOSService", { responseText })

    let data
    try {
      data = JSON.parse(responseText)
      Logger.debug("Parsed satellite search response", "EOSService", { data })
    } catch (e) {
      Logger.error("Error parsing satellite search JSON response", "EOSService", { error: e, responseText })
      throw new Error("Error al parsear la respuesta del servidor")
    }

    if (!response.ok) {
      throw new Error(data.details || data.error || `Error en la petición: ${response.status}`)
    }

    if ("error" in data) {
      throw new Error(data.details || data.error)
    }

    return data
  } catch (error) {
    Logger.error("Detailed error in satellite image search", "EOSService", { error })
    throw error
  }
}

export async function getNDVIImage(
  sceneID: string,
  zoom = 10,
  x = 0,
  y = 0,
  options: {
    calibrate?: boolean
    clustering?: "kmeans" | "natural"
    clustersNo?: number
    minArea?: number
  } = {},
): Promise<string> {
  try {
    Logger.info("Requesting NDVI image", "EOSService", {
      sceneID,
      zoom,
      x,
      y,
      options,
    })

    const url = new URL(`/api/satellite/ndvi/${sceneID}`, window.location.origin)
    url.searchParams.set("z", zoom.toString())
    url.searchParams.set("x", x.toString())
    url.searchParams.set("y", y.toString())

    if (options.calibrate !== undefined) {
      url.searchParams.set("CALIBRATE", options.calibrate ? "1" : "0")
    }
    if (options.clustering) {
      url.searchParams.set("CLUSTERING", options.clustering)
    }
    if (options.clustersNo) {
      url.searchParams.set("CLUSTERS_NO", options.clustersNo.toString())
    }
    if (options.minArea) {
      url.searchParams.set("MIN_AREA", options.minArea.toString())
    }

    Logger.debug("NDVI request URL", "EOSService", {
      url: url.toString(),
    })

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.details || errorData.error || `Error al obtener imagen NDVI: ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.startsWith("image/")) {
      throw new Error(`Tipo de contenido inesperado: ${contentType}`)
    }

    const blob = await response.blob()
    const imageUrl = URL.createObjectURL(blob)

    Logger.info("NDVI image processed successfully", "EOSService", {
      sceneID,
      size: blob.size,
      type: blob.type,
    })

    return imageUrl
  } catch (error) {
    Logger.error("Error fetching NDVI image", "EOSService", { error })
    throw error
  }
}

export async function getNaturalImage(sceneID: string, zoom = 15, x = 0, y = 0): Promise<string> {
  try {
    Logger.info("Requesting natural image", "EOSService", {
      sceneID,
      zoom,
      x,
      y,
    })

    const url = new URL(`/api/satellite/natural/${sceneID}`, window.location.origin)
    url.searchParams.set("z", zoom.toString())
    url.searchParams.set("x", x.toString())
    url.searchParams.set("y", y.toString())

    Logger.debug("Natural image request URL", "EOSService", {
      url: url.toString(),
    })

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.details || errorData.error || `Error al obtener imagen natural: ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.startsWith("image/")) {
      throw new Error(`Tipo de contenido inesperado: ${contentType}`)
    }

    const blob = await response.blob()
    const imageUrl = URL.createObjectURL(blob)

    Logger.info("Natural image processed successfully", "EOSService", {
      sceneID,
      size: blob.size,
      type: blob.type,
    })

    return imageUrl
  } catch (error) {
    Logger.error("Error fetching natural image", "EOSService", { error })
    throw error
  }
}

