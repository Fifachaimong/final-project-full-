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
import type { Post } from "@/app/api/posts/route"
import { Navbar } from "@/components/navbar"

const POSTS_PER_PAGE = 12

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
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

function PostDialog({ open, onClose, onSaved, editPost }: PostDialogProps) {
  const isEdit = !!editPost

  const [title, setTitle] = useState("")
  const [faculty, setFaculty] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isOpen, setIsOpen] = useState(true)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Populate fields when editing
  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title)
      setFaculty(editPost.faculty)
      setDescription(editPost.description)
      setDeadline(editPost.deadline.slice(0, 10))
      setIsOpen(editPost.is_open)
      setLogoPreview(editPost.logo_url ?? null)
    } else {
      setTitle("")
      setFaculty("")
      setDescription("")
      setDeadline("")
      setIsOpen(true)
      setLogoPreview(null)
    }
    setError("")
  }, [editPost, open])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !faculty || !description || !deadline) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      let res: Response

      const options: RequestInit = {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }

      if (isEdit && editPost) {
        res = await fetch(
          `http://localhost:5000/hr/posts/${editPost.id}`,
          {
            ...options,
            method: "PUT",
            body: JSON.stringify({
              title,
              faculty,
              description,
              deadline,
              logo_url: logoPreview,
              is_open: isOpen,
            }),
          }
        )
      } else {
        res = await fetch(
          "http://localhost:5000/hr/posts",
          {
            ...options,
            method: "POST",
            body: JSON.stringify({
              title,
              faculty,
              description,
              deadline,
              logo_url: logoPreview,
            }),
          }
        )
      }

      if (res.status === 401 || res.status === 403) {
        setError("คุณไม่มีสิทธิ์ดำเนินการนี้")
        return
      }

      if (!res.ok) {
        throw new Error("Failed")
      }

      onSaved()
      onClose()
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">
            {isEdit ? "แก้ไขประกาศ" : "สร้างประกาศรับสมัคร"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted transition-colors hover:border-primary hover:bg-accent"
            >
              {logoPreview ? (
                <Image src={logoPreview} alt="Logo preview" width={96} height={96} className="h-24 w-24 rounded-2xl object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
            <span className="text-xs text-muted-foreground">อัปโหลดโลโก้ (ไม่บังคับ)</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">ชื่อตำแหน่ง <span className="text-destructive">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น นักพัฒนาซอฟต์แวร์" className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">คณะ / หน่วยงาน <span className="text-destructive">*</span></label>
            <input type="text" value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="เช่น คณะวิศวกรรมศาสตร์" className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">รายละเอียด <span className="text-destructive">*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="อธิบายลักษณะงาน คุณสมบัติ ฯลฯ" className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">วันปิดรับสมัคร <span className="text-destructive">*</span></label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {isEdit && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-card-foreground">สถานะ</label>
              <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  isOpen
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {isOpen ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
              </button>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              ยกเลิก
            </button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
              {submitting ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างประกาศ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Delete Confirm Dialog
// ──────────────────────────────────────────────
interface DeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

function DeleteConfirmDialog({ open, onClose, onConfirm }: DeleteDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
          <Trash2 className="h-5 w-5 text-destructive" />
        </div>
        <h2 className="mb-1 text-base font-semibold text-card-foreground">ลบประกาศ</h2>
        <p className="mb-5 text-sm text-muted-foreground">คุณต้องการลบประกาศนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">ยกเลิก</button>
          <button onClick={onConfirm} className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">ลบประกาศ</button>
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

function PostCard({ post, currentUserId, onDelete, onEdit }: PostCardProps) {
  const deadlineDate = new Date(post.deadline)
  const isExpired = deadlineDate < new Date()
  const isOpen = post.is_open && !isExpired
  // แก้ไขได้เฉพาะคนที่สร้างโพสนี้เท่านั้น
  const isCreator = !!currentUserId && String(post.owner_id) === String(currentUserId)

  return (
    <Link
      href={`/resume/${post.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      {isCreator && (
        <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 opacity-0 transition-all duration-150 group-hover:opacity-100">
          {/* Edit button — เฉพาะคนที่สร้างโพสนี้เท่านั้น */}
          <button
            onClick={(e) => {
              e.preventDefault()
              onEdit(post)
            }}
            aria-label="แก้ไขประกาศ"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-150 hover:bg-primary hover:text-primary-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {/* Delete button — เฉพาะคนที่สร้างโพสนี้เท่านั้น */}
          <button
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

      <div className="relative flex h-40 items-center justify-center bg-muted">
        {post.logo_url ? (
          <Image src={post.logo_url} alt={`${post.title} logo`} width={120} height={120} className="h-32 w-32 object-contain" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-background text-2xl font-bold text-muted-foreground">
            {post.title.charAt(0).toUpperCase()}
          </div>
        )}
        {/* ชื่อผู้ประกาศรับ */}
        {post.owner_name && (
          <span className="absolute bottom-2 right-2.5 z-10 max-w-[80%] truncate rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            โดย {post.owner_name}
          </span>
        )}
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-1 flex-col gap-1 px-4 py-3">
        <p className="truncate text-sm font-semibold text-card-foreground">{post.title}</p>
        <p className="truncate text-xs text-muted-foreground">{post.faculty}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${isOpen ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
            {isOpen ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            ถึง{" "}
            {deadlineDate.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
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
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Post | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingUser, setLoadingUser] = useState(true)

  const currentUserId = currentUser?.id ?? ""
  const canManagePosts = currentUser?.role === "hr" || currentUser?.role === "admin"

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.id) setCurrentUser(data as CurrentUser) })
      .catch(() => {})
      .finally(() => setLoadingUser(false))
  }, [])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, filter })
    const res = await fetch(`/api/posts?${params}`)
    const data: Post[] = await res.json()
    setPosts(data)
    setLoading(false)
  }, [search, filter])

  useEffect(() => { fetchPosts() }, [fetchPosts])
  useEffect(() => { setPage(1) }, [search, filter])

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))
  const paginatedPosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await fetch(`/api/posts?id=${deleteTarget}`, { method: "DELETE" })
    setDeleteTarget(null)
    fetchPosts()
  }

  const openCreate = () => {
    setEditTarget(null)
    setDialogOpen(true)
  }

  const openEdit = (post: Post) => {
    setEditTarget(post)
    setDialogOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pt-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาตำแหน่งหรือคณะ..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter(filter === "open" ? "all" : "open")}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${filter === "open" ? "bg-green-500/15 text-green-600 ring-1 ring-green-500/40 dark:text-green-400" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              เปิดรับสมัคร
            </button>
            <div className="h-5 w-px bg-border" />
            <button
              onClick={() => setFilter(filter === "closed" ? "all" : "closed")}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${filter === "closed" ? "bg-red-500/15 text-red-600 ring-1 ring-red-500/40 dark:text-red-400" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              ปิดรับสมัคร
            </button>
          </div>

          {!loadingUser && canManagePosts && (
            <button
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
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : paginatedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground">ยังไม่มีงานไหนรับสมัคร</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || filter !== "all"
                ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่"
                : "กดปุ่มสร้างประกาศเพื่อเพิ่มตำแหน่งงานใหม่"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {paginatedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onDelete={(id) => setDeleteTarget(id)}
                onEdit={openEdit}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2 pb-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {canManagePosts && (
        <PostDialog
          open={dialogOpen}
          onClose={() => { setDialogOpen(false); setEditTarget(null) }}
          onSaved={fetchPosts}
          editPost={editTarget}
        />
      )}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </main>
  )
}