"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { useEffect, useState } from "react"

interface User {
  id: number
  firstname: string | null
  lastname: string | null
  email: string | null
  phone: string | null
  icon: string | null
  role: string
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch("/api/me", {
          cache: "no-store",
        })

        if (!res.ok) {
          setUser(null)
          return
        }

        const result = await res.json()

        // รองรับทั้งกรณี API ส่งตรง
        // และกรณี API ห่อข้อมูลไว้ใน data
        const data = result.data ?? result

        setUser(data)
      } catch (error) {
        console.error("Get navbar user error:", error)
      }
    }

    getUser()
  }, [])

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

            {/* <span className="rounded bg-coral px-1.5 py-0.5 text-[10px] font-semibold text-white">
              NEW
            </span> */}
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
            href="#"
            className="
              text-sm font-medium
              text-muted-foreground
              hover:text-foreground
            "
          >
            About Us
          </Link>

        </nav>

        {/* User Avatar */}
        <div className="flex items-center gap-4">
          <UserAvatar
            avatarUrl={user?.icon ?? undefined}
          />
        </div>

      </div>
    </header>
  )
}