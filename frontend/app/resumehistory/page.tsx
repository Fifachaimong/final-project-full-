'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  RefreshCw,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'

type Application = {
  post_id?: string | number
  icon?: string
  title?: string
  company_name?: string
  status?: string
  ai_score?: number | string
  ai_reason?: string
}

function getStatusStyle(status: string | null | undefined): {
  label: string
  className: string
  icon: React.ElementType
  note?: string
} {
  const normalized = status?.trim().toLowerCase() ?? ''
  switch (normalized) {
    case 'approved':
    case 'accepted':
      return {
        label: 'ผ่านการพิจารณา',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        icon: CheckCircle2,
        note: 'กรุณารอการติดต่อผ่าน Email หรือ เบอร์โทร',
      }
    case 'rejected':
      return {
        label: 'ไม่ผ่านการพิจารณา',
        className: 'border-rose-200 bg-rose-50 text-rose-700',
        icon: XCircle,
        note: 'ขอบคุณสำหรับความสนใจและการสมัครงานกับเรา',
      }
    case 'pending':
    case 'reviewing':
      return {
        label: 'อยู่ระหว่างพิจารณา',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        icon: Clock,
        note: 'กรุณารอผลการพิจารณาและการติดต่อจากบริษัท',
      }
    default:
      return {
        label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'ไม่ระบุสถานะ',
        className: 'border-border bg-muted text-muted-foreground',
        icon: Clock,
      }
  }
}

function normalizeApplications(payload: unknown): Application[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const data = payload as { data?: unknown; results?: unknown }
    if (Array.isArray(data.data)) return data.data
    if (Array.isArray(data.results)) return data.results
    // กรณี data เป็น object เดี่ยว (สมัครแค่ใบเดียว) ให้ห่อเป็น array
    if (data.data && typeof data.data === 'object') return [data.data as Application]
  }
  return []
}

function scoreValue(score: Application['ai_score']) {
  const value = Number(score)
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null
}

export default function Page() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadApplications() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/resumehistory/result', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error('ไม่สามารถโหลดประวัติการสมัครได้')
      setApplications(normalizeApplications(await response.json()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadApplications() }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-73px)] bg-background">
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 lg:px-8 lg:pt-16">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkles aria-hidden="true" className="size-3.5" /> พื้นที่ของคุณ
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">ประวัติการสมัครงาน</h1>
              <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">ติดตามทุกโอกาสที่คุณสมัครไว้ พร้อมผลวิเคราะห์เรซูเม่จาก AI ในที่เดียว</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><FileText aria-hidden="true" className="size-5" /></div>
              <div><p className="text-2xl font-semibold leading-none">{applications.length}</p><p className="mt-1 text-xs text-muted-foreground">ใบสมัครทั้งหมด</p></div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-4 shadow-[0_18px_55px_-28px_hsl(var(--foreground)/0.35)] sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-5">
              <div><h2 className="font-semibold">รายการสมัครของฉัน</h2><p className="mt-1 text-sm text-muted-foreground">กดที่รายการเพื่อดูประกาศงาน</p></div>
              <button onClick={() => void loadApplications()} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="โหลดข้อมูลใหม่"><RefreshCw aria-hidden="true" className="size-4" /> <span className="hidden sm:inline">รีเฟรช</span></button>
            </div>
            {loading ? (
              <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"><RefreshCw className="mr-2 size-4 animate-spin" />กำลังโหลดข้อมูล...</div>
            ) : error ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center"><p className="text-sm text-destructive">{error}</p><button onClick={() => void loadApplications()} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">ลองอีกครั้ง</button></div>
            ) : applications.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center"><div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted"><FileText aria-hidden="true" className="size-6 text-muted-foreground" /></div><h3 className="font-medium">ยังไม่มีประวัติการสมัคร</h3><p className="mt-2 text-sm text-muted-foreground">เมื่อคุณสมัครงาน รายการจะแสดงที่นี่</p></div>
            ) : (
              <div className="flex flex-col gap-3">
                {applications.map((application, index) => {
                  const score = scoreValue(application.ai_score)
                  const status = getStatusStyle(application.status)
                  const StatusIcon = status.icon
                  const content = (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-6 p-5 sm:p-6">
                      {/* Left: job info + status */}
                      <div className="flex min-w-0 items-center gap-6">
                        {/* Company icon */}
                        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent text-lg font-semibold text-accent-foreground">
                          {application.icon ? (
                            <img
                              src={application.icon}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            (application.company_name || 'บริษัท').slice(0, 1)
                          )}
                        </div>

                        {/* Company + Job title */}
                        <div className="min-w-0 w-30">
                          <p className="truncate font-semibold text-foreground">
                            {application.company_name || 'ไม่ระบุบริษัท'}
                          </p>

                          <h3 className="mt-1 truncate text-sm font-normal text-muted-foreground">
                            {application.title || 'ตำแหน่งงานไม่ระบุ'}
                          </h3>
                        </div>

                        {/* Status */}
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm ${status.className}`}
                          >
                            <StatusIcon aria-hidden="true" className="size-3.5" />
                            {status.label}
                          </span>

                          {status.note && (
                            <p className="ml-14 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="size-3.5 shrink-0 text-primary" />
                              <span className="truncate">{status.note}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: AI score */}
                      <div className="flex items-center gap-5">
                        <div className="w-40">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <BrainCircuit className="size-3.5" />
                              AI score
                            </span>

                            <strong>
                              {score === null ? '—' : `${score}%`}
                            </strong>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${score ?? 0}%` }}
                            />
                          </div>
                        </div>

                        <ChevronRight
                          aria-hidden="true"
                          className="size-5 shrink-0 text-muted-foreground"
                        />
                      </div>

                      {application.ai_reason?.trim() && (
                        <div className="col-span-2 border-t border-border pt-3 text-sm leading-6 text-muted-foreground">
                          <span className="font-medium text-foreground">เหตุผลจาก AI:</span>{' '}
                          {application.ai_reason.trim()}
                        </div>
                      )}
                    </div>
                  )
                  return application.post_id ? (
                    <Link key={String(application.post_id)} href={`/resume/${application.post_id}`} className="group rounded-2xl border border-border transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{content}</Link>
                  ) : (
                    <div key={index} className="rounded-2xl border border-border">{content}</div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ArrowUpRight aria-hidden="true" className="size-3.5" />ข้อมูลอัปเดตจากระบบสมัครงานของคุณ</div>
        </section>
      </main>
    </>
  )
}
