"use server"

import { cookies } from "next/headers"

export async function getProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    throw new Error("Unauthorized")
  }

  const response = await fetch(
    "http://localhost:5000/auth/profile",
    {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    }
  )

  const result = await response.json()

  if (!response.ok) {
    console.error("Backend profile error:", result)

    throw new Error(
      result?.message || "Get profile failed"
    )
  }

  return result.data ?? result
}