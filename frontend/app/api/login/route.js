import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(process.env.JWT_TOKEN);

export async function POST(req) {
  try {
    const formData = await req.formData();

    const email = formData.get("email");
    const password = formData.get("password");

    const result = await pool.query(
      `
      SELECT
        users.id,
        users.name,
        users.lastname,
        users.email,
        users.password,
        users.role_id,
        roles.role_name AS role
      FROM users
      JOIN roles
        ON users.role_id = roles.id
      WHERE users.email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Login failed" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Login failed" },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      role_id: user.role_id,
      role: user.role,
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}