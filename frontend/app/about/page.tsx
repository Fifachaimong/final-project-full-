'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Sparkles,
  ShieldCheck,
  Gauge,
  FileText,
  Users,
  UserCog,
  Briefcase,
  GraduationCap,
  Mail,
  RefreshCw,
  ChevronRight,
  BrainCircuit,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'

/* ---------- Types ---------- */

type HistoryStatus = 'approved' | 'rejected' | 'pending'

type HistoryExample = {
  title: string
  company: string
  status: HistoryStatus
  score: number
}

type ApplicantExample = {
  name: string
  score: number
  status: HistoryStatus
}

/* ---------- ตัวอย่างข้อมูล (mock data สำหรับประกอบคำอธิบายเท่านั้น) ---------- */

const historyExamples: HistoryExample[] = [
  {
    title: 'Frontend',
    company: 'บริษัทคนดี',
    status: 'rejected',
    score: 23.4,
  },
  {
    title: 'นักศึกษาฝึกงาน Data Analyst',
    company: 'บริษัท บลูปรินต์ อนาลิติกส์ จำกัด',
    status: 'approved',
    score: 91,
  },
  {
    title: 'ผู้ช่วยฝ่ายการตลาด',
    company: 'ริเวอร์ไลน์ สตูดิโอ',
    status: 'pending',
    score: 68,
  },
]

const applicantExamples: ApplicantExample[] = [
  { name: 'Applicant User', score: 23.4, status: 'rejected' },
  { name: 'applicant user', score: 23.4, status: 'approved' },
  { name: 'www asdasd', score: 23.4, status: 'pending' },
]

/* ---------- สถานะ: ใช้รูปแบบเดียวกับระบบจริง (badge วงรี + ไอคอน + note) ---------- */

function getStatusStyle(status: HistoryStatus): {
  label: string
  className: string
  emoji: string
  note?: string
} {
  switch (status) {
    case 'approved':
      return {
        label: 'ผ่านการพิจารณา',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        emoji: '✅',
        note: 'ขอบคุณสำหรับความสนใจและการสมัครงานกับเรา',
      }
    case 'rejected':
      return {
        label: 'ไม่ผ่านการพิจารณา',
        className: 'border-rose-200 bg-rose-50 text-rose-600',
        emoji: '❌',
        note: 'ขอบคุณสำหรับความสนใจและการสมัครงานกับเรา',
      }
    case 'pending':
      return {
        label: 'อยู่ระหว่างพิจารณา',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        emoji: '🕐',
        note: 'กรุณารอผลการพิจารณาและการติดต่อจากบริษัท',
      }
  }
}

/* ---------- กรอบ "หน้าจอตัวอย่าง" ใช้ห่อ mockup แต่ละอัน ---------- */

