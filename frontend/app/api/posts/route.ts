import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET(request: Request) {
  try {
    const headerList = await headers()
    const cookie = headerList.get("cookie") ?? ""

    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search") ?? ""
    const filter = searchParams.get("filter") ?? "all"
    const page = searchParams.get("page") ?? "1"
    const limit = searchParams.get("limit") ?? "10"

    const backendParams = new URLSearchParams({
      search,
      filter,
      page,
      limit,
    })

    const response = await fetch(
      `http://localhost:5000/auth/posts?${backendParams.toString()}`,
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

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.error ||
            `Backend error (${response.status})`,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("GET /api/posts error:", error)

    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 500 }
    )
  }
}


export async function POST(request: Request) {
  try {
    const headerList = await headers()
    const cookie = headerList.get("cookie") ?? ""

    const formData = await request.formData()

    const response = await fetch(
      "http://localhost:5000/hr/posts",
      {
        method: "POST",
        headers: {
          Cookie: cookie,
        },
        body: formData,
      }
    )

    const text = await response.text()

    let data = null

    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.error ||
            `Backend error (${response.status})`,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error("POST /api/posts error:", error)

    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 500 }
    )
  }
}