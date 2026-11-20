import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL

export async function GET(
  req,
  { params }
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
      { message: "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ” เธเธฃเธธเธ“เธฒเธฅเธญเธเนเธซเธกเน" },
      { status: 500 }
    )
  }
}
