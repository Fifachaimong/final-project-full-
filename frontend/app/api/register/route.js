import { NextResponse } from "next/server"

const BACKEND_URL = "http://localhost:5000"

export async function POST(request) {
  try {
    const body = await request.json()

    const backendRes = await fetch(`${BACKEND_URL}/auth/register`, {
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

    return NextResponse.json(
      data ?? { message: "Invalid backend response" },
      { status: backendRes.status }
    )
  } catch (error) {
    console.error("POST /api/register error:", error)

    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 500 }
    )
  }
}
