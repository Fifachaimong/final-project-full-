import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { jwtVerify } from "jose"
import type { Post, Applicant } from "@/app/api/posts/route"

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL is not set")
    pool = new Pool({ connectionString: url, ssl: false })
  }
  return pool
}

const secret = new TextEncoder().encode(process.env.JWT_TOKEN)

interface AuthPayload {
  id: string
  email: string
  role: string
}

async function getAuth(req: NextRequest): Promise<AuthPayload | null> {
  const cookieHeader = req.headers.get("cookie") ?? ""
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.split("=")[1]

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as AuthPayload
  } catch {
    return null
  }
}

// Roles allowed to see the applicant list for a post.
// Applicants should only see the post itself, not who else applied.
const CAN_VIEW_APPLICANTS = ["admin", "hr"]

// ──────────────────────────────────────────────
// GET /api/posts/[id]
// Returns { post, applicants }
// The post itself is viewable by anyone logged in, but the
// applicants array (other people's name/email/resume) is only
// included for admin/hr — this is the data an applicant should
// never receive, regardless of what the frontend renders.
// ──────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getPool()
    const { id } = await params

    const { rows: postRows } = await db.query<Post>(
      `SELECT * FROM posts WHERE id = $1`,
      [id]
    )

    if (!postRows[0]) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    let applicants: Applicant[] = []
    if (CAN_VIEW_APPLICANTS.includes(auth.role)) {
      const { rows } = await db.query<Applicant>(
        `SELECT * FROM applicants WHERE post_id = $1 ORDER BY applied_at ASC`,
        [id]
      )
      applicants = rows
    }

    return NextResponse.json({ post: postRows[0], applicants })
  } catch (err) {
    console.error("[api/posts/[id] GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}