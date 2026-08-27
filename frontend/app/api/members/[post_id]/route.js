import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET(request, { params }) {
  try {
    const { post_id } = await params

    console.log(
      "[GET /api/members/[post_id]] post_id:",
      post_id
    )

    if (!post_id) {
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
    const cookie = headerList.get("cookie") ?? ""

    const backendUrl =
      `http://localhost:5000/hr/posts/${encodeURIComponent(post_id)}/members`

    console.log(
      "[GET /api/members/[post_id]] Backend:",
      backendUrl
    )

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Cookie: cookie,
      },
      cache: "no-store",
    })

    const text = await response.text()

    console.log(
      "[GET /api/members/[post_id]] Backend status:",
      response.status
    )

    console.log(
      "[GET /api/members/[post_id]] Backend response:",
      text
    )

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
          data,
        },
        {
          status: response.status,
        }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(
      "[GET /api/members/[post_id]] error:",
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
