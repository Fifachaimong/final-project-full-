"use client"

import { useState } from "react"
import Link from "next/link"
import { Briefcase, Eye, EyeOff, Lock, Mail, User } from "lucide-react"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const role = "Applicant"
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ"
    if (!lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล"
    if (!email.trim()) newErrors.email = "กรุณากรอก Email"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "รูปแบบ Email ไม่ถูกต้อง"
    if (!password) newErrors.password = "กรุณากรอกรหัสผ่าน"
    else if (password.length < 6) newErrors.password = "รหัสผ่านต้องมีตัวเลขอย่างน้อย 5 ตัว และ ต้องมีตัวพิมพ์ใหญ่และตัวพิมพ์เล็กอย่างน้อย 1 ตัว"
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    try {
      const dbRole = "applicant"

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: firstName,
          lastname: lastName,
          email,
          password,
          role: dbRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const fieldMap = {
          firstname: "firstName",
          lastname: "lastName",
          email: "email",
          password: "password",
          role: "role",
        }

        const field = fieldMap[data.field]

        setErrors({
          [field || "email"]: data.message || "สมัครสมาชิกไม่สำเร็จ",
        })

        return
      }

      console.log("REGISTER SUCCESS:", data)

      setSubmitted(true)
    } catch (error) {
      console.error("REGISTER ERROR:", error)

      setErrors({
        email: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      })
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

          {/* Auth Buttons */}
          
        </div>
      </header>

      {/* ───── Register Form ───── */}
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-orange-50/40 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/30">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">สมัครสมาชิก</h1>
            <p className="text-muted-foreground mt-1 text-sm">เริ่มต้นใช้งานแพลตฟอร์มงานของคุณ</p>
          </div>

          {/* Success state */}
          {submitted ? (
            <div className="bg-white rounded-3xl shadow-xl border border-border p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">สมัครสมาชิกสำเร็จ!</h2>
              <p className="text-muted-foreground text-sm">
                ยินดีต้อนรับ <span className="font-semibold text-primary">{firstName} {lastName}</span>
                <br />เข้าร่วมในฐานะ <span className="font-semibold text-primary">{role}</span>
              </p>
              <Link
                href="/login"
                className="inline-block mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            /* Card */
            <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* First Name + Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                      ชื่อ
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="ชื่อจริง"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-foreground placeholder:text-muted-foreground text-sm outline-none transition-all
                          focus:border-primary focus:ring-2 focus:ring-primary/20
                          ${errors.firstName ? "border-destructive" : "border-orange-200"}`}
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                      นามสกุล
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="นามสกุล"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-foreground placeholder:text-muted-foreground text-sm outline-none transition-all
                          focus:border-primary focus:ring-2 focus:ring-primary/20
                          ${errors.lastName ? "border-destructive" : "border-orange-200"}`}
                      />
                    </div>
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground">
                    อีเมล
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-foreground placeholder:text-muted-foreground text-sm outline-none transition-all
                        focus:border-primary focus:ring-2 focus:ring-primary/20
                        ${errors.email ? "border-destructive" : "border-orange-200"}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-semibold text-foreground">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="สร้างรหัสผ่าน"
                      className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-white text-foreground placeholder:text-muted-foreground text-sm outline-none transition-all
                        focus:border-primary focus:ring-2 focus:ring-primary/20
                        ${errors.password ? "border-destructive" : "border-orange-200"}`}
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
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm
                    hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 mt-2"
                >
                  สมัครสมาชิก
                </button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-5">
                มีบัญชีแล้ว?{" "}
                <a href="/login" className="text-primary font-semibold hover:underline">
                  เข้าสู่ระบบ
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
