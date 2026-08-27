import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET(request, { params }) {
  try {
    const { id } = await params

    console.log(
      "[GET /api/members/[id]] post_id:",
      id
    )

    if (!id) {
      return NextResponse.json(
        {
          message: "Post ID is required",
        },
        {
          status: 400,
        }
      )
    }

    const headerList = await headers()

    const cookie =
      headerList.get("cookie") ?? ""

    const backendUrl =
      `http://localhost:5000/hr/members/${encodeURIComponent(id)}`

    console.log(
      "[GET /api/members/[id]] Backend:",
      backendUrl
    )

    const response = await fetch(
      backendUrl,
      {
        method: "GET",
        headers: {
          Cookie: cookie,
        },
        cache: "no-store",
      }
    )

    const text =
      await response.text()

    let data = null

    try {
      data = text
        ? JSON.parse(text)
        : null
    } catch {
      data = text || null
    }

    console.log(
      "[GET /api/members/[id]] Backend status:",
      response.status
    )

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.error ||
            `Backend error (${response.status})`,
          data,
        },
        {
          status: response.status,
        }
      )
    }

    return NextResponse.json(
      data,
      {
        status: 200,
      }
    )
  } catch (error) {
    console.error(
      "GET api/members/[id] error:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Cannot connect to backend",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    )
  }
}
