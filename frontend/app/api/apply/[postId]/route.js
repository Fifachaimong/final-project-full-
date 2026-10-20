import { NextResponse } from "next/server"
import { headers } from "next/headers"

const BACKEND_URL = "https://final-project-full.onrender.com"

export const maxDuration = 60

export async function POST(
  request,
  { params }
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

    const isJson = (
      request.headers.get("content-type") ?? ""
    ).includes("application/json")

    const body = isJson
      ? await request.text()
      : await request.formData()

    const response = await fetch(
      `${BACKEND_URL}/applicant/apply/${encodeURIComponent(postId)}`,
      {
        method: "POST",
        headers: isJson
          ? {
              Cookie: cookie,
              "Content-Type": "application/json",
            }
          : {
              Cookie: cookie,
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