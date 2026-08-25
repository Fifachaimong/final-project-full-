import { NextResponse } from "next/server"
import { headers } from "next/headers"

const BACKEND_URL = "http://localhost:5000"

// ──────────────────────────────────────────────
// POST /api/apply/:postId
// สมัครงาน (apply) — proxy ไปที่ POST /apply/:postId
// รองรับ multipart/form-data: resume + transcript
// ──────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params

    if (!postId || postId === "undefined") {
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

    const formData = await request.formData()

    const response = await fetch(
      `${BACKEND_URL}/auth/apply/${encodeURIComponent(postId)}`,
      {
        method: "POST",
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
      "[api/apply/[postId] POST] Error:",
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