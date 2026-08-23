import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET() {
  try {
    const headerList = await headers()
    const cookie = headerList.get("cookie") ?? ""

    const response = await fetch(
      "http://localhost:5000/auth/profile",
      {
        method: "GET",
        headers: {
          Cookie: cookie,
        },
        cache: "no-store",
      }
    )

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error("GET /api/me error:", error)

    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 500 }
    )
  }
}