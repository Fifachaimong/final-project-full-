import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

async function forwardResponse(backendResponse) {
  const text = await backendResponse.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  const response = NextResponse.json(
    data ?? { message: "Invalid backend response" },
    { status: backendResponse.status }
  );

  const setCookie = backendResponse.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);

  return response;
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let body;

    if (contentType.includes("application/json")) {
      body = await request.text();
    } else {
      const formData = await request.formData();
      body = JSON.stringify(Object.fromEntries(formData.entries()));
    }

    const backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    return forwardResponse(backendResponse);
  } catch (error) {
    console.error("POST /api/auth error:", error);
    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 500 }
    );
  }
}
