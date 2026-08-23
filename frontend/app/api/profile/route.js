import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_TOKEN);

// =======================
// GET Profile
// =======================
export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, secret);

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        lastname,
        email,
        role_id,
        created_at
      FROM users
      WHERE id = $1
      `,
      [payload.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

// =======================
// UPDATE Profile
// =======================
export async function PUT(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, secret);

    const body = await req.json();

    const result = await pool.query(
      `
      UPDATE users
      SET
        name = $1,
        lastname = $2,
        email = $3
      WHERE id = $4
      RETURNING
        id,
        name,
        lastname,
        email,
        role_id,
        created_at
      `,
      [
        body.firstName,
        body.surname,
        body.email,
        payload.id,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}