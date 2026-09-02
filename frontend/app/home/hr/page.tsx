"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronDown, ChevronLeft, ChevronRight, Sparkles, Zap, Target, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Navbar } from "@/components/navbar"

const resumeExamples = [
  {
    name: "สมชาย ใจดี",
    role: "วิศวกรซอฟต์แวร์อาวุโส",
    location: "เชียงใหม่ • somchai@email.com",
    about:
      "วิศวกรซอฟต์แวร์ที่มีประสบการณ์กว่า 8 ปีในการพัฒนาเว็บแอปพลิเคชัน ถนัดด้าน React, Node.js และระบบคลาวด์",
    experience: [
      { title: "นักพัฒนาระบบซอฟต์แวร์อาวุโส", company: "บริษัท เทคคอร์ป จำกัด", period: "2563 - ปัจจุบัน" },
      { title: "นักพัฒนาระบบแบ็กเอนด์", company: "บริษัท คลาวด์เวิร์กส์ จำกัด", period: "2561 - 2563" },
      { title: "Junior Developer", company: "บริษัท เดฟสตูดิโอ จำกัด", period: "2559 - 2561" },
    ],
    skills: ["Backend", "Node.js", "PostgreSQL", "Docker"],
    aiScore: 92,
    aiNote:
      "ประสบการณ์ตรงกับตำแหน่ง เขียนผลงานเป็นลำดับชัดเจน ลองเพิ่มตัวเลขผลลัพธ์ในงานล่าสุดจะยิ่งน่าเชื่อถือขึ้น",
  },
  {
    name: "พิมพ์ชนก แสงทอง",
    role: "Frontend Developer",
    location: "เชียงใหม่ • pimchanok@email.com",
    about:
      "ถนัดสร้างอินเทอร์เฟซที่ลื่นไหลและเข้าถึงง่าย มีประสบการณ์ 5 ปีในการทำงานร่วมกับทีมดีไซน์และโปรดักต์",
    experience: [
      { title: "Frontend Developer", company: "บริษัท พิกเซล สตูดิโอ จำกัด", period: "2565 - ปัจจุบัน" },
      { title: "UI Engineer", company: "บริษัท เว็บไซต์ จำกัด", period: "2563 - 2565" },
      { title: "Web Developer Intern", company: "บริษัท ดีไซน์แล็บ จำกัด", period: "2562 - 2563" },
    ],
    skills: ["Frontend", "React", "GitHub", "Tailwind CSS"],
    aiScore: 88,
    aiNote:
      "งานด้าน UI ชัดเจนและเป็นระบบดี ลองเพิ่มผลลัพธ์เชิงตัวเลข เช่น ความเร็วหน้าเว็บที่ดีขึ้น จะช่วยเสริมความน่าเชื่อถือ",
  },
  {
    name: "อรรถพล วงศ์สุวรรณ",
    role: "Full Stack Developer",
    location: "เชียงใหม่ • attapol@email.com",
    about:
      "ทำงานได้ทั้งฝั่ง frontend และ backend ประสบการณ์ 6 ปีในทีมโปรดักต์ขนาดกลางถึงใหญ่",
    experience: [
      { title: "Full Stack Developer", company: "บริษัท เน็กซ์เจน จำกัด", period: "2564 - ปัจจุบัน" },
      { title: "Software Engineer", company: "บริษัท แอปเวิร์กส์ จำกัด", period: "2561 - 2564" },
      { title: "Backend Developer", company: "บริษัท ดาต้าเบส จำกัด", period: "2559 - 2561" },
    ],
    skills: ["Full Stack", "Node.js", "GitHub", "Docker"],
    aiScore: 95,
    aiNote:
      "ครอบคลุมทั้ง frontend และ backend อย่างสมดุล ประวัติการทำงานต่อเนื่องชัดเจน เหมาะกับตำแหน่งที่ต้องดูแลระบบทั้งหมด",
  },
]

