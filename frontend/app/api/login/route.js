import { NextResponse } from "next/server"

const BACKEND_URL = "http://localhost:5000"

export async function POST(request) {
  try {
    const body = await request.json()

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const text = await backendRes.text()

    let data = null

    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    const response = NextResponse.json(
      data ?? { message: "Invalid backend response" },
      { status: backendRes.status }
    )

    // fetch() ที่ทำจาก server ฝั่ง Next.js ไปหา backend เป็นการคุยกัน
    // server-to-server ไม่ได้ทำให้ Set-Cookie ที่ backend ส่งมาไปถึง
    // browser จริงโดยอัตโนมัติ ต้องดึงมาแปะบน response ของเราเองตรงนี้
    const setCookie = backendRes.headers.get("set-cookie")

    if (setCookie) {
      response.headers.set("set-cookie", setCookie)
    }

    return response
  } catch (error) {
    console.error("POST /api/login error:", error)

    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 500 }
    )
  }
}
