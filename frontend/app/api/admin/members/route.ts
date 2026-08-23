import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import bcrypt from "bcryptjs"

// GET all members
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, lastname, email, role_id, created_at FROM users ORDER BY id ASC`
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error("[v0] GET /api/admin/members error:", err)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

// POST create new member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, lastname, email, password, role_id } = body

    if (!name || !email || !password || !role_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO users (name, lastname, email, password, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, lastname, email, role_id, created_at`,
      [name, lastname ?? null, email, hashed, role_id]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err: unknown) {
    console.error("[v0] POST /api/admin/members error:", err)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}
