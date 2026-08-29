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
import { useUser } from "@/contexts/user-context"

interface MemberResume {
  resume_url: string | null
  transcript_url: string | null
  ai_score: number | null
  storytelling_score: number | null
  overall_confidence: number | null
  skills: string[] | string | null
  ai_reason: string | null
  status: string | null
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

function StatusActions({
  status,
  submitting,
  onApprove,
  onReject,
}: {
  status: string | null
  submitting: boolean
  onApprove: () => void
  onReject: () => void
}) {
  const normalizedStatus = status?.trim().toLowerCase()
  const isApproved = normalizedStatus === "approved"
  const isRejected = normalizedStatus === "rejected"

  const statusLabel = isApproved
    ? "ผ่านการคัดเลือกแล้ว"
    : isRejected
    ? "ไม่ผ่านการคัดเลือก"
    : "รอการพิจารณา"

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          ผลการพิจารณา
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          {statusLabel}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* กดเปลี่ยนได้ตลอด แม้ตัดสินไปแล้ว เผื่อ HR กดพลาด — ปุ่มที่ตรงกับสถานะปัจจุบันจะเข้มกว่าเพื่อบอกว่าเลือกอันนี้อยู่ */}
        <button
          type="button"
          disabled={submitting}
          onClick={onApprove}
          className={
            isApproved
              ? "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600/90 disabled:cursor-not-allowed disabled:opacity-60"
              : "rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          ผ่าน
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={onReject}
          className={
            isRejected
              ? "rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600/90 disabled:cursor-not-allowed disabled:opacity-60"
              : "rounded-lg bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          ไม่ผ่าน
        </button>
      </div>
    </div>
  )
}

export default function MemberDetailPage() {
  const { post_id, member_id } = useParams<{
    post_id: string
    member_id: string
  }>()

  const router = useRouter()

  // Auth/role check reuses the single /api/me call made in <UserProvider>
  // instead of fetching it again just for this page's permission gate.
  const { user, loading: checkingAuth } = useUser()

  const [resume, setResume] =
    useState<MemberResume | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [updatingStatus, setUpdatingStatus] =
    useState(false)

  const [actionError, setActionError] =
    useState<string | null>(null)

  const backHref = `/resume/${post_id}`

  const normalizedRole =
    user?.role?.trim().toLowerCase()

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

  async function handleUpdateStatus(
    newStatus: "approved" | "rejected"
  ) {
    if (!post_id || !member_id) return
    if (updatingStatus) return

    // ไม่มี guard ว่าต้องเป็น pending เท่านั้น — HR เปลี่ยนใจ/แก้ที่กดพลาดได้ทุกเมื่อ
    if (resume?.status?.trim().toLowerCase() === newStatus) return

    setUpdatingStatus(true)
    setActionError(null)

    try {
      const apiUrl =
        `/api/member/${encodeURIComponent(
          post_id
        )}/${encodeURIComponent(member_id)}`

      const res = await fetch(apiUrl, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result =
        await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(
          result?.message ??
            result?.error ??
            `อัปเดตสถานะไม่สำเร็จ (${res.status})`
        )
      }

      setResume((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      )
    } catch (err) {
      console.error(
        "[Member Detail] Update status error:",
        err
      )

      setActionError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่"
      )
    } finally {
      setUpdatingStatus(false)
    }
  }

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

        <StatusActions
          status={resume.status}
          submitting={updatingStatus}
          onApprove={() => handleUpdateStatus("approved")}
          onReject={() => handleUpdateStatus("rejected")}
        />

        {actionError && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {actionError}
          </div>
        )}

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
