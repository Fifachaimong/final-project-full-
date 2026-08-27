"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft,
  FileText,
  Sparkles,
  BarChart3,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

interface CurrentUser {
  id: string
  role: string
}

interface MemberResume {
  resume_url: string | null
  transcript_url: string | null
  ai_score: number | null
  storytelling_score: number | null
  overall_confidence: number | null
  skills: string[] | string | null
  ai_reason: string | null
}

function parseSkills(
  skills: MemberResume["skills"]
): string[] {
  if (Array.isArray(skills)) {
    return skills.map(String)
  }

  if (typeof skills === "string") {
    try {
      const parsed = JSON.parse(skills)

      if (Array.isArray(parsed)) {
        return parsed.map(String)
      }
    } catch {}

    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }

  return []
}

function ScoreCard({
  label,
  value,
}: {
  label: string
  value: number | null
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>

      <span className="text-xl font-bold text-foreground">
        {value ?? "-"}
      </span>
    </div>
  )
}

function FileViewer({
  url,
  title,
}: {
  url: string | null
  title: string
}) {
  if (!url) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">
          {title}
        </p>

        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
          ไม่มีไฟล์
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {title}
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary hover:underline"
        >
          เปิดในแท็บใหม่
        </a>
      </div>

      <iframe
        src={url}
        title={title}
        className="h-[600px] w-full rounded-xl border border-border bg-white"
      />
    </div>
  )
}

export default function MemberDetailPage() {
  const { post_id, member_id } = useParams<{
    post_id: string
    member_id: string
  }>()

  const router = useRouter()

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null)

  const [checkingAuth, setCheckingAuth] =
    useState(true)

  const [resume, setResume] =
    useState<MemberResume | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const backHref = `/resume/${post_id}`

  useEffect(() => {
    let cancelled = false

    const loadCurrentUser = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })

        if (!res.ok) return

        const result = await res.json()
        const raw = result?.data ?? result

        if (!cancelled && raw?.id) {
          setCurrentUser({
            id: String(raw.id),
            role: raw.role ?? "",
          })
        }
      } catch (error) {
        console.error(
          "Load current user error:",
          error
        )
      } finally {
        if (!cancelled) {
          setCheckingAuth(false)
        }
      }
    }

    loadCurrentUser()

    return () => {
      cancelled = true
    }
  }, [])

  const normalizedRole =
    currentUser?.role?.trim().toLowerCase()

  const isHR =
    normalizedRole === "hr" ||
    normalizedRole === "admin"

  useEffect(() => {
    if (checkingAuth) return

    if (!isHR) {
      setLoading(false)
      return
    }

    if (!post_id || !member_id) {
      setError("ไม่พบ Post ID หรือ Member ID")
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchResume = async () => {
      setLoading(true)
      setError(null)

      try {
        const apiUrl =
          `/api/member/${encodeURIComponent(
            post_id
          )}/${encodeURIComponent(member_id)}`

        const res = await fetch(apiUrl, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })

        const result =
          await res.json().catch(() => null)

        if (res.status === 404) {
          throw new Error(
            result?.message ??
              "ไม่พบข้อมูลผู้สมัครนี้"
          )
        }

        if (!res.ok) {
          throw new Error(
            result?.message ??
              result?.error ??
              `โหลดข้อมูลไม่สำเร็จ (${res.status})`
          )
        }

        const data =
          result?.data ?? result

        if (!data) {
          throw new Error(
            "ไม่พบข้อมูลผู้สมัคร"
          )
        }

        if (!cancelled) {
          setResume(data)
        }
      } catch (err) {
        console.error(
          "[Member Detail] Fetch error:",
          err
        )

        if (!cancelled) {
          setResume(null)

          setError(
            err instanceof Error
              ? err.message
              : "เกิดข้อผิดพลาด กรุณาลองใหม่"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchResume()

    return () => {
      cancelled = true
    }
  }, [
    checkingAuth,
    isHR,
    post_id,
    member_id,
  ])

  if (!checkingAuth && !isHR) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="flex flex-col items-center justify-center py-40 text-center">
          <p className="text-lg font-semibold text-foreground">
            ไม่มีสิทธิ์เข้าถึงหน้านี้
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            หน้านี้สำหรับ HR หรือ Admin เท่านั้น
          </p>

          <button
            onClick={() => router.push(backHref)}
            className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            กลับไปหน้าประกาศ
          </button>
        </div>
      </main>
    )
  }

  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />

          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-muted" />
        </div>
      </main>
    )
  }

  if (error || !resume) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="flex flex-col items-center justify-center py-40 text-center">
          <p className="text-lg font-semibold text-foreground">
            {error ?? "ไม่พบข้อมูลผู้สมัคร"}
          </p>

          <button
            onClick={() => router.push(backHref)}
            className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            กลับไปหน้าประกาศ
          </button>
        </div>
      </main>
    )
  }

  const skills = parseSkills(resume.skills)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <button
          onClick={() => router.push(backHref)}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับไปรายชื่อผู้สมัคร
        </button>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ScoreCard
            label="AI Score"
            value={resume.ai_score}
          />

          <ScoreCard
            label="Storytelling Score"
            value={resume.storytelling_score}
          />

          <ScoreCard
            label="Overall Confidence"
            value={resume.overall_confidence}
          />
        </div>

        {skills.length > 0 && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />

              <h2 className="text-sm font-semibold text-foreground">
                ทักษะที่ตรวจพบ
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {resume.ai_reason && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />

              <h2 className="text-sm font-semibold text-foreground">
                เหตุผลจาก AI
              </h2>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {resume.ai_reason}
            </p>
          </div>
        )}

        <div className="mb-6 flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />

          <h2 className="text-sm font-semibold text-foreground">
            เอกสาร
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          <FileViewer
            url={resume.resume_url}
            title="Resume"
          />

          <FileViewer
            url={resume.transcript_url}
            title="Transcript"
          />
        </div>
      </div>
    </main>
  )
}
