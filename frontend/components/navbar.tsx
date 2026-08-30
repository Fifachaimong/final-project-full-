"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"

export function Navbar() {
  // Reads the single /api/me fetch done once in <UserProvider> (app/layout.tsx)
  // instead of fetching it again here.
  const { user } = useUser()

  const homeLink =
    user?.role === "admin"
      ? "/home/admin"
      : user?.role === "hr"
      ? "/home/hr"
      : user?.role === "applicant"
      ? "/home/applicant"
      : "/"

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
            Home
          </Link>

          {/* Resume */}
          <div className="group relative">

            <button
              className="
                flex items-center gap-1 rounded-md px-3 py-2
                text-sm font-medium text-gray-700
                transition-all duration-200
                hover:bg-gray-100 hover:text-black
              "
            >
              Resume

              <ChevronDown
                className="
                  h-4 w-4
                  transition-transform duration-200
                  group-hover:rotate-180
                "
              />
            </button>

            <div
              className="
                invisible absolute left-0 top-full z-50 mt-2 w-52
                translate-y-2 rounded-xl border border-gray-200
                bg-white p-2 opacity-0 shadow-xl
                transition-all duration-200
                group-hover:visible
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >

              <Link
                href="/resume"
                className="
                  flex items-center rounded-lg px-4 py-3 text-sm
                  text-gray-700 transition-colors
                  hover:bg-blue-50 hover:text-blue-600
                "
              >
                📄
                <span className="ml-3">
                  Browse
                </span>
              </Link>

              {user?.role === "admin" && (
                <Link
                  href="/application"
                  className="
                    mt-1 flex items-center rounded-lg px-4 py-3 text-sm
                    text-gray-700 transition-colors
                    hover:bg-blue-50 hover:text-blue-600
                  "
                >
                  📁
                  <span className="ml-3">
                    My Applications
                  </span>
                </Link>
              )}

            </div>
          </div>

          {/* About Us */}
          <Link
            href="/about"
            className="
              text-sm font-medium
              text-muted-foreground
              hover:text-foreground
            "
          >
            About Us
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