"use server"

import { cookies } from "next/headers"

export async function getProfile() {
  const token = (await cookies()).get("token")?.value

  if (!token) {
    throw new Error("Unauthorized")
  }

  const response = await fetch(
    'http://localhost:5000/auth/profile',
    {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    throw new Error("Get profile failed")
  }

  const result = await response.json()

  return result.data
}