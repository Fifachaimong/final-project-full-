"use server"

import { cookies } from "next/headers"

const BACKEND_URL = "https://final-project-full.onrender.com/auth/profile"

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
  student_id: string
  avatarFile?: File | null
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
  formData.append("student_id", data.student_id)

  // The backend route uses upload.single("icon"), so this field name must
  // remain "icon". Without it, req.file is empty and no profile URL is saved.
  if (data.avatarFile) {
    formData.append("icon", data.avatarFile, data.avatarFile.name)
  }

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

const PASSWORD_URL = "https://final-project-full.onrender.com/auth/password"

// คืนเป็นค่า (ไม่โยน error) เพราะ Next.js ซ่อนข้อความ error ของ server action บน production
// ทำให้ผู้ใช้ไม่เห็นว่า "รหัสผ่านปัจจุบันไม่ถูกต้อง" ถ้าใช้ throw
export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}): Promise<{ success: true } | { success: false; message: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    return { success: false, message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" }
  }

  let response: Response

  try {
    response = await fetch(PASSWORD_URL, {
      method: "PUT",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      }),
      cache: "no-store",
    })
  } catch {
    return {
      success: false,
      message: "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    }
  }

  if (response.ok) {
    return { success: true }
  }

  if (response.status === 401) {
    return { success: false, message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" }
  }

  const result = await response.json().catch(() => null)

  return {
    success: false,
    message: result?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  }
}
