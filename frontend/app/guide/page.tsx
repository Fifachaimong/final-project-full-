"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  FileText,
  GraduationCap,
  ListFilter,
  LogIn,
  Menu,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  UsersRound,
  X,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

type Step = {
  title: string
  detail: string
  icon: typeof LogIn
  images?: { src: string; alt: string; caption: string }[]
}

const applicantSteps: Step[] = [
  { title: "สร้างบัญชีผู้สมัคร", detail: "กด “สมัครสมาชิก” กรอกชื่อ อีเมล รหัสผ่าน แล้วเลือก Applicant", icon: UserRound, images: [{ src: "/guide/register.png", alt: "หน้าสมัครสมาชิก", caption: "กรอกข้อมูลและเลือกประเภทบัญชี Applicant" }] },
  { title: "เข้าสู่ระบบ", detail: "ใช้บัญชีที่สมัครไว้เพื่อเข้าสู่หน้าแรกของผู้สมัคร", icon: LogIn, images: [{ src: "/guide/login.png", alt: "หน้าเข้าสู่ระบบ", caption: "กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ" }] },
  { title: "เลือกประกาศงาน", detail: "ไปที่ “ดูประกาศทั้งหมด” ค้นหาและเปิดดูรายละเอียดของตำแหน่งที่สนใจ", icon: BriefcaseBusiness, images: [{ src: "/guide/applicant-jobs.png", alt: "หน้ารวมประกาศงาน", caption: "หน้ารวมประกาศงาน" }, { src: "/guide/job-details.png", alt: "หน้ารายละเอียดประกาศงาน", caption: "หน้ารายละเอียดและปุ่มสมัคร" }] },
  { title: "อัปโหลดเอกสาร", detail: "ในหน้ารายละเอียดงาน แนบไฟล์ Resume และ Transcript ให้ครบก่อนส่งใบสมัคร", icon: Upload, images: [{ src: "/guide/application-upload.png", alt: "หน้าต่างอัปโหลด Resume และ Transcript", caption: "แนบ Resume และ Transcript" }] },
  { title: "ติดตามผลจาก AI", detail: "เปิดเมนูประวัติการสมัครเพื่อดูคะแนน AI เหตุผล และสถานะของแต่ละใบสมัคร", icon: FileSearch, images: [{ src: "/guide/application-history.png", alt: "หน้าประวัติการสมัครงาน", caption: "สถานะ คะแนน และจุดเด่น-จุดด้อยของเรซูเม่ (AI)  " }] },
]

const hrSteps: Step[] = [
  { title: "สร้างบัญชี HR", detail: "เลือกประเภทบัญชี HR ขณะสมัครสมาชิก แล้วเข้าสู่ระบบ", icon: BriefcaseBusiness },
  { title: "สร้างประกาศงาน", detail: "ที่หน้าแรก HR เพิ่มประกาศ พร้อมชื่อตำแหน่ง รายละเอียด และรูปบริษัท (ถ้ามี)", icon: FileText, images: [{ src: "/guide/hr-create-post.png", alt: "แบบฟอร์มสร้างประกาศ", caption: "กรอกข้อมูลและสร้างประกาศ" }] },
  { title: "จัดการประกาศ", detail: "แก้ไข ปิด หรือลบประกาศของตัวเองได้จากรายการประกาศ", icon: ListFilter, images: [{ src: "/guide/hr-posts.png", alt: "หน้ารวมประกาศของ HR", caption: "รายการประกาศของ HR" }] },
  { title: "ดูผู้สมัครและผล AI", detail: "เปิดประกาศเพื่อดูรายชื่อผู้สมัคร Resume/Transcript คะแนน และคำอธิบายจาก AI", icon: UsersRound, images: [{ src: "/guide/hr-candidates.png", alt: "รายชื่อผู้สมัครพร้อมคะแนน AI", caption: "รายชื่อผู้สมัครและสถานะ" }, { src: "/guide/hr-ai-result.png", alt: "ผลวิเคราะห์ Resume ด้วย AI", caption: "รายละเอียดผลวิเคราะห์ Resume" }] },
  { title: "อัปเดตสถานะ", detail: "พิจารณาผู้สมัครแล้วเลือกสถานะที่เหมาะสม เพื่อให้ผู้สมัครติดตามผลได้", icon: ClipboardCheck },
]

