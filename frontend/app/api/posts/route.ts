import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { jwtVerify } from "jose"

// ──────────────────────────────────────────────
// Type exports (used by the page components)
// ──────────────────────────────────────────────
export interface Post {
  id: string
  title: string
  faculty: string
  description: string
  deadline: string
  logo_url: string | null
  is_open: boolean
  owner_id: string
  owner_name: string | null
  created_at: string
}

export interface Applicant {
  id: string
  post_id: string
  user_id: string
  name: string
  lastname: string
  email: string
  resume_url: string | null
  applied_at: string
}

// ──────────────────────────────────────────────
// Singleton pool
// ──────────────────────────────────────────────
let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL is not set")
    pool = new Pool({ connectionString: url, ssl: false })
  }
  return pool
}

// ──────────────────────────────────────────────
// Auth helper — verifies the JWT from the "token" cookie and
// returns the decoded payload (id, email, role). Never trust
// role/owner info sent in the request body/query — always read
// it from the verified token instead.
// ──────────────────────────────────────────────
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

// Roles allowed to create / delete posts. Adjust to match your
// `roles.role_name` values (e.g. "admin", "hr").
const CAN_MANAGE_POSTS = ["admin", "hr"]

// ──────────────────────────────────────────────
// Ensure tables exist on first call
// ──────────────────────────────────────────────
async function ensureTables(client: Pool) {
    // Check current type of posts.id — if it's not uuid, recreate tables
  const { rows: colCheck } = await client.query(`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'id'
    LIMIT 1
  `)

  if (colCheck.length > 0 && colCheck[0].data_type !== "uuid") {
    // Old schema with integer id — drop and recreate
    await client.query(`DROP TABLE IF EXISTS applicants CASCADE`)
    await client.query(`DROP TABLE IF EXISTS posts CASCADE`)
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title       TEXT NOT NULL,
      faculty     TEXT NOT NULL,
      description TEXT NOT NULL,
      deadline    DATE NOT NULL,
      logo_url    TEXT,
      is_open     BOOLEAN NOT NULL DEFAULT TRUE,
      owner_id    TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await client.query(`
    CREATE TABLE IF NOT EXISTS applicants (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL,
      name       TEXT NOT NULL,
      lastname   TEXT NOT NULL,
      email      TEXT NOT NULL,
      resume_url TEXT,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

// ──────────────────────────────────────────────
// GET /api/posts?search=&filter=all|open|closed
// Reading the list stays open to any logged-in role
// (applicants need to browse open posts too).
// ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const db = getPool()
    await ensureTables(db)

    const { searchParams } = new URL(req.url)
    const search = `%${searchParams.get("search") ?? ""}%`
    const filter = searchParams.get("filter") ?? "all"

    let queryText: string
    const values: string[] = [search, search]

    if (filter === "open") {
      queryText = `
        SELECT p.*, TRIM(CONCAT(u.name, ' ', u.lastname)) AS owner_name
        FROM posts p
        LEFT JOIN users u ON u.id::text = p.owner_id
        WHERE (p.title ILIKE $1 OR p.faculty ILIKE $2)
          AND p.is_open = TRUE AND p.deadline >= CURRENT_DATE
        ORDER BY p.created_at DESC
      `
    } else if (filter === "closed") {
      queryText = `
        SELECT p.*, TRIM(CONCAT(u.name, ' ', u.lastname)) AS owner_name
        FROM posts p
        LEFT JOIN users u ON u.id::text = p.owner_id
        WHERE (p.title ILIKE $1 OR p.faculty ILIKE $2)
          AND (p.is_open = FALSE OR p.deadline < CURRENT_DATE)
        ORDER BY p.created_at DESC
      `
    } else {
      queryText = `
        SELECT p.*, TRIM(CONCAT(u.name, ' ', u.lastname)) AS owner_name
        FROM posts p
        LEFT JOIN users u ON u.id::text = p.owner_id
        WHERE p.title ILIKE $1 OR p.faculty ILIKE $2
        ORDER BY p.created_at DESC
      `
    }

    const { rows } = await db.query<Post>(queryText, values)
    return NextResponse.json(rows)
  } catch (err) {
    console.error("[api/posts GET]", err)
    return NextResponse.json([], { status: 500 })
  }
}

// ──────────────────────────────────────────────
// POST /api/posts  — create a new post
// Only authenticated HR/admin accounts may create posts.
// owner_id is taken from the verified token, never from the
// request body, so a client can no longer spoof it.
// ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!CAN_MANAGE_POSTS.includes(auth.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = getPool()
    await ensureTables(db)

    const body = await req.json()
    const { title, faculty, description, deadline, logo_url } = body

    if (!title || !faculty || !description || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { rows } = await db.query<Post>(
      `INSERT INTO posts (title, faculty, description, deadline, logo_url, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, faculty, description, deadline, logo_url ?? null, auth.id]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error("[api/posts POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ──────────────────────────────────────────────
// PATCH /api/posts  — edit an existing post
// Body: { id, title, faculty, description, deadline, logo_url?, is_open }
// Only the HR/admin account that created the post (owner_id) may
// edit it — other HR/admin accounts get 403 even though they can
// still see and delete it.
// ──────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!CAN_MANAGE_POSTS.includes(auth.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = getPool()

    const body = await req.json()
    const { id, title, faculty, description, deadline, logo_url, is_open } = body

    if (!id || !title || !faculty || !description || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Look up the post first so we can check ownership before writing.
    const { rows: existingRows } = await db.query<Pick<Post, "owner_id">>(
      `SELECT owner_id FROM posts WHERE id = $1`,
      [id]
    )

    if (existingRows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (String(existingRows[0].owner_id) !== String(auth.id)) {
      return NextResponse.json(
        { error: "Only the creator of this post can edit it" },
        { status: 403 }
      )
    }

    const { rows } = await db.query<Post>(
      `UPDATE posts
       SET title = $1,
           faculty = $2,
           description = $3,
           deadline = $4,
           logo_url = $5,
           is_open = $6
       WHERE id = $7
       RETURNING *`,
      [
        title,
        faculty,
        description,
        deadline,
        logo_url ?? null,
        is_open ?? true,
        id,
      ]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (err) {
    console.error("[api/posts PATCH]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ──────────────────────────────────────────────
// DELETE /api/posts?id=  — delete a post
// Only the HR/admin account that created the post (owner_id) may
// delete it.
// ──────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!CAN_MANAGE_POSTS.includes(auth.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = getPool()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const { rows: existingRows } = await db.query<Pick<Post, "owner_id">>(
      `SELECT owner_id FROM posts WHERE id = $1`,
      [id]
    )

    if (existingRows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (String(existingRows[0].owner_id) !== String(auth.id)) {
      return NextResponse.json(
        { error: "Only the creator of this post can delete it" },
        { status: 403 }
      )
    }

    const { rowCount } = await db.query(`DELETE FROM posts WHERE id = $1`, [id])

    if (rowCount === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/posts DELETE]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}