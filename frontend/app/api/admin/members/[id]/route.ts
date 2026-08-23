import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import bcrypt from "bcryptjs"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

// GET single member
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, firstname, lastname, email, role, created_at FROM users WHERE id = ?`,
      [id]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }
    return NextResponse.json(rows[0])
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
    const { firstname, lastname, email, password, role } = body

    // Build dynamic query
    const fields: string[] = []
    const values: unknown[] = []

    if (firstname !== undefined) { fields.push(`firstname = ?`); values.push(firstname) }
    if (lastname !== undefined) { fields.push(`lastname = ?`); values.push(lastname) }
    if (email !== undefined) { fields.push(`email = ?`); values.push(email) }
    if (password) {
      const hashed = await bcrypt.hash(password, 10)
      fields.push(`password = ?`)
      values.push(hashed)
    }
    if (role !== undefined) { fields.push(`role = ?`); values.push(role) }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(id)
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    )

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, firstname, lastname, email, role, created_at FROM users WHERE id = ?`,
      [id]
    )
    return NextResponse.json(rows[0])
  } catch (err: unknown) {
    console.error("[v0] PATCH /api/admin/members/[id] error:", err)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ER_DUP_ENTRY"
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
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM users WHERE id = ?`,
      [id]
    )
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] DELETE /api/admin/members/[id] error:", err)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}