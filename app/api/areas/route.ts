import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import Logger from "@/lib/utils/logger"
import { axiosInstance } from "@/lib/utils/axios"
import type { AreasResponse } from "@/lib/types/area"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: Request) {
  try {
    Logger.info("Processing areas request", "AREAS_API")

    // Get auth token from cookies
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado",
        },
        { status: 401 },
      )
    }

    // Forward the request to the backend
    const { searchParams } = new URL(request.url)
    const response = await axiosInstance.get<AreasResponse>(`${API_URL}/areas?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    Logger.error("Error in areas API", "AREAS_API", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error processing areas request",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    Logger.info("Processing create area request", "AREAS_API")

    const token = cookies().get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado",
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const response = await axiosInstance.post(`${API_URL}/areas`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    Logger.error("Error in create area API", "AREAS_API", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error creating area",
      },
      { status: 500 },
    )
  }
}

