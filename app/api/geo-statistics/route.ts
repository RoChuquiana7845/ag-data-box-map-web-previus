import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.geometryId || !data.ndviValue || !data.date) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const geoStatistic = await db.geoStatistic.create({
      data: {
        geometryId: data.geometryId,
        ndviValue: data.ndviValue,
        cloudCoverage: data.cloudCoverage,
        date: new Date(data.date),
        elevation: data.elevation,
        slope: data.slope,
        aspect: data.aspect,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json({ success: true, data: geoStatistic })
  } catch (error) {
    console.error("Error creating geo-statistic:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const geometryId = searchParams.get("geometryId")

    if (!geometryId) {
      return NextResponse.json({ success: false, message: "Geometry ID is required" }, { status: 400 })
    }

    const geoStatistics = await db.geoStatistic.findMany({
      where: {
        geometryId,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json({ success: true, data: geoStatistics })
  } catch (error) {
    console.error("Error fetching geo-statistics:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

