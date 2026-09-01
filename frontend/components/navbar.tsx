"use client"

import Link from "next/link"
import { UserAvatar } from "@/components/user-avatar"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"

export function Navbar() {
  
  const { user } = useUser()

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
            className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-coral"
          >
            หน้าหลัก
          </Link>

          {/* ประกาศงาน — เดิมเป็น dropdown ที่ยัด "จัดการผู้ใช้งาน" ไว้ข้างในด้วย
              ทั้งที่ไม่เกี่ยวกันเลย เลยแยกออกมาเป็นลิงก์เดี่ยว ๆ แทน */}
          <Link
            href="/resume"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {browseLabel}
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/application"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              จัดการผู้ใช้งาน
            </Link>
          )}

          {/* About Us */}
          <Link
            href="/about"
            className="
              text-sm font-medium
              text-muted-foreground
              hover:text-foreground
            "
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