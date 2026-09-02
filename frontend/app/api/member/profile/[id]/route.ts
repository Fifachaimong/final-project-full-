import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = "http://localhost:5000"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/hr/members/${encodeURIComponent(id)}/profile`,
      {
        method: "GET",
        headers: {
          Cookie: req.headers.get("cookie") ?? "",
        },
        cache: "no-store",
      }
    )

    const data = await backendRes.json().catch(() => null)

    return NextResponse.json(data, { status: backendRes.status })
  } catch (err) {
    console.error("[API] /api/members/profile/[id] error:", err)

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    )
  }
}