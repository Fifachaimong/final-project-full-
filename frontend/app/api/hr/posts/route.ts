import { NextResponse } from "next/server"
import { headers } from "next/headers"

// เฉพาะ HR/Admin ที่ login แล้วเท่านั้น — คืนแค่โพสต์ที่ตัวเอง (owner_id) สร้างไว้
// ต่างจาก /api/posts (-> /auth/posts) ที่คืนโพสต์ของทุกคน และตอนนี้ backend
// บล็อก role "hr" ไม่ให้เรียก /auth/posts แล้ว (roleMiddleware('applicant', 'admin'))
export async function GET(request: Request) {
  try {
    const headerList = await headers()
    const cookie = headerList.get("cookie") ?? ""

    const { searchParams } = new URL(request.url)

    const page = searchParams.get("page") ?? "1"
    const limit = searchParams.get("limit") ?? "10"

    const backendParams = new URLSearchParams({
      page,
      limit,
    })

    const response = await fetch(
      `http://localhost:5000/hr/posts?${backendParams.toString()}`,
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
    console.error("GET /api/hr/posts error:", error)

    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 500 }
    )
  }
}