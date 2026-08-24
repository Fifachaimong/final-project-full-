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

const POSTS_PER_PAGE = 12

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Post {
  id: string
  owner_id: string
  owner_name?: string | null

  // ชื่อบริษัท / หน่วยงาน
  company_name: string

  title: string
  faculty: string
  description: string
  model_provider?: string | null
  deadline: string

  // ชื่อ field ตรงกับ Backend / Database
  icon?: string | null

  is_open: boolean
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

  const [isOpen, setIsOpen] = useState(true)

  const [iconPreview, setIconPreview] =
    useState<string | null>(null)

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  // ──────────────────────────────────────────────
  // Reset / Load form
  // ──────────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    if (editPost) {
      setCompanyName(
        editPost.company_name ?? ""
      )

      setTitle(editPost.title ?? "")

      setFaculty(editPost.faculty ?? "")

      setDescription(
        editPost.description ?? ""
      )

      setModelProvider(
        editPost.model_provider ?? ""
      )

      setDeadline(
        editPost.deadline
          ? editPost.deadline.slice(0, 10)
          : ""
      )

      setIsOpen(editPost.is_open)

      // ใช้ icon ตรงกับ Backend
      setIconPreview(
        editPost.icon ?? null
      )

      setSelectedFile(null)
    } else {
      setCompanyName("")
      setTitle("")
      setFaculty("")
      setDescription("")
      setModelProvider("")
      setDeadline("")
      setIsOpen(true)
      setIconPreview(null)
      setSelectedFile(null)
    }

    setError("")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [editPost, open])

  // ──────────────────────────────────────────────
  // File
  // ──────────────────────────────────────────────

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    setSelectedFile(file)

    const reader = new FileReader()

    reader.onload = (ev) => {
      setIconPreview(
        ev.target?.result as string
      )
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

    // ตรวจข้อมูลที่จำเป็น
    if (
      !companyName.trim() ||
      !title.trim() ||
      !faculty.trim() ||
      !description.trim() ||
      !modelProvider.trim() ||
      !deadline
    ) {
      setError(
        "กรุณากรอกข้อมูลให้ครบทุกช่อง"
      )

      return
    }

    // ตรวจรูปแบบ YYYY-MM-DD
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
      let res: Response

      // ────────────────────────────────────────
      // EDIT
      // ────────────────────────────────────────

      if (isEdit && editPost) {
        res = await fetch("/api/posts", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",

          body: JSON.stringify({
            id: editPost.id,

            // company_name
            company_name: companyName,

            title,
            faculty,
            description,
            model_provider: modelProvider,
            deadline,

            // ใช้ icon
            icon: iconPreview,

            is_open: isOpen,
          }),
        })
      }

      // ────────────────────────────────────────
      // CREATE
      // ────────────────────────────────────────
      else {
        const formData = new FormData()

        // company_name
        formData.append(
          "company_name",
          companyName
        )

        formData.append(
          "title",
          title
        )

        formData.append(
          "faculty",
          faculty
        )

        formData.append(
          "description",
          description
        )

        formData.append(
          "model_provider",
          modelProvider
        )

        formData.append(
          "deadline",
          deadline
        )

        // ส่งไฟล์โดยใช้ชื่อ icon
        if (selectedFile) {
          formData.append(
            "icon",
            selectedFile
          )
        }

        res = await fetch("/api/posts", {
          method: "POST",
          credentials: "include",
          body: formData,
        })
      }

      const result = await res
        .json()
        .catch(() => null)

      // ────────────────────────────────────────
      // Permission
      // ────────────────────────────────────────

      if (
        res.status === 401 ||
        res.status === 403
      ) {
        setError(
          result?.message ||
            result?.error ||
            "คุณไม่มีสิทธิ์ดำเนินการนี้"
        )

        return
      }

      // ────────────────────────────────────────
      // Error
      // ────────────────────────────────────────

      if (!res.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "บันทึกประกาศไม่สำเร็จ"
        )
      }

      // ────────────────────────────────────────
      // Success
      // ────────────────────────────────────────

      onSaved()
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

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* Header */}

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">
            {isEdit
              ? "แก้ไขประกาศ"
              : "สร้างประกาศรับสมัคร"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {/* ─────────────────────────────────────
              Icon / Logo
          ───────────────────────────────────── */}

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted transition-colors hover:border-primary hover:bg-accent"
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

          {/* ─────────────────────────────────────
              Company Name
          ───────────────────────────────────── */}

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
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* ─────────────────────────────────────
              Title
          ───────────────────────────────────── */}

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
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* ─────────────────────────────────────
              Faculty
          ───────────────────────────────────── */}

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
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* ─────────────────────────────────────
              Description
          ───────────────────────────────────── */}

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
              className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* ─────────────────────────────────────
              Model Provider
          ───────────────────────────────────── */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">
              Model Provider{" "}
              <span className="text-destructive">
                *
              </span>
            </label>

            <input
              type="text"
              value={modelProvider}
              onChange={(e) =>
                setModelProvider(
                  e.target.value
                )
              }
              placeholder="เช่น OpenAI, Google, Anthropic"
              required
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* ─────────────────────────────────────
              Deadline
          ───────────────────────────────────── */}

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
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* ─────────────────────────────────────
              Status
          ───────────────────────────────────── */}

          {isEdit && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-card-foreground">
                สถานะ
              </label>

              <button
                type="button"
                onClick={() =>
                  setIsOpen((v) => !v)
                }
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  isOpen
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {isOpen
                  ? "เปิดรับสมัคร"
                  : "ปิดรับสมัคร"}
              </button>
            </div>
          )}

          {/* Error */}

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Buttons */}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
                : isEdit
                  ? "บันทึกการแก้ไข"
                  : "สร้างประกาศ"}
            </button>
          </div>
        </form>
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
  onDelete: (id: string) => void
  onEdit: (post: Post) => void
}

