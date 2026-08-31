"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Trash2,
  Pencil,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useUser } from "@/contexts/user-context"

const POSTS_PER_PAGE = 10

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Post {
  id: string
  owner_id: string
  owner_name?: string | null

  company_name: string
  title: string
  faculty: string
  description: string
  model_provider?: string | null
  deadline: string

  icon?: string | null

  posts_status: "open" | "closed"
}

interface CurrentUser {
  id: string
  name: string
  lastname: string
  email: string
  role_id: number
  role: string
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * ตรวจสอบว่าโพสต์ยังเปิดรับสมัครจริงหรือไม่
 *
 * ต้องผ่าน 2 เงื่อนไข:
 * 1. posts_status === "open"
 * 2. deadline >= วันนี้
 *
 * deadline = วันนี้ -> ยังเปิดรับสมัคร
 * deadline < วันนี้ -> ปิดรับสมัคร
 */
function isPostActuallyOpen(post: Post): boolean {
  if (post.posts_status !== "open") {
    return false
  }

  if (!post.deadline) {
    return false
  }

  const deadlineDate = new Date(post.deadline)

  if (Number.isNaN(deadlineDate.getTime())) {
    return false
  }

  const now = new Date()

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )

  const deadline = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate()
  )

  return deadline >= today
}

/**
 * Normalize สถานะจาก Backend
 *
 * ถ้า Backend ยังส่ง open มา แต่ deadline หมดแล้ว
 * จะถูกมองเป็น closed ในฝั่ง Frontend
 */
function normalizePostStatus(post: Post): Post {
  return {
    ...post,
    posts_status: isPostActuallyOpen(post)
      ? "open"
      : "closed",
  }
}

// ──────────────────────────────────────────────
// Create / Edit Post Dialog
// ──────────────────────────────────────────────

interface PostDialogProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editPost?: Post | null
}

