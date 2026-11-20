import { NextResponse } from "next/server"
import { headers } from "next/headers"

const BACKEND_URL = process.env.BACKEND_URL

// โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
// GET /api/posts/:id
// เธ”เธถเธเธเนเธญเธกเธนเธฅเธเธฃเธฐเธเธฒเธจเนเธเธเน€เธ•เนเธก
// โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params

    if (!id || id === "undefined") {
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

    const response = await fetch(
      `${BACKEND_URL}/auth/posts/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Cookie: cookie,
        },
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
      "[api/posts/[id] GET] Error:",
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

// โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
// PUT /api/posts/:id
// เนเธเนเนเธเธเธฃเธฐเธเธฒเธจ
// เธฃเธญเธเธฃเธฑเธ multipart/form-data + file
// โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params

    if (!id || id === "undefined") {
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

    // เธฃเธฑเธ FormData เธเธฒเธ Frontend
    const formData = await request.formData()

    const response = await fetch(
      `${BACKEND_URL}/hr/posts/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          Cookie: cookie,
        },
        body: formData,
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
      "[api/posts/[id] PUT] Error:",
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

// โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
// DELETE /api/posts/:id
// เธฅเธเธเธฃเธฐเธเธฒเธจ
// โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params

    if (!id || id === "undefined") {
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

    const response = await fetch(
      `${BACKEND_URL}/hr/posts/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookie,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    )

    const text = await response.text()

    let data = null

    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }
    }

    // Backend เธฅเธเธชเธณเน€เธฃเนเธเนเธเธเนเธกเนเธกเธต body
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      })
    }

    return NextResponse.json(
      data ?? {
        message:
          response.ok
            ? "เธฅเธเธเธฃเธฐเธเธฒเธจเธชเธณเน€เธฃเนเธ"
            : "เธฅเธเธเธฃเธฐเธเธฒเธจเนเธกเนเธชเธณเน€เธฃเนเธ",
      },
      {
        status: response.status,
      }
    )
  } catch (error) {
    console.error(
      "[api/posts/[id] DELETE] Error:",
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
