import { NextResponse } from "next/server"
import { headers } from "next/headers"

const BACKEND_URL = "https://final-project-full.onrender.com"

export async function POST(request) {
  try {
    const headerList = await headers()
    const cookie = headerList.get("cookie") ?? ""

    const body = await request.text()

    const response = await fetch(
      `${BACKEND_URL}/applicant/upload-signature`,
      {
        method: "POST",
        headers: {
          Cookie: cookie,
          "Content-Type": "application/json",
        },
        body,
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
      data ?? {
        message: "Invalid backend response",
      },
      {
        status: response.status,
      }
    )
  } catch (error) {
    console.error(
      "[api/upload-signature POST] Error:",
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
