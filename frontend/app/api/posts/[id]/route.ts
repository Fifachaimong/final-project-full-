import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || id === "undefined") {
      return NextResponse.json(
        { message: "Post id is required" },
        { status: 400 }
      )
    }

    const headerList = await headers()
    const cookie = headerList.get("cookie") ?? ""

    const response = await fetch(
      `http://localhost:5000/auth/posts/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Cookie: cookie,
        },
        cache: "no-store",
      }
    )

    const text = await response.text()

    let data = null

    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    return NextResponse.json(
      data ?? { message: "Invalid backend response" },
      { status: response.status }
    )
  } catch (error) {
    console.error("[api/posts/[id] GET] Error:", error)

    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 500 }
    )
  }
}