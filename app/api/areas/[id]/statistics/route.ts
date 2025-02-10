import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import Logger from "@/lib/utils/logger"
import { axiosInstance } from "@/lib/utils/axios"
import type { AreaStatisticsResponse } from "@/lib/types/area"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    Logger.info("Processing area statistics request", "AREAS_API", { id: params.id })

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

    const response = await axiosInstance.get<AreaStatisticsResponse>(`${API_URL}/areas/${params.id}/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    Logger.error("Error in area statistics API", "AREAS_API", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching area statistics",
      },
      { status: 500 },
    )
  }
}

