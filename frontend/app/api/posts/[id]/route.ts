import { NextResponse } from "next/server"
import { headers } from "next/headers"

const BACKEND_URL = "http://localhost:5000"

// ──────────────────────────────────────────────
// GET /api/posts/:id
// ดึงข้อมูลประกาศแบบเต็ม
// ──────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || id === "undefined") {
      return NextResponse.json(
        {
          message: "Post id is required",
        },
        {
          status: 400,
        }
      )
    }

    const headerList = await headers()
    const cookie = headerList.get("cookie") ?? ""

    const response = await fetch(
      `${BACKEND_URL}/auth/posts/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Cookie: cookie,
        },
        cache: "no-store",
      }
    )

    const text = await response.text()

    let data: unknown = null

    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    return NextResponse.json(
      data ?? {
        message: "Invalid backend response",
      },
      {
        status: response.status,
      }
    )
  } catch (error) {
    console.error(
      "[api/posts/[id] GET] Error:",
      error
    )

    return NextResponse.json(
      {
        message: "Cannot connect to backend",
      },
      {
        status: 500,
      }
    )
  }
}

// ──────────────────────────────────────────────
// PUT /api/posts/:id
// แก้ไขประกาศ
// รองรับ multipart/form-data + file
// ──────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || id === "undefined") {
      return NextResponse.json(
        {
          message: "Post id is required",
        },
        {
          status: 400,
        }
      )
    }

    const headerList = await headers()
    const cookie = headerList.get("cookie") ?? ""

    // รับ FormData จาก Frontend
    const formData = await request.formData()

    const response = await fetch(
      `${BACKEND_URL}/hr/posts/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          Cookie: cookie,
        },
        body: formData,
        cache: "no-store",
      }
    )

    const text = await response.text()

    let data: unknown = null

    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    return NextResponse.json(
      data ?? {
        message: "Invalid backend response",
      },
      {
        status: response.status,
      }
    )
  } catch (error) {
    console.error(
      "[api/posts/[id] PUT] Error:",
      error
    )

    return NextResponse.json(
      {
        message: "Cannot connect to backend",
      },
      {
        status: 500,
      }
    )
  }
}

// ──────────────────────────────────────────────
// DELETE /api/posts/:id
// ลบประกาศ
// ──────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || id === "undefined") {
      return NextResponse.json(
        {
          message: "Post id is required",
        },
        {
          status: 400,
        }
      )
    }

    const headerList = await headers()
    const cookie = headerList.get("cookie") ?? ""

    const response = await fetch(
      `${BACKEND_URL}/hr/posts/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookie,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    )

    const text = await response.text()

    let data: unknown = null

    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }
    }

    // Backend ลบสำเร็จแบบไม่มี body
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      })
    }

    return NextResponse.json(
      data ?? {
        message:
          response.ok
            ? "ลบประกาศสำเร็จ"
            : "ลบประกาศไม่สำเร็จ",
      },
      {
        status: response.status,
      }
    )
  } catch (error) {
    console.error(
      "[api/posts/[id] DELETE] Error:",
      error
    )

    return NextResponse.json(
      {
        message: "Cannot connect to backend",
      },
      {
        status: 500,
      }
    )
  }
}