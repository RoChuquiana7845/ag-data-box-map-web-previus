import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import Logger from "@/lib/utils/logger"
import { axiosInstance } from "@/lib/utils/axios"
import type { AreaResponse } from "@/lib/types/area"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    Logger.info("Processing get area request", "AREAS_API", { id: params.id })

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

    const response = await axiosInstance.get<AreaResponse>(`${API_URL}/areas/${params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    Logger.error("Error in get area API", "AREAS_API", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching area",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    Logger.info("Processing update area request", "AREAS_API", { id: params.id })

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
    const response = await axiosInstance.put(`${API_URL}/areas/${params.id}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    Logger.error("Error in update area API", "AREAS_API", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error updating area",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    Logger.info("Processing delete area request", "AREAS_API", { id: params.id })

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

    await axiosInstance.delete(`${API_URL}/areas/${params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    Logger.error("Error in delete area API", "AREAS_API", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting area",
      },
      { status: 500 },
    )
  }
}

