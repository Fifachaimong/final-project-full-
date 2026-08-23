import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();

    // รับข้อมูลจากหน้า Register
    const name = formData.get("name");
    const lastname = formData.get("lastname");
    const email = formData.get("email");
    const password = formData.get("password");

    // รับ role_id จากหน้า Register
    // HR = 2
    // Applicant = 3
    const role_id = Number(formData.get("role_id"));

    // ตรวจข้อมูล
    if (!name || !lastname || !email || !password || !role_id) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกข้อมูลให้ครบ",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า role_id ถูกต้อง
    if (![2, 3].includes(role_id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ประเภทบัญชีไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบ Email ซ้ำ
    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "อีเมลนี้มีผู้ใช้งานแล้ว",
        },
        { status: 409 }
      );
    }

    // เข้ารหัส Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // เพิ่มผู้ใช้ลง Database
    const result = await pool.query(
      `
      INSERT INTO users
        (name, lastname, email, password, role_id)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        id,
        name,
        lastname,
        email,
        role_id
      `,
      [
        name,
        lastname,
        email,
        hashedPassword,
        role_id,
      ]
    );

    console.log("สมัครสมาชิกสำเร็จ:", result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        message: "สมัครสมาชิกสำเร็จ",
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการสมัครสมาชิก",
        error: err.message,
      },
      { status: 500 }
    );
  }
}

