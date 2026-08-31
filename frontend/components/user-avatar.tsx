"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { AppUser } from "@/contexts/user-context"

const DEFAULT_AVATAR_URL =
  "https://gknienyyavpewdiqfpmn.supabase.co/storage/v1/object/public/profile/iconresume.png"

interface UserAvatarProps {
  // Passed straight from <Navbar/>, which already has it from useUser() —
  // no more separate /api/me fetch in this component.
  user: AppUser | null
}

export function UserAvatar({ user }: UserAvatarProps) {
  const [open, setOpen] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const avatarUrl = user?.icon || DEFAULT_AVATAR_URL

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
      })

      window.location.href = "/"
    } catch (err) {
      console.error(err)
    }
  }

  const fullName = user
    ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || "-"
    : "Loading..."

  const firstName = user?.firstname ?? ""

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-muted focus:outline-none"
      >
        <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-coral/30">
          <Image
            src={avatarUrl}
            alt={fullName}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        </div>

        <span className="hidden text-sm font-medium md:block">
          {firstName}
        </span>

        <ChevronDown
          className={`hidden h-4 w-4 transition-transform md:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg">

          {/* User info */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-coral/30">
              <Image
                src={avatarUrl}
                alt={fullName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {fullName}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="py-1">

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>

              โปรไฟล์ของฉัน
            </Link>

            {user?.role === "applicant" && (
            <Link
              href="/resumehistory"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
              </svg>

              เรซูเม่ของฉัน
            </Link>
)}

            {/* <Link
              href="#"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>

              ตั้งค่า
            </Link> */}

          </div>

          {/* Logout */}
          <div className="border-t border-border py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive transition-colors hover:bg-muted"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>

              ออกจากระบบ
            </button>
          </div>

        </div>
      )}
    </div>
  )
}