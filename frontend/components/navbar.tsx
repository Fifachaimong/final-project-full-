"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserAvatar } from "@/components/user-avatar"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"

export function Navbar() {

  const { user } = useUser()
  const pathname = usePathname()

  const homeLink =
    user?.role === "admin"
      ? "/home/admin"
      : user?.role === "hr"
      ? "/home/hr"
      : user?.role === "applicant"
      ? "/home/applicant"
      : "/"

  const browseLabel =
    user?.role === "hr"
      ? "ดูประกาศของตัวเอง"
      : "ดูประกาศทั้งหมด"

  // เช็คว่าลิงก์นี้ตรงกับหน้าที่เปิดอยู่ไหม — ใช้ prefix match สำหรับ
  // /resume เพราะมีหน้าลูกด้วย (เช่น /resume/123) อยากให้ยังไฮไลต์ค้างไว้
  const isActive = (href: string, matchChildren = false) => {
    if (!pathname) return false

    if (matchChildren) {
      return (
        pathname === href || pathname.startsWith(`${href}/`)
      )
    }

    return pathname === href
  }

  // active = ตัวเข้ม (พื้นดำ ตัวหนังสือขาว), ไม่ active = จาง ๆ (ตัวหนังสือเทา)
  const linkClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-foreground text-background"
        : "text-muted-foreground hover:text-foreground"
    }`

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          href={homeLink}
          className="flex items-center gap-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>

          <span className="text-xl font-semibold">
            ResumeAnalysis
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">

          <Link
            href={homeLink}
            className={linkClass(isActive(homeLink))}
          >
            หน้าหลัก
          </Link>

          {/* ประกาศงาน — เดิมเป็น dropdown ที่ยัด "จัดการผู้ใช้งาน" ไว้ข้างในด้วย
              ทั้งที่ไม่เกี่ยวกันเลย เลยแยกออกมาเป็นลิงก์เดี่ยว ๆ แทน */}
          <Link
            href="/resume"
            className={linkClass(isActive("/resume", true))}
          >
            {browseLabel}
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/application"
              className={linkClass(isActive("/application"))}
            >
              จัดการผู้ใช้งาน
            </Link>
          )}

          {/* About Us */}
          <Link
            href="/about"
            className={linkClass(isActive("/about"))}
          >
            เกี่ยวกับเรา
          </Link>

        </nav>

        {/* Auth buttons (guest) or user avatar (logged in) — Top Right */}
        <div className="flex items-center gap-4">
          {user ? (
            <UserAvatar user={user} />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:block"
              >
                เข้าสู่ระบบ
              </Link>
              <Link href="/register">
                <Button className="bg-coral text-white hover:bg-coral/90">
                  สมัครสมาชิก
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  )
}