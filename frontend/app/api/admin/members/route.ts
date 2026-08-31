import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = "http://localhost:5000"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = searchParams.get("page") ?? "1"
    const limit = searchParams.get("limit") ?? "10"

    const backendParams = new URLSearchParams({
      page,
      limit,
    })

    const response = await fetch(
      `${BACKEND_URL}/admin/users?${backendParams.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: request.headers.get("cookie") ?? "",
        },
        cache: "no-store",
      }
    )

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error("GET /api/admin/members error:", error)

    return NextResponse.json(
      { error: "Cannot connect to backend" },
      { status: 500 }
    )
  }
}