const sections = [
  { id: "start", label: "เริ่มต้นใช้งาน" },
  { id: "applicant", label: "สำหรับผู้สมัคร" },
  { id: "hr", label: "สำหรับ HR" },
  { id: "admin", label: "สำหรับผู้ดูแล" },
  { id: "tips", label: "ข้อควรรู้" },
]

function GuideSteps({ steps, accent }: { steps: Step[]; accent: "violet" | "teal" }) {
  const styles = accent === "violet"
    ? { number: "bg-violet-600 text-white", line: "bg-violet-200 dark:bg-violet-900", icon: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" }
    : { number: "bg-teal-600 text-white", line: "bg-teal-200 dark:bg-teal-900", icon: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300" }

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
            {index !== steps.length - 1 && <span className={`absolute left-5 top-11 h-[calc(100%-28px)] w-px ${styles.line}`} />}
            <span className={`z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${styles.number}`}>{index + 1}</span>
            <div className="min-w-0 pt-1">
              <div className="mb-1 flex items-center gap-2">
                <span className={`flex size-7 items-center justify-center rounded-lg ${styles.icon}`}><Icon className="size-4" /></span>
                <h3 className="font-semibold text-slate-950 dark:text-white">{step.title}</h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">{step.detail}</p>
              {step.images && (
                <div className={`mt-4 grid gap-3 ${step.images.length > 1 ? "md:grid-cols-2" : "max-w-xl"}`}>
                  {step.images.map((image) => (
                    <figure key={image.src} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                      <Image src={image.src} alt={image.alt} width={1875} height={968} className="aspect-video w-full object-cover object-top" />
                      <figcaption className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-300">{image.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default function GuidePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
        <Navbar />

        <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center px-5 py-3 lg:px-8">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-600"><Sparkles className="size-4 text-violet-600" /> คู่มือการใช้งาน ResumeAnalysis</p>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
          <section id="start" className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-violet-950/20 sm:px-10 lg:px-14 lg:py-14">
            <div className="absolute -right-16 -top-24 size-72 rounded-full bg-violet-500/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 size-52 rounded-full bg-teal-400/15 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-violet-200"><FileText className="size-3.5" /> RESUMEANALYSIS GUIDE</span>
                <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">เริ่มใช้งานอย่างมั่นใจ<br /><span className="text-violet-300">ทีละขั้นตอน</span></h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">คู่มือนี้สรุปวิธีใช้งานตามฟีเจอร์ในระบบ ตั้งแต่สร้างบัญชี ส่ง Resume เพื่อรับการวิเคราะห์จาก AI ไปจนถึงการจัดการผู้สมัครสำหรับ HR</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href="#applicant" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-violet-100">คู่มือผู้สมัคร <ArrowRight className="size-4" /></a>
                  <a href="#hr" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10">คู่มือ HR <ArrowRight className="size-4" /></a>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[.07] p-4 text-center backdrop-blur">
                {[{ icon: UserRound, label: "ผู้สมัคร" }, { icon: BriefcaseBusiness, label: "HR" }, { icon: ShieldCheck, label: "Admin" }].map(({ icon: Icon, label }) => <div key={label} className="space-y-2"><span className="mx-auto flex size-9 items-center justify-center rounded-xl bg-white/10"><Icon className="size-4 text-violet-200" /></span><p className="text-xs font-medium text-slate-200">{label}</p></div>)}
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-6 lg:h-fit">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold dark:border-slate-800 dark:bg-slate-900 lg:hidden">สารบัญ {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}</button>
              <nav className={`${menuOpen ? "mt-2 block" : "hidden"} rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block`}>
                <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400">สารบัญ</p>
                {sections.map((section) => <a onClick={() => setMenuOpen(false)} href={`#${section.id}`} key={section.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-950/50 dark:hover:text-violet-200">{section.label}<ChevronRight className="size-4 opacity-50" /></a>)}
              </nav>
            </aside>

            <div className="space-y-8">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold text-violet-600 dark:text-violet-300">ก่อนเริ่มใช้งาน</p><h2 className="mt-1 text-2xl font-bold">เลือกบัญชีให้ตรงกับบทบาท</h2></div><GraduationCap className="size-9 text-violet-500" /></div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-violet-50 p-5 dark:bg-violet-950/40"><UserRound className="size-5 text-violet-600" /><h3 className="mt-3 font-semibold">Applicant</h3><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">สำหรับค้นหางาน ส่ง Resume และ Transcript พร้อมติดตามผลวิเคราะห์</p></div><div className="rounded-2xl bg-teal-50 p-5 dark:bg-teal-950/35"><BriefcaseBusiness className="size-5 text-teal-600" /><h3 className="mt-3 font-semibold">HR</h3><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">สำหรับสร้างประกาศงาน ดูผู้สมัคร และจัดการสถานะการคัดเลือก</p></div></div>
              </section>

              <section id="applicant" className="scroll-mt-6 rounded-3xl border border-violet-100 bg-white p-6 dark:border-violet-950 dark:bg-slate-900/60 sm:p-8"><div className="mb-8 flex items-start gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25"><UserRound className="size-6" /></span><div><p className="text-sm font-bold text-violet-600 dark:text-violet-300">APPLICANT</p><h2 className="text-2xl font-bold">คู่มือสำหรับผู้สมัครงาน</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">สมัครงานและอ่านผลวิเคราะห์ของคุณได้ใน 5 ขั้นตอน</p></div></div><GuideSteps steps={applicantSteps} accent="violet" /></section>

              <section id="hr" className="scroll-mt-6 rounded-3xl border border-teal-100 bg-white p-6 dark:border-teal-950 dark:bg-slate-900/60 sm:p-8"><div className="mb-8 flex items-start gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/25"><BriefcaseBusiness className="size-6" /></span><div><p className="text-sm font-bold text-teal-600 dark:text-teal-300">HR</p><h2 className="text-2xl font-bold">คู่มือสำหรับฝ่ายทรัพยากรบุคคล</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">สร้างประกาศ คัดกรอง และติดตามผู้สมัครอย่างเป็นระบบ</p></div></div><GuideSteps steps={hrSteps} accent="teal" /></section>

              <section id="admin" className="scroll-mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8"><div className="flex gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-white"><ShieldCheck className="size-6" /></span><div><p className="text-sm font-bold text-slate-500">ADMIN</p><h2 className="text-2xl font-bold">สำหรับผู้ดูแลระบบ</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">เมนู “จัดการผู้ใช้งาน” ใช้ดู ค้นหา เพิ่ม แก้ไข หรือลบบัญชีผู้ใช้ในระบบ โดยผู้ดูแลควรตรวจสอบบทบาทของบัญชีให้ถูกต้องก่อนบันทึกการเปลี่ยนแปลง</p><figure className="mt-5 max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><Image src="/guide/admin-members.png" alt="หน้าจัดการผู้ใช้งาน" width={1875} height={968} className="aspect-video w-full object-cover object-top" /><figcaption className="px-3 py-2 text-xs font-medium text-slate-500">ค้นหา กรอง และจัดการบัญชีผู้ใช้</figcaption></figure></div></div></section>

              <section id="tips" className="scroll-mt-6 rounded-3xl bg-amber-50 p-6 dark:bg-amber-950/25 sm:p-8"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-amber-400 text-amber-950"><Check className="size-5" /></span><h2 className="text-xl font-bold text-amber-950 dark:text-amber-100">ข้อควรรู้เพื่อให้ใช้งานราบรื่น</h2></div><ul className="mt-5 space-y-3 text-sm leading-6 text-amber-950/80 dark:text-amber-100/80"><li className="flex gap-3"><Check className="mt-1 size-4 shrink-0" />การสมัครงานต้องแนบทั้ง Resume และ Transcript ให้ครบ</li><li className="flex gap-3"><Check className="mt-1 size-4 shrink-0" />คะแนนและจุดเด่น-จุดด้อยของเรซูเม่ (AI)   เป็นข้อมูลช่วยพิจารณา ควรอ่านรายละเอียดประกอบเสมอ</li><li className="flex gap-3"><Check className="mt-1 size-4 shrink-0" />หากข้อมูลบัญชีเปลี่ยนไป ให้แก้ไขได้จากเมนูโปรไฟล์</li></ul></section>

              <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-violet-600 p-6 text-white sm:flex-row sm:items-center"><div><p className="font-bold">พร้อมเริ่มต้นใช้งานแล้วหรือยัง?</p><p className="mt-1 text-sm text-violet-100">สร้างบัญชีเพื่อเข้าสู่ระบบ ResumeAnalysis</p></div><Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100">สมัครสมาชิก <ArrowRight className="size-4" /></Link></div>
            </div>
          </div>
        </main>
    </div>
  )
}