export default function HomePage() {

  const router = useRouter();
  const [exampleIndex, setExampleIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const example = resumeExamples[exampleIndex];

  const goToPrevExample = () => {
    setSlideDirection("left");
    setExampleIndex((i) => (i - 1 + resumeExamples.length) % resumeExamples.length);
  };
  const goToNextExample = () => {
    setSlideDirection("right");
    setExampleIndex((i) => (i + 1) % resumeExamples.length);
  };

  // No more local fetch("/api/me") — reads the single fetch done once in
  // <UserProvider> (app/layout.tsx).
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading || !user) return; // ยังไม่ได้ Login ก็อยู่หน้า Login ต่อ

    if (user.role === "admin") {
      router.replace("/home/admin");
    } else if (user.role === "hr") {
      router.replace("/home/hr");
    } else if (user.role === "applicant") {
      router.replace("/home/applicant");
    }
  }, [loading, user, router]);

  const homeLink =
    user?.role === "admin"
      ? "/home/admin"
      : user?.role === "hr"
      ? "/home/hr"
      : user?.role === "applicant"
      ? "/home/applicant"
      : "/";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
                ท่านกำลังประสบปัญหาการตรวจเรซูเม่อยู่หรือเปล่า?
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                แพลตฟอร์มที่ถูกออกแบบมาเพื่อยกระดับกระบวนการสรรหาบุคลากรให้มีประสิทธิภาพมากขึ้น 
                โดยใช้ปัญญาประดิษฐ์ในการวิเคราะห์ข้อมูลจากเรซูเม่ของผู้สมัครอย่างละเอียด ไม่ว่าจะเป็นทักษะทางเทคนิค ประสบการณ์การทำงาน ประวัติการศึกษา 
                รวมไปถึงลักษณะการนำเสนอผลงานในรูปแบบ Storytelling เพื่อค้นหาจุดแข็งที่แท้จริงของผู้สมัคร
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-coral px-10 text-white hover:bg-coral/90"
                >
                  เริ่มวิเคราะห์เรซูเม่
                </Button>
              </Link>

              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-coral px-8 text-coral hover:bg-coral/10"
                >
                  ดูตัวอย่างตรงนี้
                </Button>
              </Link>
            </div>

            {/* Feature Highlights — echoes the bullet rhythm of the resume mock beside it */}
            <div className="divide-y divide-border/70 border-y border-border/70">
              <div className="flex items-start gap-3.5 py-4">
                <Sparkles className="mt-0.5 h-[18px] w-[18px] shrink-0 text-coral" strokeWidth={2} />
                <div>
                  <p className="font-semibold text-foreground">วิเคราะห์ด้วย AI อย่างละเอียด</p>
                  <p className="text-sm text-muted-foreground">
                    อ่านทักษะ ประสบการณ์ และเรื่องราวเบื้องหลังผลงานอย่างรอบด้าน
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 py-4">
                <Zap className="mt-0.5 h-[18px] w-[18px] shrink-0 text-coral" strokeWidth={2} />
                <div>
                  <p className="font-semibold text-foreground">รู้ผลภายในไม่กี่วินาที</p>
                  <p className="text-sm text-muted-foreground">
                    ไม่ต้องรอนาน อัปโหลดแล้วเห็นผลการวิเคราะห์ทันที
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 py-4">
                <Target className="mt-0.5 h-[18px] w-[18px] shrink-0 text-coral" strokeWidth={2} />
                <div>
                  <p className="font-semibold text-foreground">ตรงจุดที่ HR มองหา</p>
                  <p className="text-sm text-muted-foreground">
                    ให้คะแนนพร้อมคำแนะนำที่นำไปปรับใช้ได้จริง
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Resume Preview */}
          <div className="relative">
            <div
              key={exampleIndex}
              className={`overflow-hidden rounded-2xl bg-card shadow-2xl ${
                slideDirection === "right" ? "animate-slide-in-right" : "animate-slide-in-left"
              }`}
            >
              {/* Resume Header */}
              <div className="bg-neutral-900 p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-neutral-700">
                    <Image
                      src="https://gknienyyavpewdiqfpmn.supabase.co/storage/v1/object/public/profile/iconresume.png"
                      alt="Profile"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{example.name}</h2>
                    <p className="text-base text-neutral-400">
                      {example.role}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {example.location}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-semibold text-neutral-400">
                    เกี่ยวกับฉัน
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-300">
                    {example.about}
                  </p>
                </div>
              </div>

              {/* Resume Body */}
              <div className="space-y-4 p-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                    ประสบการณ์ทำงาน
                  </h3>
                  <div className="space-y-3">
                    {example.experience.map((job) => (
                      <div key={job.title + job.company} className="flex items-start gap-2">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-coral" />
                        <div>
                          <p className="text-base font-semibold text-foreground">
                            {job.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {job.company} • {job.period}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                    ทักษะ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {example.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Score — same style as the resume history page */}
                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="mb-1.5 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <BrainCircuit className="size-3.5" /> AI score
                    </span>
                    <span className="font-semibold text-foreground">{example.aiScore}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${example.aiScore}%` }} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {example.aiNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Example switcher */}
            <button
              type="button"
              onClick={goToPrevExample}
              aria-label="ตัวอย่างก่อนหน้า"
              className="absolute left-0 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:border-coral hover:text-coral"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToNextExample}
              aria-label="ตัวอย่างถัดไป"
              className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:border-coral hover:text-coral"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <p className="mt-3 text-center text-sm text-muted-foreground">
              ตัวอย่างที่ {exampleIndex + 1} จาก {resumeExamples.length}
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.35s ease-out;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.35s ease-out;
        }
      `}</style>
    </div>
  )
}