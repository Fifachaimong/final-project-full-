'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, BrainCircuit, ChevronRight, FileText, RefreshCw, Sparkles } from 'lucide-react'
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

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: 'กำลังพิจารณา', className: 'bg-amber-100 text-amber-800' },
  reviewing: { label: 'กำลังพิจารณา', className: 'bg-amber-100 text-amber-800' },
  accepted: { label: 'ผ่านการคัดเลือก', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'ไม่ผ่านการคัดเลือก', className: 'bg-rose-100 text-rose-800' },
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
            {loading ? <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"><RefreshCw className="mr-2 size-4 animate-spin" />กำลังโหลดข้อมูล...</div> : error ? <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center"><p className="text-sm text-destructive">{error}</p><button onClick={() => void loadApplications()} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">ลองอีกครั้ง</button></div> : applications.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted"><FileText aria-hidden="true" className="size-6 text-muted-foreground" /></div><h3 className="font-medium">ยังไม่มีประวัติการสมัคร</h3><p className="mt-2 text-sm text-muted-foreground">เมื่อคุณสมัครงาน รายการจะแสดงที่นี่</p></div> : <div className="flex flex-col gap-3">{applications.map((application, index) => { const score = scoreValue(application.ai_score); const status = statusMap[String(application.status ?? '').toLowerCase()] ?? { label: application.status || 'ไม่ระบุสถานะ', className: 'bg-muted text-muted-foreground' }; const content = <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6"><div className="flex min-w-0 flex-1 items-center gap-4"><div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent text-lg font-semibold text-accent-foreground">{application.icon ? <img src={application.icon} alt="" className="size-full object-cover" /> : (application.company_name || 'บริษัท').slice(0, 1)}</div><div className="min-w-0"><h3 className="truncate font-semibold">{application.title || 'ตำแหน่งงานไม่ระบุ'}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{application.company_name || 'ไม่ระบุบริษัท'}</p><span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span></div></div><div className="flex items-center gap-5 border-t border-border pt-4 sm:border-t-0 sm:pt-0"><div className="min-w-36"><div className="mb-2 flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-muted-foreground"><BrainCircuit className="size-3.5" />AI score</span><strong>{score === null ? '—' : `${score}%`}</strong></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${score ?? 0}%` }} /></div></div><ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" /></div></div>; return application.post_id ? <Link key={String(application.post_id)} href={`/resume/${application.post_id}`} className="group rounded-2xl border border-border transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{content}</Link> : <div key={index} className="rounded-2xl border border-border">{content}</div> })}</div>}
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ArrowUpRight aria-hidden="true" className="size-3.5" />ข้อมูลอัปเดตจากระบบสมัครงานของคุณ</div>
        </section>
      </main>
    </>
  )
}