function PreviewFrame({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
        <span className="size-2 rounded-full bg-rose-300" />
        <span className="size-2 rounded-full bg-amber-300" />
        <span className="size-2 rounded-full bg-emerald-300" />
        <span className="ml-2 text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

/* ---------- ตัวอย่างที่ 1: ประวัติการสมัครของผู้สมัคร (อิงหน้า resumehistory จริง) ---------- */

function ResumeHistoryExample() {
  return (
    <PreviewFrame label="ตัวอย่าง · ประวัติการสมัคร (มุมมองผู้สมัคร)">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">รายการสมัครของฉัน</p>
          <p className="mt-0.5 text-xs text-muted-foreground">กดที่รายการเพื่อดูประกาศงาน</p>
        </div>
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <RefreshCw className="size-3.5" /> รีเฟรช
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {historyExamples.map((item) => {
          const status = getStatusStyle(item.status)
          return (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-2xl border border-border px-4 py-3.5 sm:gap-6"
            >
              {/* Company icon */}
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-accent-foreground">
                {item.company.charAt(0)}
              </div>

              {/* Company + title */}
              <div className="w-28 shrink-0 sm:w-36">
                <p className="truncate text-sm font-semibold text-foreground">{item.company}</p>
                <p className="truncate text-xs text-muted-foreground">{item.title}</p>
              </div>

              {/* Status badge */}
              <span
                className={`hidden shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium sm:inline-flex ${status.className}`}
              >
                {status.emoji} {status.label}
              </span>

              {/* Note */}
              {status.note && (
                <p className="hidden min-w-0 flex-1 items-center gap-1.5 truncate text-xs text-muted-foreground md:flex">
                  <Mail className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">{status.note}</span>
                </p>
              )}

              {/* AI score */}
              <div className="ml-auto flex shrink-0 items-center gap-4">
                <div className="w-24">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BrainCircuit className="size-3" /> AI score
                    </span>
                    <span className="font-semibold text-foreground">{item.score}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        ข้อมูลอัปเดตจากระบบสมัครงานของคุณ
      </p>
    </PreviewFrame>
  )
}

/* ---------- ตัวอย่างที่ 2: มุมมองของ HR ที่เห็นรายชื่อผู้สมัคร (อิงหน้ารายละเอียดประกาศจริง) ---------- */

function HrApplicantViewExample() {
  return (
    <PreviewFrame label="ตัวอย่าง · รายชื่อผู้สมัคร (มุมมอง HR)">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          นักศึกษาฝึกงานฝ่ายออกแบบ UX/UI — บริษัท คราฟท์ ดีไซน์ จำกัด
        </p>
        <span className="hidden items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:flex">
          <Users className="size-3.5" /> {applicantExamples.length} คน
        </span>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        {applicantExamples.map((a, index) => {
          const status = getStatusStyle(a.status)
          const initials = a.name
            .split(' ')
            .map((part) => part.charAt(0))
            .join('')
            .slice(0, 2)

          return (
            <div
              key={`${a.name}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 sm:gap-4"
            >
              <span className="w-4 shrink-0 text-center text-xs font-medium text-muted-foreground">
                {index + 1}
              </span>

              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {initials.toUpperCase()}
              </div>

              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {a.name}
              </span>

              <div className="shrink-0 text-right">
                <p className="text-[10px] text-muted-foreground">AI Score</p>
                <p className="text-sm font-semibold text-foreground">{a.score.toFixed(2)}</p>
              </div>

              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${status.className}`}
              >
                {status.emoji} {status.label}
              </span>
            </div>
          )
        })}
      </div>
    </PreviewFrame>
  )
}

/* ---------- บทบาทผู้ใช้งานในระบบ ---------- */

type RoleCard = {
  icon: LucideIcon
  title: string
  points: string[]
}

const roleCards: RoleCard[] = [
  {
    icon: GraduationCap,
    title: 'ผู้สมัครงาน',
    points: [
      'ดูประกาศรับสมัครงานที่เปิดอยู่',
      'อัปโหลดเรซูเม่เพื่อสมัคร',
      'ติดตามสถานะและคะแนนจาก AI ของตัวเอง',
    ],
  },
  {
    icon: Briefcase,
    title: 'ฝ่าย HR',
    points: [
      'สร้าง แก้ไข และปิดประกาศรับสมัครงาน',
      'ดูรายชื่อผู้สมัครพร้อมคะแนน AI',
      'ตัดสินผลว่า "ผ่าน" หรือ "ไม่ผ่าน"',
    ],
  },
  {
    icon: UserCog,
    title: 'ผู้ดูแลระบบ',
    points: [
      'จัดการบัญชีผู้ใช้ทั้งหมดในระบบ',
      'เพิ่ม แก้ไข หรือลบผู้ใช้งานได้',
      'ดูแลภาพรวมการทำงานของระบบ',
    ],
  },
]

type Highlight = {
  icon: LucideIcon
  title: string
  desc: string
}

const highlights: Highlight[] = [
  { icon: FileText, title: 'สมัครง่าย ติดตามได้', desc: 'ส่งเรซูเม่และดูสถานะการสมัครแบบเรียลไทม์' },
  { icon: Gauge, title: 'คะแนนจาก AI', desc: 'วิเคราะห์และให้คะแนนเทียบกับคุณสมบัติที่ต้องการ' },
  { icon: ShieldCheck, title: 'ลดอคติ เพิ่มความแม่นยำ', desc: 'ช่วย HR ตัดสินใจด้วยข้อมูลที่เป็นระบบ' },
]

/* ---------- หน้าหลัก: About Us ---------- */

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-73px)] bg-background">
        <section className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
          {/* Hero */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
            <Sparkles className="size-3.5" /> เกี่ยวกับเรา
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            ResumeAnalysis ระบบวิเคราะห์เรซูเม่ด้วย AI
          </h1>

          <div className="mt-4 max-w-2xl space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
            <p>
              ResumeAnalysis คือเว็บไซต์สำหรับจัดการและวิเคราะห์เรซูเม่ของผู้สมัครงาน
              ด้วยเทคโนโลยีปัญญาประดิษฐ์ (AI) พัฒนาขึ้นเพื่อเป็นตัวกลางระหว่าง
              ผู้สมัครงานที่ต้องการส่งเรซูเม่และติดตามผลการสมัคร กับฝ่ายทรัพยากรบุคคล
              (HR) ที่ต้องการเครื่องมือช่วยคัดกรองผู้สมัครจำนวนมากให้รวดเร็วและแม่นยำขึ้น
            </p>
            <p>
              แทนที่จะต้องเปิดไฟล์เรซูเม่ทีละฉบับเพื่ออ่านและให้คะแนนด้วยมือ ระบบของเรา
              จะดึงข้อความจากไฟล์เรซูเม่ วิเคราะห์ทักษะและประสบการณ์ของผู้สมัคร แล้วเทียบ
              กับคุณสมบัติที่ประกาศรับสมัครงานต้องการ ก่อนสรุปออกมาเป็นคะแนนและคำอธิบาย
              ที่อ่านเข้าใจง่าย ช่วยให้ HR เห็นภาพรวมผู้สมัครทั้งหมดได้เร็วขึ้น และช่วยลด
              ความคลาดเคลื่อนหรือความลำเอียงที่อาจเกิดจากการพิจารณาด้วยความรู้สึกล้วน ๆ
            </p>
            <p>
              ระบบแบ่งผู้ใช้งานออกเป็น 3 บทบาท ได้แก่ ผู้ดูแลระบบ (Admin) ที่ดูแลจัดการ
              บัญชีผู้ใช้ในภาพรวม ฝ่ายทรัพยากรบุคคล (HR) ที่สร้างประกาศรับสมัครงานและ
              พิจารณาผลผู้สมัคร และผู้สมัครงาน (Applicant) ที่ส่งเรซูเม่และติดตามผลของ
              ตัวเองได้ตลอดเวลา โดยแต่ละบทบาทจะเห็นเมนูและข้อมูลที่ต่างกันตามสิทธิ์การใช้งาน
            </p>
          </div>

          {/* จุดเด่นสั้น ๆ */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-4">
                <Icon className="mb-2 size-5 text-orange-600" />
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* บทบาทผู้ใช้งานในระบบ */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-foreground">ระบบทำงานอย่างไร</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ทุกบทบาทเข้าใช้งานผ่านเว็บไซต์เดียวกัน แต่จะเห็นเมนูและทำสิ่งที่ต่างกัน
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {roleCards.map(({ icon: Icon, title, points }) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="size-4.5 text-orange-600" />
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                  </div>
                  <ul className="space-y-1.5">
                    {points.map((p) => (
                      <li key={p} className="flex gap-2 text-xs text-muted-foreground">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-orange-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ตัวอย่าง mockup: ประวัติการสมัคร + มุมมอง HR */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-foreground">ตัวอย่างหน้าจอจริง</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ตัวอย่างข้อมูลด้านล่างเป็นข้อมูลจำลอง (mock) เพื่อประกอบการอธิบายเท่านั้น
            </p>
            <div className="mt-5 flex flex-col gap-6">
              <ResumeHistoryExample />
              <HrApplicantViewExample />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}