"use server"

import { cookies } from "next/headers"

const BACKEND_URL = "http://localhost:5000/auth/profile"

export async function getProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    throw new Error("Unauthorized")
  }

  const response = await fetch(BACKEND_URL, {
    method: "GET",
    headers: {
      Cookie: `token=${token}`,
    },
    cache: "no-store",
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result?.message || "Get profile failed")
  }

  return result.data ?? result
}

export async function updateProfile(data: {
  firstname: string
  lastname: string
  phone: string
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    throw new Error("Unauthorized")
  }

  const formData = new FormData()

  formData.append("firstname", data.firstname)
  formData.append("lastname", data.lastname)
  formData.append("phone", data.phone)

  const response = await fetch(BACKEND_URL, {
    method: "PUT",
    headers: {
      Cookie: `token=${token}`,
    },
    body: formData,
    cache: "no-store",
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result?.message || "Update profile failed")
  }

  return result.data ?? result
}