import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import db from "@/lib/db";

const secret = new TextEncoder().encode(process.env.JWT_TOKEN);

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";

    const token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, secret);

    const [rows] = await db.query(
      `
      SELECT
        id,
        firstname,
        lastname,
        email,
        phone,
        role
      FROM users
      WHERE id = ?
      `,
      [payload.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const user = rows[0];

    return NextResponse.json({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    console.error("GET /api/me error:", error);

    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}