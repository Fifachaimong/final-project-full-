"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  Users,
  X,
  Upload,
  Pencil,
  Send,
  Trash2,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useUser } from "@/contexts/user-context"

interface Applicant {
  user_id: string
  user_firstname: string
  user_lastname: string
  ai_score: number | null
  status: string | null
}

interface Post {
  id: string
  owner_id: string
  owner_name?: string | null
  owner_lastname?: string | null
  owner_phone?: string | null
  company_name: string
  title: string
  faculty: string
  description: string
  deadline: string
  icon?: string | null
  posts_status: string
  applicants?: Applicant[]
}

interface CurrentUser {
  id: string
  role: string
  name: string
  lastname: string
  email: string
}

function normalizeStatus(value: unknown): "open" | "closed" {
  if (typeof value === "boolean") {
    return value ? "open" : "closed"
  }

  if (typeof value === "number") {
    return value === 1 ? "open" : "closed"
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()

    return normalized === "1" ||
      normalized === "true" ||
      normalized === "yes" ||
      normalized === "open"
      ? "open"
      : "closed"
  }

  return "closed"
}

function getDeadlineDate(deadline: string): Date | null {
  if (!deadline) return null

  const dateOnly = deadline.slice(0, 10)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const parsed = new Date(deadline)

    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const [year, month, day] = dateOnly.split("-").map(Number)

  const date = new Date(
    year,
    month - 1,
    day,
    23,
    59,
    59,
    999
  )

  return Number.isNaN(date.getTime()) ? null : date
}

function isDeadlinePassed(deadline: string): boolean {
  const deadlineDate = getDeadlineDate(deadline)

  if (!deadlineDate) {
    return false
  }

  return new Date() > deadlineDate
}

