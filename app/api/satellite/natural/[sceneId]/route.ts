import { NextResponse } from "next/server"

const API_KEY = process.env.NEXT_PUBLIC_EOSDA_API_KEY
const API_URL = "https://api-connect.eos.com/api/render"

export async function GET(request: Request, { params }: { params: { sceneId: string } }) {
  try {
    const sceneId = params.sceneId
    const { searchParams } = new URL(request.url)

    // Extraer los parámetros de la URL o usar valores por defecto
    const zoom = searchParams.get("z") || "10"
    const x = searchParams.get("x") || "0"
    const y = searchParams.get("y") || "0"

    // Determinar si es una imagen Sentinel-2 o Landsat
    const isSentinel = sceneId.startsWith("S2")

    // Construir la URL basada en el tipo de satélite
    let naturalUrl
    if (isSentinel) {
      // Ejemplo: S2C_tile_20250204_17MPT_0 -> S2/17/M/PT/2025/2/4/0
      const parts = sceneId.split("_")
      const date = parts[2] // 20250204
      const tile = parts[3] // 17MPT
      const version = parts[4] // 0

      const year = date.substring(0, 4)
      const month = Number.parseInt(date.substring(4, 6)).toString()
      const day = Number.parseInt(date.substring(6, 8)).toString()

      const tilePath = `${tile.substring(0, 2)}/${tile.substring(2, 3)}/${tile.substring(3, 5)}`
      naturalUrl = `${API_URL}/S2/${tilePath}/${year}/${month}/${day}/${version}/B04,B03,B02/${zoom}/${x}/${y}`
    } else {
      // Para Landsat, usar el sceneId directamente
      naturalUrl = `${API_URL}/L8/${sceneId}/B04,B03,B02/${zoom}/${x}/${y}`
    }

    console.log("Requesting Natural view from:", naturalUrl)

    const response = await fetch(naturalUrl, {
      headers: {
        Accept: "image/png",
        "x-api-key": API_KEY,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("EOSDA API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries()),
      })
      throw new Error(`Error al obtener vista natural: ${response.status} - ${errorText}`)
    }

    const imageData = await response.blob()

    // Verificar que realmente recibimos una imagen
    if (!imageData.type.startsWith("image/")) {
      throw new Error(`Tipo de contenido inesperado: ${imageData.type}`)
    }

    return new NextResponse(imageData, {
      headers: {
        "Content-Type": imageData.type,
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("Error al obtener vista natural:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud de vista natural",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

