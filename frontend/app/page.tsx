"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";

export default function HomePage() {

  const router = useRouter();

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
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href={homeLink} className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-semibold">ResumeAnalysis</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/home"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-coral"
            >
              Home
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Resume
              <ChevronDown className="h-4 w-4" />
            </Link>
            {/* <Link
              href="#"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cover Letter
              <ChevronDown className="h-4 w-4" />
            </Link> */}
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              About Us
            </Link>
            {/* <Link
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link> */}
          </nav>

          {/* Auth Buttons - Top Right */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:block"
            >
              เข้าสู่ระบบ
            </Link>
            <Link href="/register">
              <Button className="bg-coral text-white hover:bg-coral/90">
                สมัครสมาชิก
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground">
                ระบบวิเคราะห์เรซูเม่ด้วยปัญญาประดิษฐ์
              </p>
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
                  className="bg-coral px-8 text-white hover:bg-coral/90"
                >
                  Create My Resume
                </Button>
              </Link>

              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-coral px-8 text-coral hover:bg-coral/10"
                >
                  See Examples
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Trusted by 5 million successful job seekers worldwide.
              </p>
              <div className="flex flex-wrap items-center gap-6 opacity-60">
                <span className="text-xl font-semibold tracking-tight text-foreground">
                  Google
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-foreground"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  facebook
                </span>
                <span className="text-xl font-bold tracking-widest text-foreground">
                  NASA
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-foreground"
                  fill="currentColor"
                >
                  <path d="M24 7.8L6.442 15.276c-1.456.616-2.679-.925-1.756-2.212l3.33-4.647c.248-.345.211-.82-.088-1.12L3.073 2.348c-.94-.966.16-2.453 1.418-1.916L24 7.8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Content - Resume Preview */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-card shadow-2xl">
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
                    <h2 className="text-xl font-bold">John Doe</h2>
                    <p className="text-sm text-neutral-400">
                      Senior Software Engineer
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      San Francisco, CA • michelle@email.com
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Profile
                  </h3>
                  <p className="text-xs leading-relaxed text-neutral-300">
                    Passionate software engineer with 8+ years of experience in
                    building scalable web applications. Expert in React,
                    Node.js, and cloud technologies.
                  </p>
                </div>
              </div>

              {/* Resume Body */}
              <div className="space-y-4 p-6">
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Experience
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-coral" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Digital Business Automation Specialist
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tech Corp Inc. • 2020 - Present
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-coral" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Account Executive
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Startup Inc. • 2018 - 2020
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-coral" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Inside Sales Specialist
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sales Co. • 2016 - 2018
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      Outbound
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      Closing Deals
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      Managing Accounts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}