"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft,
  FileText,
  Sparkles,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Gauge,
  BookOpenText,
  ShieldCheck,
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
  icon: Icon,
}: {
  label: string
  value: number | null
  icon: React.ElementType
}) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>

        <span className="text-2xl font-bold leading-none text-foreground">
          {value ?? "-"}
        </span>
      </div>
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
  const isPending = !isApproved && !isRejected

  const statusLabel = isApproved
    ? "ผ่านการคัดเลือกแล้ว"
    : isRejected
    ? "ไม่ผ่านการคัดเลือก"
    : "รอการพิจารณา"

  const StatusIcon = isApproved
    ? CheckCircle2
    : isRejected
    ? XCircle
    : Clock

  const statusTextClass = isApproved
    ? "text-emerald-800"
    : isRejected
    ? "text-rose-800"
    : "text-amber-800"

  const statusBadgeClass = isApproved
    ? "border-emerald-600 bg-emerald-100 text-emerald-800"
    : isRejected
    ? "border-rose-600 bg-rose-100 text-rose-800"
    : "border-amber-500 bg-amber-100 text-amber-800"

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div
          className={
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 " +
            statusBadgeClass
          }
        >
          <StatusIcon className="h-6 w-6" strokeWidth={2.5} />
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground">
            ผลการพิจารณา
          </h2>

          <span
            className={
              "mt-1 inline-flex items-center rounded-full border-2 px-3 py-1 text-sm font-bold " +
              statusBadgeClass
            }
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* กดเปลี่ยนได้ตลอด แม้ตัดสินไปแล้ว เผื่อ HR กดพลาด — ปุ่มที่ตรงกับสถานะปัจจุบันจะเข้มกว่าเพื่อบอกว่าเลือกอันนี้อยู่ */}
        <button
          type="button"
          disabled={submitting}
          onClick={onApprove}
          className={
            "inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 " +
            (isApproved
              ? "border-emerald-700 bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
              : "border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50")
          }
        >
          <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
          ผ่าน
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={onReject}
          className={
            "inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 " +
            (isRejected
              ? "border-rose-700 bg-rose-600 text-white shadow-md hover:bg-rose-700"
              : "border-rose-600 bg-white text-rose-700 hover:bg-rose-50")
          }
        >
          <XCircle className="h-5 w-5" strokeWidth={2.5} />
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
    <main className="min-h-screen bg-gradient-to-b from-muted/40 via-background to-background">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <button
          onClick={() => router.push(backHref)}
          className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับไปรายชื่อผู้สมัคร
        </button>

        {actionError && (
          <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {actionError}
          </div>
        )}

        {/* กรอบหลักรวมทุก section เป็นชิ้นเดียว ให้ดูเป็นการ์ดเดียวที่ทันสมัยแทนหลายกล่องแยก */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card/80 shadow-sm shadow-black/[0.03] backdrop-blur-sm">
          <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-6 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-base font-bold text-foreground">
                  ผลการวิเคราะห์ Resume ด้วย AI
                </h1>

                <p className="text-xs text-muted-foreground">
                  สรุปคะแนน ทักษะ และเอกสารของผู้สมัคร
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ScoreCard
                label="AI Score"
                value={resume.ai_score}
                icon={Gauge}
              />

              <ScoreCard
                label="Storytelling Score"
                value={resume.storytelling_score}
                icon={BookOpenText}
              />

              <ScoreCard
                label="Overall Confidence"
                value={resume.overall_confidence}
                icon={ShieldCheck}
              />
            </div>
          </div>

          {skills.length > 0 && (
            <div className="border-b border-border px-6 py-6 sm:px-8">
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
                    className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {resume.ai_reason && (
            <div className="border-b border-border px-6 py-6 sm:px-8">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />

                <h2 className="text-sm font-semibold text-foreground">
                  เหตุผลจาก AI
                </h2>
              </div>

              <p className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
                {resume.ai_reason}
              </p>
            </div>
          )}

          <div className="border-b border-border px-6 py-6 sm:px-8">
            <div className="mb-4 flex items-center gap-2">
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

          <div className="border-t-2 border-border bg-muted/40 px-6 py-6 sm:px-8">
            <StatusActions
              status={resume.status}
              submitting={updatingStatus}
              onApprove={() => handleUpdateStatus("approved")}
              onReject={() => handleUpdateStatus("rejected")}
            />
          </div>
        </div>
      </div>
    </main>
  )
}