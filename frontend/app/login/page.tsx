"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, FileText, Loader2 } from "lucide-react"
import { useUser } from "@/contexts/user-context"

type Role = "admin" | "hr" | "applicant"

interface LoginResponse {
  id: string
  name: string
  lastname: string
  email: string
  role_id: number
  role: Role
}

interface LoginErrorResponse {
  message: string
}

export default function LoginPage() {
  const router = useRouter()
  const { refetchUser } = useUser()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()

  if (e.nativeEvent instanceof CompositionEvent) return

  setLoading(true)
  setError("")

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    })

    if (res.ok) {
      const data: LoginResponse = await res.json()

      // Refresh the shared UserProvider context now that the auth cookie
      // is set, so Navbar/UserAvatar show the logged-in user immediately
      // on the page we redirect to, instead of them firing their own
      // /api/me call on mount.
      await refetchUser()

      if (data.role === "hr") {
        router.replace("/home/hr")
        router.refresh()
      } else if (data.role === "applicant") {
        router.replace("/home/applicant")
        router.refresh()
      } else if (data.role === "admin") {
        router.replace("/home/admin")
        router.refresh()
      }
    } else {
      const _data: LoginErrorResponse = await res
        .json()
        .catch(() => ({ message: "" }))

      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง")
    }
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-background">
      {/* ───── Header ───── */}
      <header className="border-b border-border bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-semibold">ResumeAnalysis</span>
          </Link>
        </div>
      </header>

      {/* ───── Login Form ───── */}
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-orange-50/40 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/30">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">ยินดีต้อนรับกลับ</h1>
            <p className="text-muted-foreground mt-1 text-sm">เข้าสู่ระบบเพื่อดูผลการวิเคราะห์ Resume ของคุณ</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">
                  อีเมล
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-orange-200 bg-white text-foreground placeholder:text-muted-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-foreground">
                    รหัสผ่าน
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline transition-colors"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-orange-200 bg-white text-foreground placeholder:text-muted-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm
                  hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 mt-2
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-5">
              ยังไม่มีบัญชี?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                สมัครสมาชิก
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
            ระบบนี้ใช้สำหรับบุคลากรที่ได้รับอนุญาตเท่านั้น
            <br />
            หากมีปัญหาในการเข้าสู่ระบบ กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>
      </main>
    </div>
  )
}