function StatusBadge({
  isOpen,
}: {
  isOpen: boolean
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isOpen
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {isOpen ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
    </span>
  )
}

function ApplicantRow({
  index,
  applicant,
  postId,
  onDelete,
  deleting,
}: {
  index: number
  applicant: Applicant
  postId: string
  onDelete: (applicant: Applicant) => void
  deleting: boolean
}) {
  const initials = `${applicant.user_firstname?.charAt(0) ?? ""}${
    applicant.user_lastname?.charAt(0) ?? ""
  }`

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/member/${postId}/${applicant.user_id}`}
        className="flex flex-1 items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/40 hover:border-primary/30 cursor-pointer"
      >
      <span className="w-6 flex-shrink-0 text-center text-sm font-medium text-muted-foreground">
        {index}
      </span>

      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {initials.toUpperCase()}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">
          {applicant.user_firstname} {applicant.user_lastname}
        </span>

        <span className="truncate text-xs text-muted-foreground">
          User ID: {applicant.user_id}
        </span>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end">
        <span className="text-[11px] text-muted-foreground">
          AI Score
        </span>

        <span className="text-sm font-semibold text-foreground">
          {applicant.ai_score ?? "-"}
        </span>
      </div>

      <span className="flex-shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        {applicant.status ?? "-"}
      </span>
      </Link>

      <button
        type="button"
        onClick={() => onDelete(applicant)}
        disabled={deleting}
        title="ลบผู้สมัครคนนี้ออกจากรายชื่อ"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ApplyDialogProps {
  open: boolean
  onClose: () => void
  onApplied: () => void
  postId: string
  currentUser: CurrentUser | null
}

const RESUME_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const RESUME_ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
]

function validateDocumentFile(file: File): string | null {
  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase()

  const validType =
    RESUME_ALLOWED_TYPES.includes(file.type) ||
    (extension
      ? RESUME_ALLOWED_EXTENSIONS.includes(extension)
      : false)

  if (!validType) {
    return "รองรับเฉพาะไฟล์ PDF, DOC และ DOCX"
  }

  const maxSize = 10 * 1024 * 1024

  if (file.size > maxSize) {
    return "ไฟล์ต้องมีขนาดไม่เกิน 10 MB"
  }

  return null
}

function ApplyDialog({
  open,
  onClose,
  onApplied,
  postId,
  currentUser,
}: ApplyDialogProps) {
  const [resumeFile, setResumeFile] =
    useState<File | null>(null)

  const [transcriptFile, setTranscriptFile] =
    useState<File | null>(null)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState("")

  const resumeInputRef =
    useRef<HTMLInputElement>(null)

  const transcriptInputRef =
    useRef<HTMLInputElement>(null)

  const reset = () => {
    setResumeFile(null)
    setTranscriptFile(null)
    setError("")

    if (resumeInputRef.current) {
      resumeInputRef.current.value = ""
    }

    if (transcriptInputRef.current) {
      transcriptInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    if (submitting) return

    reset()
    onClose()
  }

  const handleResumeFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    const validationError =
      validateDocumentFile(file)

    if (validationError) {
      setError(validationError)
      e.target.value = ""
      return
    }

    setError("")
    setResumeFile(file)
  }

  const handleTranscriptFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    const validationError =
      validateDocumentFile(file)

    if (validationError) {
      setError(validationError)
      e.target.value = ""
      return
    }

    setError("")
    setTranscriptFile(file)
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!currentUser) {
      setError(
        "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง"
      )
      return
    }

    if (!resumeFile) {
      setError("กรุณาแนบไฟล์ Resume")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const formData = new FormData()

      formData.append(
        "name",
        currentUser.name
      )

      formData.append(
        "lastname",
        currentUser.lastname
      )

      formData.append(
        "email",
        currentUser.email
      )

      formData.append(
        "resume",
        resumeFile
      )

      if (transcriptFile) {
        formData.append(
          "transcript",
          transcriptFile
        )
      }

      const res = await fetch(
        `/api/apply/${encodeURIComponent(postId)}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      )

      const data =
        await res.json().catch(() => null)

      if (res.status === 409) {
        setError(
          data?.message ??
            data?.error ??
            "คุณได้สมัครตำแหน่งนี้ไปแล้ว"
        )
        return
      }

      if (res.status === 400) {
        setError(
          data?.message ??
            data?.error ??
            "ไม่สามารถสมัครได้"
        )
        return
      }

      if (res.status === 401) {
        setError(
          "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
        )
        return
      }

      if (!res.ok) {
        throw new Error(
          data?.message ??
            data?.error ??
            "Failed"
        )
      }

      reset()

      onApplied()
      onClose()
    } catch (error) {
      console.error(
        "Apply error:",
        error
      )

      setError(
        error instanceof Error &&
          error.message !== "Failed"
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              สมัครงาน
            </h2>

            <p className="text-xs text-muted-foreground">
              กรอกข้อมูลเพื่อสมัครตำแหน่งนี้
            </p>
          </div>

          <button
            onClick={handleClose}
            disabled={submitting}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="rounded-lg bg-muted/50 px-3 py-2.5">
            <p className="text-sm font-medium text-foreground">
              {currentUser
                ? `${currentUser.name} ${currentUser.lastname}`
                : "กำลังโหลดข้อมูล..."}
            </p>

            <p className="text-xs text-muted-foreground">
              {currentUser?.email ?? ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">
              Resume{" "}
              <span className="text-destructive">
                *
              </span>
            </label>

            <button
              type="button"
              onClick={() =>
                resumeInputRef.current?.click()
              }
              className="flex items-center gap-3 rounded-lg border border-dashed border-input bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-foreground"
            >
              <Upload className="h-4 w-4 flex-shrink-0" />

              <span className="truncate">
                {resumeFile?.name ||
                  "เลือกไฟล์ PDF, DOC, DOCX"}
              </span>
            </button>

            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleResumeFile}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">
              Transcript{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (ถ้ามี)
              </span>
            </label>

            <button
              type="button"
              onClick={() =>
                transcriptInputRef.current?.click()
              }
              className="flex items-center gap-3 rounded-lg border border-dashed border-input bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-foreground"
            >
              <Upload className="h-4 w-4 flex-shrink-0" />

              <span className="truncate">
                {transcriptFile?.name ||
                  "เลือกไฟล์ PDF, DOC, DOCX"}
              </span>
            </button>

            <input
              ref={transcriptInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleTranscriptFile}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                !currentUser
              }
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />

              {submitting
                ? "กำลังส่ง..."
                : "ส่งใบสมัคร"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditDialogProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  post: Post
}

function EditPostDialog({
  open,
  onClose,
  onSaved,
  post,
}: EditDialogProps) {
  const [title, setTitle] =
    useState(post.title)

  const [faculty, setFaculty] =
    useState(post.faculty)

  const [description, setDescription] =
    useState(post.description)

  const [deadline, setDeadline] =
    useState(
      post.deadline?.slice(0, 10) ?? ""
    )

  const [logoFile, setLogoFile] =
    useState<File | null>(null)

  const [logoPreview, setLogoPreview] =
    useState<string | null>(
      post.icon ?? null
    )

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState("")

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTitle(post.title)
    setFaculty(post.faculty)
    setDescription(post.description)

    setDeadline(
      post.deadline?.slice(0, 10) ?? ""
    )

    setLogoFile(null)
    setLogoPreview(post.icon ?? null)
    setError("")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [post, open])

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพ")

      e.target.value = ""
      return
    }

    const maxSize =
      5 * 1024 * 1024

    if (file.size > maxSize) {
      setError(
        "รูปโลโก้ต้องมีขนาดไม่เกิน 5 MB"
      )

      e.target.value = ""
      return
    }

    setError("")
    setLogoFile(file)

    setLogoPreview(
      URL.createObjectURL(file)
    )
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (
      !title.trim() ||
      !faculty.trim() ||
      !description.trim() ||
      !deadline
    ) {
      setError(
        "กรุณากรอกข้อมูลให้ครบ"
      )
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const formData = new FormData()

      formData.append(
        "title",
        title.trim()
      )

      formData.append(
        "faculty",
        faculty.trim()
      )

      formData.append(
        "description",
        description.trim()
      )

      formData.append(
        "deadline",
        deadline
      )

      formData.append(
        "posts_status",
        isDeadlinePassed(deadline)
          ? "closed"
          : "open"
      )

      if (logoFile) {
        formData.append(
          "icon",
          logoFile
        )
      }

      const res = await fetch(
        `/api/posts/${encodeURIComponent(
          post.id
        )}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      )

      const result =
        await res.json().catch(
          () => null
        )

      if (!res.ok) {
        throw new Error(
          result?.message ??
            result?.error ??
            "บันทึกการแก้ไขไม่สำเร็จ"
        )
      }

      onSaved()
      onClose()
    } catch (error) {
      console.error(
        "Edit post error:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => {
        if (!submitting) {
          onClose()
        }
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">
            แก้ไขประกาศ
          </h2>

          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted transition-colors hover:border-primary hover:bg-accent"
            >
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Logo"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-2xl object-cover"
                  unoptimized
                />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </button>

            <span className="text-xs text-muted-foreground">
              อัปโหลดโลโก้ (ไม่บังคับ)
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">
              ชื่อบริษัท{" "}
              <span className="text-destructive">
                *
              </span>
            </label>

            <input
              type="text"
              value={post.company_name}
              readOnly
              className="rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">
              ชื่อตำแหน่ง{" "}
              <span className="text-destructive">
                *
              </span>
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">
              คณะ / หน่วยงาน{" "}
              <span className="text-destructive">
                *
              </span>
            </label>

            <input
              type="text"
              value={faculty}
              onChange={(e) =>
                setFaculty(e.target.value)
              }
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">
              รายละเอียด{" "}
              <span className="text-destructive">
                *
              </span>
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={3}
              className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">
              วันปิดรับสมัคร{" "}
              <span className="text-destructive">
                *
              </span>
            </label>

            <input
              type="date"
              value={deadline}
              onChange={(e) =>
                setDeadline(
                  e.target.value
                )
              }
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <p className="text-xs text-muted-foreground">
              สถานะประกาศจะเปิด/ปิดอัตโนมัติตามวันที่นี้
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting
                ? "กำลังบันทึก..."
                : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface DeleteConfirmDialogProps {
  open: boolean
  applicant: Applicant | null
  submitting: boolean
  error: string
  onClose: () => void
  onConfirm: () => void
}

function DeleteConfirmDialog({
  open,
  applicant,
  submitting,
  error,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  if (!open || !applicant) return null

  const fullName =
    `${applicant.user_firstname ?? ""} ${
      applicant.user_lastname ?? ""
    }`.trim() || `User ID: ${applicant.user_id}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => {
        if (!submitting) {
          onClose()
        }
      }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-card-foreground">
                ลบผู้สมัครนี้ออก?
              </h2>

              <p className="text-xs text-muted-foreground">
                การลบนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 rounded-lg bg-muted/50 px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">
            {fullName}
          </p>

          <p className="text-xs text-muted-foreground">
            User ID: {applicant.user_id}
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />

            {submitting
              ? "กำลังลบ..."
              : "ยืนยันลบ"}
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessToast({
  message,
  onDone,
}: {
  message: string
  onDone: () => void
}) {
  useEffect(() => {
    const t = setTimeout(
      onDone,
      3000
    )

    return () =>
      clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 shadow-lg dark:border-green-800 dark:bg-green-900/30">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
        ✓
      </div>

      <p className="text-sm font-medium text-green-800 dark:text-green-300">
        {message}
      </p>
    </div>
  )
}

export default function PostDetailPage() {
  const { id } =
    useParams<{ id: string }>()

  const router = useRouter()

  const [post, setPost] =
    useState<Post | null>(null)

  const [applicants, setApplicants] =
    useState<Applicant[]>([])

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(false)

  const [applyOpen, setApplyOpen] =
    useState(false)

  const [editOpen, setEditOpen] =
    useState(false)

  const [toast, setToast] =
    useState("")

  const [deleteTarget, setDeleteTarget] =
    useState<Applicant | null>(null)

  const [deleting, setDeleting] =
    useState(false)

  const [deleteError, setDeleteError] =
    useState("")

  const normalizedRole =
    currentUser?.role
      ?.trim()
      .toLowerCase()

  const isHR =
    normalizedRole === "hr" ||
    normalizedRole === "admin"

  const isOwner =
    isHR &&
    post?.owner_id != null &&
    currentUser?.id != null &&
    String(post.owner_id) ===
      String(currentUser.id)

  // Reuses the single /api/me call made in <UserProvider> instead of
  // fetching it again on this page.
  const { user: contextUser } = useUser()

  useEffect(() => {
    if (contextUser?.id) {
      setCurrentUser({
        id: String(contextUser.id),
        role: contextUser.role ?? "",
        name: contextUser.firstname ?? "",
        lastname: contextUser.lastname ?? "",
        email: contextUser.email ?? "",
      })
    } else {
      setCurrentUser(null)
    }
  }, [contextUser])

  const fetchData =
    async () => {
      if (!id) return

      setLoading(true)
      setError(false)

      try {
        const res =
          await fetch(
            `/api/posts/${encodeURIComponent(id)}`,
            {
              method: "GET",
              credentials:
                "include",
              cache: "no-store",
            }
          )

        const text =
          await res.text()

        let result: any = null

        if (text) {
          try {
            result =
              JSON.parse(text)
          } catch {
            result = null
          }
        }

        if (!res.ok) {
          console.error(
            "Get post error:",
            res.status,
            result
          )

          throw new Error(
            result?.message ||
              result?.error ||
              `โหลดประกาศไม่สำเร็จ (${res.status})`
          )
        }

        const rawData =
          result?.data ?? result

        if (!rawData?.id) {
          throw new Error(
            "Post not found"
          )
        }

        const normalizedStatus =
          normalizeStatus(
            rawData.posts_status
          )

        const data: Post = {
          ...rawData,

          posts_status:
            normalizedStatus,

          company_name:
            rawData.company_name ??
            "",

          owner_id:
            String(
              rawData.owner_id ??
                ""
            ),

          owner_name:
            rawData.owner_name ??
            "",

          owner_lastname:
            rawData.owner_lastname ??
            "",

          owner_phone:
            rawData.owner_phone ??
            "",
        }

        setPost(data)

        if (
          Array.isArray(
            data.applicants
          )
        ) {
          setApplicants(
            data.applicants
          )
        }
      } catch (error) {
        console.error(
          "Fetch post detail error:",
          error
        )

        setPost(null)
        setApplicants([])
        setError(true)
      } finally {
        setLoading(false)
      }
    }

  const fetchApplicants =
    async () => {
      if (!id) {
        return
      }

      try {
        const res =
          await fetch(
            `/api/members/${encodeURIComponent(id)}`,
            {
              method: "GET",
              credentials:
                "include",
              cache: "no-store",
            }
          )

        const result =
          await res.json().catch(
            () => null
          )

        if (!res.ok) {
          console.error(
            "Get applicants error:",
            res.status,
            result
          )

          throw new Error(
            result?.message ||
              result?.error ||
              `โหลดรายชื่อผู้สมัครไม่สำเร็จ (${res.status})`
          )
        }

        const data =
          result?.data ?? result

        if (Array.isArray(data)) {
          setApplicants(data)
        } else {
          setApplicants([])
        }
      } catch (error) {
        console.error(
          "Fetch applicants error:",
          error
        )

        setApplicants([])
      }
    }

  useEffect(() => {
    fetchData()
  }, [id])

  useEffect(() => {
    if (
      isOwner &&
      id
    ) {
      fetchApplicants()
    }
  }, [
    isOwner,
    id,
  ])

  const handleApplied =
    () => {
      setToast(
        "ส่งใบสมัครเรียบร้อยแล้ว!"
      )

      fetchData()
    }

  const handlePostSaved =
    () => {
      setToast(
        "บันทึกการแก้ไขเรียบร้อยแล้ว!"
      )

      fetchData()
    }

  const openDeleteDialog = (
    applicant: Applicant
  ) => {
    setDeleteTarget(applicant)
    setDeleteError("")
  }

  const closeDeleteDialog = () => {
    if (deleting) return

    setDeleteTarget(null)
    setDeleteError("")
  }

  const handleConfirmDelete =
    async () => {
      if (!post || !deleteTarget) return

      setDeleting(true)
      setDeleteError("")

      try {
        const res = await fetch(
          `/api/member/${encodeURIComponent(
            post.id
          )}/${encodeURIComponent(
            deleteTarget.user_id
          )}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        )

        const result =
          await res.json().catch(
            () => null
          )

        if (!res.ok) {
          throw new Error(
            result?.message ??
              result?.error ??
              `ลบไม่สำเร็จ (${res.status})`
          )
        }

        setApplicants((prev) =>
          prev.filter(
            (a) =>
              a.user_id !==
              deleteTarget.user_id
          )
        )

        setDeleteTarget(null)

        setToast(
          "ลบผู้สมัครออกจากรายชื่อเรียบร้อยแล้ว"
        )
      } catch (error) {
        console.error(
          "Delete applicant error:",
          error
        )

        setDeleteError(
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาด กรุณาลองใหม่"
        )
      } finally {
        setDeleting(false)
      }
    }

  const isPositionOpen =
    post
      ? post.posts_status ===
          "open" &&
        !isDeadlinePassed(
          post.deadline
        )
      : false

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <div className="h-80 animate-pulse rounded-2xl bg-muted" />

            <div className="h-80 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="flex flex-col items-center justify-center py-40 text-center">
          <p className="text-lg font-semibold text-foreground">
            ไม่พบประกาศที่ต้องการ
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            ประกาศนี้อาจถูกลบหรือไม่มีอยู่ในระบบ
          </p>

          <button
            onClick={() =>
              router.push("/resume")
            }
            className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </main>
    )
  }

  const deadlineDate =
    getDeadlineDate(
      post.deadline
    )

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <button
          onClick={() =>
            router.push("/resume")
          }
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />

          กลับไปรายการ
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
                {post.icon ? (
                  <Image
                    src={post.icon}
                    alt={`${post.company_name} logo`}
                    width={128}
                    height={128}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-4xl font-bold text-muted-foreground">
                    {post.company_name
                      ?.charAt(0)
                      .toUpperCase() ||
                      post.title
                        .charAt(0)
                        .toUpperCase()}
                  </span>
                )}
              </div>

              <StatusBadge
                isOpen={
                  isPositionOpen
                }
              />
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  บริษัท
                </p>

                <p className="mt-0.5 text-base font-semibold text-foreground">
                  {post.company_name}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  ตำแหน่ง
                </p>

                <p className="mt-0.5 text-base font-semibold text-foreground">
                  {post.title}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  คณะ / หน่วยงาน
                </p>

                <p className="mt-0.5 text-sm text-foreground">
                  {post.faculty}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  วันปิดรับสมัคร
                </p>

                <p className="mt-0.5 text-sm text-foreground">
                  {deadlineDate
                    ? deadlineDate.toLocaleDateString(
                        "th-TH",
                        {
                          weekday:
                            "long",
                          day: "numeric",
                          month:
                            "long",
                          year:
                            "numeric",
                        }
                      )
                    : "-"}
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-2">
              {!isHR && (
                <button
                  onClick={() =>
                    setApplyOpen(true)
                  }
                  disabled={
                    !isPositionOpen
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isPositionOpen
                      ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98]"
                      : "cursor-not-allowed bg-muted text-muted-foreground"
                  }`}
                >
                  <Send className="h-4 w-4" />

                  {isPositionOpen
                    ? "สมัครงานตำแหน่งนี้"
                    : "ปิดรับสมัครแล้ว"}
                </button>
              )}

              {isOwner && (
                <button
                  onClick={() =>
                    setEditOpen(true)
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />

                  แก้ไขประกาศ
                </button>
              )}
            </div>
          </div>

          {isOwner ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />

                  <h2 className="text-base font-semibold text-foreground">
                    รายชื่อผู้สมัคร
                  </h2>
                </div>

                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {applicants.length} คน
                </span>
              </div>

              <div className="h-px bg-border" />

              {applicants.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <p className="text-sm font-medium text-foreground">
                    ขณะนี้ไม่มีคนสมัครอยู่
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    เมื่อมีผู้สมัครงาน
                    รายชื่อจะปรากฏที่นี่
                  </p>
                </div>
              ) : (
                <div className="flex max-h-[650px] flex-col gap-2 overflow-y-auto">
                  {applicants.map(
                    (
                      applicant,
                      index
                    ) => (
                      <ApplicantRow
                        key={`${applicant.user_id}-${index}`}
                        index={
                          index + 1
                        }
                        applicant={
                          applicant
                        }
                        postId={post.id}
                        onDelete={
                          openDeleteDialog
                        }
                        deleting={
                          deleting &&
                          deleteTarget?.user_id ===
                            applicant.user_id
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-base font-semibold text-foreground">
                ข้อมูลเพิ่มเติม
              </h2>

              <div className="h-px bg-border" />

              <div className="flex flex-col gap-4">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    วิธีการสมัคร
                  </p>

                  <p className="text-sm leading-relaxed text-foreground">
                    กดปุ่ม{" "}
                    <span className="font-semibold">
                      &quot;สมัครงานตำแหน่งนี้&quot;
                    </span>{" "}
                    ด้านซ้าย กรอกข้อมูล
                    และแนบ Resume
                    แล้วกดส่งใบสมัคร
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    รายละเอียด
                  </p>

                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                    {post.description?.trim() ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    ผู้ประกาศ
                  </p>

                  <p className="break-words text-sm text-foreground">
                    {post.owner_name ||
                      "-"}{" "}
                    {post.owner_lastname ||
                      ""}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    เบอร์โทรติดต่อ
                  </p>

                  <p className="break-words text-sm text-foreground">
                    {post.owner_phone ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isHR && (
        <ApplyDialog
          open={applyOpen}
          onClose={() =>
            setApplyOpen(false)
          }
          onApplied={
            handleApplied
          }
          postId={post.id}
          currentUser={
            currentUser
          }
        />
      )}

      {isOwner &&
        editOpen && (
          <EditPostDialog
            open={editOpen}
            onClose={() =>
              setEditOpen(false)
            }
            onSaved={
              handlePostSaved
            }
            post={post}
          />
        )}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        applicant={deleteTarget}
        submitting={deleting}
        error={deleteError}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      {toast && (
        <SuccessToast
          message={toast}
          onDone={() =>
            setToast("")
          }
        />
      )}
    </main>
  )
}