function PostCard({
  post,
  currentUserId,
  onDelete,
  onEdit,
}: PostCardProps) {
  const deadlineDate =
    new Date(post.deadline)

  const isExpired =
    deadlineDate < new Date()

  const isOpen =
    post.is_open && !isExpired

  const isCreator =
    !!currentUserId &&
    String(post.owner_id) ===
      String(currentUserId)

  return (
    <Link
      href={`/resume/${post.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Edit / Delete */}

      {isCreator && (
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

      {/* ─────────────────────────────────────
          Icon
      ───────────────────────────────────── */}

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
            {(post.company_name ||
              post.title ||
              "?")
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

      {/* ─────────────────────────────────────
          Post Information
      ───────────────────────────────────── */}

      <div className="flex flex-1 flex-col gap-1 px-4 py-3">
        {/* Company Name */}

        <p className="truncate text-xs font-medium text-primary">
          {post.company_name || "ไม่ระบุบริษัท"}
        </p>

        {/* Position */}

        <p className="truncate text-sm font-semibold text-card-foreground">
          {post.title}
        </p>

        {/* Faculty */}

        <p className="truncate text-xs text-muted-foreground">
          {post.faculty}
        </p>

        {/* Status / Deadline */}

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

  const [loadingUser, setLoadingUser] =
    useState(true)

  const currentUserId =
    currentUser?.id ?? ""

  const canManagePosts =
    currentUser?.role === "hr" ||
    currentUser?.role === "admin"

  // ──────────────────────────────────────────────
  // Current user
  // ──────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then((r) =>
        r.ok ? r.json() : null
      )
      .then((result) => {
        console.log(
          "ME API:",
          result
        )

        const user = result?.data

        if (user?.id) {
          setCurrentUser({
            id: String(user.id),
            name:
              user.firstname ?? "",
            lastname:
              user.lastname ?? "",
            email:
              user.email ?? "",
            role_id:
              user.role_id ?? 0,
            role:
              user.role ?? "",
          })
        }
      })
      .catch((error) => {
        console.error(
          "GET /api/me error:",
          error
        )
      })
      .finally(() => {
        setLoadingUser(false)
      })
  }, [])

  // ──────────────────────────────────────────────
  // Fetch posts
  // ──────────────────────────────────────────────

  const fetchPosts =
    useCallback(async () => {
      setLoading(true)

      try {
        const params =
          new URLSearchParams({
            search,
            filter,
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
            : Array.isArray(
                  result?.data
                )
              ? result.data
              : []

        setPosts(data)
      } catch (error) {
        console.error(
          "Fetch posts error:",
          error
        )

        setPosts([])
      } finally {
        setLoading(false)
      }
    }, [search, filter])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    setPage(1)
  }, [search, filter])

  // ──────────────────────────────────────────────
  // Pagination
  // ──────────────────────────────────────────────

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        posts.length /
          POSTS_PER_PAGE
      )
    )

  const paginatedPosts =
    posts.slice(
      (page - 1) *
        POSTS_PER_PAGE,
      page *
        POSTS_PER_PAGE
    )

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

  const handleDeleteConfirm =
    async () => {
      if (!deleteTarget) return

      try {
        const res = await fetch(
          `/api/posts?id=${encodeURIComponent(
            deleteTarget
          )}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        )

        const result =
          await res
            .json()
            .catch(() => null)

        if (
          res.status === 401 ||
          res.status === 403
        ) {
          console.error(
            result?.message ||
              result?.error ||
              "คุณไม่มีสิทธิ์ลบประกาศ"
          )

          return
        }

        if (!res.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              "ลบประกาศไม่สำเร็จ"
          )
        }

        setDeleteTarget(null)

        await fetchPosts()
      } catch (error) {
        console.error(
          "Delete post error:",
          error
        )
      }
    }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pt-6">
        {/* ─────────────────────────────────────
            Toolbar
        ───────────────────────────────────── */}

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

        {/* ─────────────────────────────────────
            Grid
        ───────────────────────────────────── */}

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
        ) : paginatedPosts.length ===
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
            {paginatedPosts.map(
              (post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={
                    currentUserId
                  }
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

        {/* ─────────────────────────────────────
            Pagination
        ───────────────────────────────────── */}

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
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from(
              {
                length: totalPages,
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
                page === totalPages
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────
          Create / Edit Dialog
      ───────────────────────────────────── */}

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

      {/* ─────────────────────────────────────
          Delete Dialog
      ───────────────────────────────────── */}

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