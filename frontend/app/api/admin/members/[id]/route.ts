import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import bcrypt from "bcryptjs"

// GET single member
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const result = await pool.query(
      `SELECT id, name, lastname, email, role_id, created_at FROM users WHERE id = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error("[v0] GET /api/admin/members/[id] error:", err)
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
  }
}

// PATCH update member
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const { name, lastname, email, password, role_id } = body

    // Build dynamic query
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name) }
    if (lastname !== undefined) { fields.push(`lastname = $${idx++}`); values.push(lastname) }
    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email) }
    if (password) {
      const hashed = await bcrypt.hash(password, 10)
      fields.push(`password = $${idx++}`)
      values.push(hashed)
    }
    if (role_id !== undefined) { fields.push(`role_id = $${idx++}`); values.push(role_id) }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(id)
    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx}
       RETURNING id, name, lastname, email, role_id, created_at`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (err: unknown) {
    console.error("[v0] PATCH /api/admin/members/[id] error:", err)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

// DELETE member
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] DELETE /api/admin/members/[id] error:", err)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}