function PostDialog({
  open,
  onClose,
  onSaved,
  editPost,
}: PostDialogProps) {
  const isEdit = !!editPost

  const [companyName, setCompanyName] = useState("")
  const [title, setTitle] = useState("")
  const [faculty, setFaculty] = useState("")
  const [description, setDescription] = useState("")
  const [modelProvider, setModelProvider] = useState("")
  const [deadline, setDeadline] = useState("")

  const [postsStatus, setPostsStatus] =
    useState<"open" | "closed">("open")

  const [iconPreview, setIconPreview] =
    useState<string | null>(null)

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [loadingPost, setLoadingPost] = useState(false)
  const [error, setError] = useState("")

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  // ──────────────────────────────────────────────
  // Reset Form
  // ──────────────────────────────────────────────

  const resetForm = () => {
    setCompanyName("")
    setTitle("")
    setFaculty("")
    setDescription("")
    setModelProvider("")
    setDeadline("")

    setPostsStatus("open")

    setIconPreview(null)
    setSelectedFile(null)
    setError("")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // ──────────────────────────────────────────────
  // Load Post Detail
  // ──────────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    let cancelled = false

    const loadPost = async () => {
      // CREATE
      if (!editPost?.id) {
        resetForm()
        return
      }

      // EDIT
      setLoadingPost(true)
      setError("")

      try {
        const res = await fetch(
          `/api/posts/${encodeURIComponent(editPost.id)}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        )

        const text = await res.text()

        let result: any = null

        if (text) {
          try {
            result = JSON.parse(text)
          } catch {
            result = null
          }
        }

        if (!res.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              text ||
              `ไม่สามารถโหลดข้อมูลประกาศได้ (${res.status})`
          )
        }

        if (cancelled) return

        const post: Post =
          result?.data ?? result

        if (!post) {
          throw new Error("ไม่พบข้อมูลประกาศ")
        }

        setCompanyName(post.company_name ?? "")
        setTitle(post.title ?? "")
        setFaculty(post.faculty ?? "")
        setDescription(post.description ?? "")
        setModelProvider(post.model_provider ?? "")

        setDeadline(
          post.deadline
            ? String(post.deadline).slice(0, 10)
            : ""
        )

        // Backend status
        setPostsStatus(
          post.posts_status === "closed"
            ? "closed"
            : "open"
        )

        setIconPreview(post.icon ?? null)
        setSelectedFile(null)

        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } catch (error) {
        if (cancelled) return

        console.error(
          "Load post detail error:",
          error
        )

        setError(
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดข้อมูลประกาศได้"
        )
      } finally {
        if (!cancelled) {
          setLoadingPost(false)
        }
      }
    }

    loadPost()

    return () => {
      cancelled = true
    }
  }, [open, editPost?.id])

  // ──────────────────────────────────────────────
  // File
  // ──────────────────────────────────────────────

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น")
      e.target.value = ""
      return
    }

    setError("")
    setSelectedFile(file)

    const reader = new FileReader()

    reader.onload = (ev) => {
      const result = ev.target?.result

      if (typeof result === "string") {
        setIconPreview(result)
      }
    }

    reader.readAsDataURL(file)
  }

  // ──────────────────────────────────────────────
  // Submit
  // ──────────────────────────────────────────────

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (loadingPost) return

    // Validate
    if (
      !companyName.trim() ||
      !title.trim() ||
      !faculty.trim() ||
      !description.trim() ||
      !modelProvider.trim() ||
      !deadline
    ) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง")
      return
    }

    if (
      !/^[2-9][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[0-1])$/.test(
        deadline
      )
    ) {
      setError(
        "กำหนดการต้องอยู่ในรูปแบบ YYYY-MM-DD"
      )
      return
    }

    setSubmitting(true)
    setError("")

    try {
      // ────────────────────────────────────────
      // ตรวจสอบ Deadline
      // ────────────────────────────────────────

      const selectedDeadline = new Date(
        `${deadline}T00:00:00`
      )

      const now = new Date()

      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )

      const deadlineOnlyDate = new Date(
        selectedDeadline.getFullYear(),
        selectedDeadline.getMonth(),
        selectedDeadline.getDate()
      )

      const deadlineExpired =
        deadlineOnlyDate < today

      // ────────────────────────────────────────
      // EDIT
      // ────────────────────────────────────────

      if (isEdit && editPost?.id) {
        const formData = new FormData()

        formData.append(
          "company_name",
          companyName.trim()
        )

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
          "model_provider",
          modelProvider.trim()
        )

        formData.append(
          "deadline",
          deadline
        )

        /**
         * ถ้า deadline หมดแล้ว
         * ห้ามส่ง open ไป Backend
         *
         * ต่อให้ผู้ใช้กดสถานะ "เปิดรับสมัคร"
         * ระบบจะบังคับเป็น closed
         */
        const finalStatus =
          deadlineExpired
            ? "closed"
            : postsStatus

        formData.append(
          "posts_status",
          finalStatus
        )

        if (selectedFile) {
          formData.append(
            "icon",
            selectedFile
          )
        }

        const res = await fetch(
          `/api/posts/${encodeURIComponent(editPost.id)}`,
          {
            method: "PUT",
            credentials: "include",
            body: formData,
          }
        )

        const text = await res.text()

        let result: any = null

        if (text) {
          try {
            result = JSON.parse(text)
          } catch {
            result = null
          }
        }

        if (
          res.status === 401 ||
          res.status === 403
        ) {
          setError(
            result?.message ||
              result?.error ||
              "คุณไม่มีสิทธิ์แก้ไขประกาศนี้"
          )

          return
        }

        if (!res.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              text ||
              `แก้ไขประกาศไม่สำเร็จ (${res.status})`
          )
        }
      }

      // ────────────────────────────────────────
      // CREATE
      // ────────────────────────────────────────

      else {
        const formData = new FormData()

        formData.append(
          "company_name",
          companyName.trim()
        )

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
          "model_provider",
          modelProvider.trim()
        )

        formData.append(
          "deadline",
          deadline
        )

        /**
         * สร้างใหม่:
         *
         * deadline วันนี้หรืออนาคต -> open
         * deadline ผ่านแล้ว -> closed
         */
        formData.append(
          "posts_status",
          deadlineExpired
            ? "closed"
            : "open"
        )

        if (selectedFile) {
          formData.append(
            "icon",
            selectedFile
          )
        }

        const res = await fetch(
          "/api/posts",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        )

        const text = await res.text()

        let result: any = null

        if (text) {
          try {
            result = JSON.parse(text)
          } catch {
            result = null
          }
        }

        if (
          res.status === 401 ||
          res.status === 403
        ) {
          setError(
            result?.message ||
              result?.error ||
              "คุณไม่มีสิทธิ์สร้างประกาศ"
          )

          return
        }

        if (!res.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              text ||
              `สร้างประกาศไม่สำเร็จ (${res.status})`
          )
        }
      }

      await onSaved()
      onClose()
    } catch (error) {
      console.error(
        "Save post error:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ──────────────────────────────────────────────
  // Close
  // ──────────────────────────────────────────────

  const handleClose = () => {
    if (submitting) return

    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">
            {isEdit
              ? "แก้ไขประกาศ"
              : "สร้างประกาศรับสมัคร"}
          </h2>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loadingPost ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <p className="text-sm text-muted-foreground">
              กำลังโหลดข้อมูลประกาศ...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            {/* Icon */}

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={submitting}
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted transition-colors hover:border-primary hover:bg-accent disabled:opacity-50"
              >
                {iconPreview ? (
                  <Image
                    src={iconPreview}
                    alt="Company logo preview"
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
                {isEdit && iconPreview
                  ? "โลโก้ปัจจุบัน — เลือกไฟล์ใหม่เพื่อเปลี่ยน"
                  : "อัปโหลดโลโก้ (ไม่บังคับ)"}
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </div>

            {/* Company Name */}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-card-foreground">
                ชื่อบริษัท / หน่วยงาน{" "}
                <span className="text-destructive">
                  *
                </span>
              </label>

              <input
                type="text"
                value={companyName}
                onChange={(e) =>
                  setCompanyName(
                    e.target.value
                  )
                }
                placeholder="เช่น บริษัท ABC จำกัด"
                required
                disabled={submitting}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {/* Title */}

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
                placeholder="เช่น Software Developer"
                required
                disabled={submitting}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {/* Faculty */}

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
                  setFaculty(
                    e.target.value
                  )
                }
                placeholder="เช่น คณะวิศวกรรมศาสตร์"
                required
                disabled={submitting}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {/* Description */}

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
                rows={4}
                placeholder="อธิบายลักษณะงาน คุณสมบัติ ฯลฯ"
                required
                disabled={submitting}
                className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {/* Model Provider */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-card-foreground">
                Model Provider{" "}
                <span className="text-destructive">*</span>
              </label>

              <div className="relative group">
                <select
                  value={modelProvider}
                  onChange={(e) => setModelProvider(e.target.value)}
                  required
                  disabled={submitting}
                  className="
                    w-full
                    appearance-none
                    rounded-xl
                    border border-input
                    bg-background
                    px-4 py-3
                    pr-11
                    text-sm
                    text-foreground

                    shadow-sm
                    outline-none

                    transition-all
                    duration-300
                    ease-out

                    hover:border-primary/40
                    hover:shadow-md

                    focus:border-primary
                    focus:ring-4
                    focus:ring-primary/10
                    focus:shadow-lg
                    focus:shadow-primary/5

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    disabled:hover:border-input
                    disabled:hover:shadow-sm

                    cursor-pointer
                  "
                >
                  <option value="" disabled>
                    เลือก Model Provider
                  </option>

                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="claude">Claude</option>
                </select>

                {/* Smooth Arrow */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    right-0
                    top-1/2
                    -translate-y-1/2
                    mr-3
                    text-muted-foreground

                    transition-all
                    duration-300
                    ease-out

                    group-hover:text-primary
                    group-focus-within:text-primary
                  "
                >
                  <svg
                    className="
                      h-4 w-4
                      transition-transform
                      duration-300
                      ease-out
                      group-focus-within:rotate-180
                    "
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </div>
              </div>

              <p className="text-xs text-muted-foreground transition-opacity duration-300">
                เลือก AI Model Provider ที่ต้องการใช้งาน
              </p>
            </div>

            {/* Deadline */}

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
                required
                disabled={submitting}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />

              <p className="text-xs text-muted-foreground">
                หากกำหนดวันปิดรับสมัครผ่านไปแล้ว
                ระบบจะถือว่าปิดรับสมัครโดยอัตโนมัติ
              </p>
            </div>

            {/* Status */}

            {isEdit && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-card-foreground">
                  สถานะ
                </label>

                <div className="flex w-full gap-2">
                  {/* เปิดรับสมัคร */}
                  <button
                    type="button"
                    onClick={() => setPostsStatus("open")}
                    disabled={
                      submitting ||
                      (() => {
                        if (!deadline) return false

                        const selectedDeadline = new Date(
                          `${deadline}T00:00:00`
                        )

                        const now = new Date()

                        const today = new Date(
                          now.getFullYear(),
                          now.getMonth(),
                          now.getDate()
                        )

                        const deadlineDate = new Date(
                          selectedDeadline.getFullYear(),
                          selectedDeadline.getMonth(),
                          selectedDeadline.getDate()
                        )

                        return deadlineDate < today
                      })()
                    }
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      postsStatus === "open"
                        ? "border-green-500 bg-green-500/15 text-green-600 ring-1 ring-green-500/40 dark:text-green-400"
                        : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    เปิดรับสมัคร
                  </button>

                  {/* ปิดรับสมัคร */}
                  <button
                    type="button"
                    onClick={() => setPostsStatus("closed")}
                    disabled={submitting}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      postsStatus === "closed"
                        ? "border-red-500 bg-red-500/15 text-red-600 ring-1 ring-red-500/40 dark:text-red-400"
                        : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    ปิดรับสมัคร
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  เลือกสถานะของประกาศรับสมัคร
                </p>
              </div>
            )}

            {/* Error */}

            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2">
                <p className="text-sm text-destructive">
                  {error}
                </p>
              </div>
            )}

            {/* Buttons */}

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
                  loadingPost
                }
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting
                  ? "กำลังบันทึก..."
                  : isEdit
                    ? "บันทึกการแก้ไข"
                    : "สร้างประกาศ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Delete Dialog
// ──────────────────────────────────────────────

interface DeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
          <Trash2 className="h-5 w-5 text-destructive" />
        </div>

        <h2 className="mb-1 text-base font-semibold text-card-foreground">
          ลบประกาศ
        </h2>

        <p className="mb-5 text-sm text-muted-foreground">
          คุณต้องการลบประกาศนี้ใช่หรือไม่?
          การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            ลบประกาศ
          </button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Post Card
// ──────────────────────────────────────────────

interface PostCardProps {
  post: Post
  currentUserId: string
  currentUserRole: string
  onDelete: (id: string) => void
  onEdit: (post: Post) => void
}

function PostCard({
  post,
  currentUserId,
  currentUserRole,
  onDelete,
  onEdit,
}: PostCardProps) {
  const deadlineDate =
    new Date(post.deadline)

  // ──────────────────────────────────────────────
  // IMPORTANT
  //
  // เปิดรับสมัครจริงต้อง:
  // posts_status === "open"
  // และ deadline >= วันนี้
  // ──────────────────────────────────────────────

  const isOpen =
    isPostActuallyOpen(post)

  const isCreator =
    !!currentUserId &&
    String(post.owner_id) ===
      String(currentUserId)

  const isAdmin = currentUserRole === "admin"
  const canEditThisPost = isCreator || isAdmin

  return (
    <Link
      href={`/resume/${post.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Edit / Delete */}

      {canEditThisPost && (
        <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 opacity-0 transition-all duration-150 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onEdit(post)
            }}
            aria-label="แก้ไขประกาศ"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-150 hover:bg-primary hover:text-primary-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onDelete(post.id)
            }}
            aria-label="ลบประกาศ"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-150 hover:bg-destructive hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Icon */}

      <div className="relative flex h-40 items-center justify-center bg-muted">
        {post.icon ? (
          <Image
            src={post.icon}
            alt={`${post.company_name ?? post.title} logo`}
            width={120}
            height={120}
            className="h-32 w-32 object-contain"
            unoptimized
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-background text-2xl font-bold text-muted-foreground">
            {(
              post.company_name ||
              post.title ||
              "?"
            )
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        {/* Owner */}

        {post.owner_name && (
          <span className="absolute bottom-2 right-2.5 z-10 max-w-[80%] truncate rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            โดย {post.owner_name}
          </span>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Post Information */}

      <div className="flex flex-1 flex-col gap-1 px-4 py-3">
        <p className="truncate text-xs font-medium text-primary">
          {post.company_name || "ไม่ระบุบริษัท"}
        </p>

        <p className="truncate text-sm font-semibold text-card-foreground">
          {post.title}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {post.faculty}
        </p>

        <div className="mt-1 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isOpen
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {isOpen
              ? "เปิดรับสมัคร"
              : "ปิดรับสมัคร"}
          </span>

          <span className="text-[10px] text-muted-foreground">
            ถึง{" "}
            {deadlineDate.toLocaleDateString(
              "th-TH",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export default function ResumePage() {
  const [posts, setPosts] =
    useState<Post[]>([])

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null)

  const [search, setSearch] =
    useState("")

  const [filter, setFilter] =
    useState<
      "all" | "open" | "closed"
    >("all")

  const [page, setPage] =
    useState(1)

  const [dialogOpen, setDialogOpen] =
    useState(false)

  const [editTarget, setEditTarget] =
    useState<Post | null>(null)

  const [deleteTarget, setDeleteTarget] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [meta, setMeta] =
    useState<{
      total: number
      page: number
      limit: number
      hasnextPage: boolean
      hasPrevPage: boolean
      nextPage: number | null
      prevPage: number | null
    } | null>(null)

  const currentUserId =
    currentUser?.id ?? ""

  const canManagePosts =
    currentUser?.role === "hr" ||
    currentUser?.role === "admin"

  // ──────────────────────────────────────────────
  // Current User — reuses the single /api/me call made in <UserProvider>
  // instead of fetching it again on this page.
  // ──────────────────────────────────────────────

  const { user: contextUser, loading: loadingUser } = useUser()

  useEffect(() => {
    if (contextUser?.id) {
      setCurrentUser({
        id: String(contextUser.id),
        name: contextUser.firstname ?? "",
        lastname: contextUser.lastname ?? "",
        email: contextUser.email ?? "",
        role_id: contextUser.role_id ?? 0,
        role: contextUser.role ?? "",
      })
    } else {
      setCurrentUser(null)
    }
  }, [contextUser])

  // ──────────────────────────────────────────────
  // Fetch Posts
  // ──────────────────────────────────────────────

  const fetchPosts =
    useCallback(async () => {
      setLoading(true)

      try {
        const params =
          new URLSearchParams({
            search,
            page: String(page),
            limit: String(POSTS_PER_PAGE),
          })

        const res = await fetch(
          `/api/posts?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        )

        const text =
          await res.text()

        let result: any = null

        if (text) {
          try {
            result = JSON.parse(text)
          } catch {
            result = null
          }
        }

        if (!res.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              text ||
              `โหลดประกาศไม่สำเร็จ (${res.status})`
          )
        }

        const data: Post[] =
          Array.isArray(result)
            ? result
            : Array.isArray(result?.data)
              ? result.data
              : []

        // ─────────────────────────────────────
        // Normalize Status
        //
        // ตรงนี้สำคัญมาก
        //
        // ถ้า Backend ส่ง:
        //
        // posts_status = open
        // deadline = เมื่อวาน
        //
        // Frontend จะเปลี่ยนเป็น closed
        // ─────────────────────────────────────

        const normalizedData =
          data.map(normalizePostStatus)

        setPosts(normalizedData)
        setMeta(result?.meta ?? null)
      } catch (error) {
        console.error(
          "Fetch posts error:",
          error
        )

        setPosts([])
        setMeta(null)
      } finally {
        setLoading(false)
      }
    }, [search, page])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    setPage(1)
  }, [search, filter])

  // ──────────────────────────────────────────────
  // Pagination
  // ──────────────────────────────────────────────

  // ──────────────────────────────────────────────
  // Create
  // ──────────────────────────────────────────────

  const openCreate = () => {
    setEditTarget(null)
    setDialogOpen(true)
  }

  // ──────────────────────────────────────────────
  // Edit
  // ──────────────────────────────────────────────

  const openEdit = (
    post: Post
  ) => {
    setEditTarget(post)
    setDialogOpen(true)
  }

  // ──────────────────────────────────────────────
  // Delete
  // ──────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
  if (!deleteTarget) return

  try {
    const res = await fetch(
      `/api/posts/${encodeURIComponent(deleteTarget)}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    )

    const result = await res.json().catch(() => null)

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        result?.message ||
          result?.error ||
          "คุณไม่มีสิทธิ์ลบประกาศ"
      )
    }

    if (!res.ok) {
      throw new Error(
        result?.message ||
          result?.error ||
          `ลบประกาศไม่สำเร็จ (${res.status})`
      )
    }

    // ลบสำเร็จ
    setDeleteTarget(null)

    // โหลดรายการใหม่
    await fetchPosts()
  } catch (error) {
    console.error("Delete post error:", error)
  }
}

  // ──────────────────────────────────────────────
  // Filter
  //
  // กรองจากสถานะที่ normalize แล้ว
  // ดังนั้น deadline หมดจะไม่ติด open
  // ──────────────────────────────────────────────

  const filteredPosts =
    posts.filter((post) => {
      if (filter === "open") {
        return isPostActuallyOpen(post)
      }

      if (filter === "closed") {
        return !isPostActuallyOpen(post)
      }

      return true
    })

  // จำนวนหน้าจริงมาจาก backend (meta.total / meta.limit) เพราะ backend
  // เป็นคนตัดหน้าให้แล้ว (LIMIT/OFFSET) — ตัวกรองสถานะเปิด/ปิดข้างบนเป็นแค่
  // การกรองที่แสดงผลของหน้านั้น ๆ เพิ่มเติมฝั่ง client เท่านั้น (เพราะต้อง
  // เช็ค deadline ประกอบด้วย ซึ่ง backend filter ธรรมดายังไม่รองรับ)
  const totalPages =
    meta
      ? Math.max(
          1,
          Math.ceil(
            meta.total / meta.limit
          )
        )
      : 1

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pt-6">
        {/* Toolbar */}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Search */}

          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="ค้นหาตำแหน่งหรือคณะ..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="h-8 w-px bg-border" />

          {/* Filters */}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setFilter(
                  filter === "open"
                    ? "all"
                    : "open"
                )
              }
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                filter === "open"
                  ? "bg-green-500/15 text-green-600 ring-1 ring-green-500/40 dark:text-green-400"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              เปิดรับสมัคร
            </button>

            <div className="h-5 w-px bg-border" />

            <button
              type="button"
              onClick={() =>
                setFilter(
                  filter === "closed"
                    ? "all"
                    : "closed"
                )
              }
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                filter === "closed"
                  ? "bg-red-500/15 text-red-600 ring-1 ring-red-500/40 dark:text-red-400"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              ปิดรับสมัคร
            </button>
          </div>

          {/* Create */}

          {!loadingUser &&
            canManagePosts && (
              <button
                type="button"
                onClick={openCreate}
                className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <PlusCircle className="h-4 w-4" />
                สร้างประกาศ
              </button>
            )}
        </div>

        {/* Grid */}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : filteredPosts.length ===
          0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>

            <p className="text-base font-semibold text-foreground">
              ยังไม่มีงานไหนรับสมัคร
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {search ||
              filter !== "all"
                ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่"
                : "กดปุ่มสร้างประกาศเพื่อเพิ่มตำแหน่งงานใหม่"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPosts.map(
              (post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={
                    currentUserId
                  }
                  currentUserRole={currentUser?.role ?? ""}
                  onDelete={(id) =>
                    setDeleteTarget(
                      id
                    )
                  }
                  onEdit={openEdit}
                />
              )
            )}
          </div>
        )}

        {/* Pagination */}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2 pb-10">
            <button
              type="button"
              onClick={() =>
                setPage((p) =>
                  Math.max(
                    1,
                    p - 1
                  )
                )
              }
              disabled={
                !meta?.hasPrevPage
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, i) => i + 1
            ).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() =>
                  setPage(p)
                }
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    totalPages,
                    p + 1
                  )
                )
              }
              disabled={
                !meta?.hasnextPage
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}

      {canManagePosts && (
        <PostDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false)
            setEditTarget(null)
          }}
          onSaved={fetchPosts}
          editPost={editTarget}
        />
      )}

      {/* Delete Dialog */}

      <DeleteConfirmDialog
        open={
          deleteTarget !== null
        }
        onClose={() =>
          setDeleteTarget(null)
        }
        onConfirm={
          handleDeleteConfirm
        }
      />
    </main>
  )
}