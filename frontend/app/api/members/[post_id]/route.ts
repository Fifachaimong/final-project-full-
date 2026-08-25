import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      post_id: string
    }>
  }
) {
  try {
    const { post_id } = await params

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

    const cookie =
      headerList.get("cookie") ?? ""

    const response = await fetch(
      `http://localhost:5000/hr/members/${encodeURIComponent(
        post_id
      )}`,
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
        {
          status: response.status,
        }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(
      "GET api/hr/members/[post_id] error:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Cannot connect to backend",
      },
      {
        status: 500,
      }
    )
  }
}
