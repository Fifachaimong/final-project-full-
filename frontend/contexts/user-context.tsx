"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export interface AppUser {
  id: number
  firstname: string | null
  lastname: string | null
  email: string | null
  phone: string | null
  icon: string | null
  role: string
  role_id: number
}

interface UserContextValue {
  user: AppUser | null
  /** true while the very first /api/me request is in flight */
  loading: boolean
  /** call after login/logout/profile updates to force a fresh /api/me */
  refetchUser: () => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

function normalizeUser(raw: Record<string, unknown> | null | undefined): AppUser | null {
  if (!raw) return null

  return {
    id: Number(raw.id),
    firstname: (raw.firstname as string | null) ?? null,
    lastname: (raw.lastname as string | null) ?? null,
    email: (raw.email as string | null) ?? null,
    phone: (raw.phone as string | null) ?? null,
    icon: (raw.icon as string | null) ?? null,
    role: (raw.role as string) ?? "",
    role_id: Number(raw.role_id ?? 0),
  }
}

/**
 * Wrap the app once (in app/layout.tsx) with <UserProvider>.
 * Every component/page that needs the logged-in user (Navbar, UserAvatar,
 * role-redirect pages, resume pages, member detail page, etc.) should call
 * useUser() instead of fetching /api/me itself. This is what stops one
 * page load from firing the same /api/me request 2-4 times.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" })

      if (!res.ok) {
        setUser(null)
        return
      }

      const result = await res.json()
      setUser(normalizeUser(result?.data ?? result))
    } catch (error) {
      console.error("Load current user error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <UserContext.Provider value={{ user, loading, refetchUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)

  if (!ctx) {
    throw new Error("useUser must be used within a <UserProvider>")
  }

  return ctx
}
