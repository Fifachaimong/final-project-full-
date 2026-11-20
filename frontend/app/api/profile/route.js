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

  return NextResponse.json(
    data ?? { message: "Invalid backend response" },
    { status: backendResponse.status }
  );
}

async function proxyProfile(request) {
  const headers = {
    Cookie: request.headers.get("cookie") ?? "",
  };

  if (request.method === "PUT") {
    headers["Content-Type"] = request.headers.get("content-type") ?? "application/json";
  }

  const backendResponse = await fetch(`${BACKEND_URL}/auth/profile`, {
    method: request.method,
    headers,
    body: request.method === "PUT" ? await request.text() : undefined,
  });

  return forwardResponse(backendResponse);
}

export async function GET(request) {
  try {
    return await proxyProfile(request);
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    return await proxyProfile(request);
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 500 }
    );
  }
}
