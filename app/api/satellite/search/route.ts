import { NextResponse } from "next/server"
import Logger from "@/lib/utils/logger"

const EOSDA_API_TOKEN =
  process.env.NEXT_PUBLIC_EOSDA_API_KEY

const EOSDA_API_URL = "https://api-connect.eos.com/api/lms/search/v2"

export async function POST(request: Request) {
  try {
    Logger.info("Iniciando búsqueda de imágenes satelitales", "EOSDA_PROXY")

    const body = await request.json()
    Logger.debug("Parámetros de búsqueda recibidos", "EOSDA_PROXY", body)

    const response = await fetch(EOSDA_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": EOSDA_API_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    Logger.info("Respuesta recibida de EOSDA", "EOSDA_PROXY", {
      status: response.status,
      data,
    })

    if (!response.ok) {
      throw new Error(`EOSDA API responded with status: ${response.status}`)
    }

    return NextResponse.json(data)
  } catch (error) {
    Logger.error(
      "Error en proxy EOSDA",
      "EOSDA_PROXY",
      error instanceof Error ? { message: error.message, stack: error.stack } : error,
    )

    return NextResponse.json({ error: "Error processing satellite imagery request" }, { status: 500 })
  }
}

