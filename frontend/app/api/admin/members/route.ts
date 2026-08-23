import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import bcrypt from "bcryptjs"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

// GET all members
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, firstname, lastname, email, role, created_at FROM users ORDER BY id ASC`
    )
    return NextResponse.json(rows)
  } catch (err) {
    console.error("[v0] GET /api/admin/members error:", err)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

// POST create new member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstname, lastname, email, password, role } = body

    if (!firstname || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (firstname, lastname, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      [firstname, lastname ?? null, email, hashed, role]
    )

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, firstname, lastname, email, role, created_at FROM users WHERE id = ?`,
      [result.insertId]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    console.error("[v0] POST /api/admin/members error:", err)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ER_DUP_ENTRY"
    ) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}