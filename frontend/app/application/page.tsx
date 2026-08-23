"use client"

import { useState, useCallback, useEffect } from "react"
import useSWR from "swr"
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  X,
  User,
  Mail,
  Shield,
  Calendar,
  Hash,
  AlertTriangle,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Member {
  id: number
  firstname: string
  lastname: string | null
  email: string
  role: string
  created_at: string
}

type SortKey = "id" | "firstname" | "email" | "role" | "created_at"

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLES: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  hr: { label: "HR", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  applicant: { label: "Applicant", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
}

const fetcher = async (url: string) => {
  const r = await fetch(url)
  const data = await r.json()

  if (!r.ok) {
    throw new Error(data?.message ?? data?.error ?? "Failed to fetch")
  }

  if (!Array.isArray(data.data)) {
    throw new Error("Unexpected response format")
  }

  return data.data as Member[]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
  label,
  required,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  required?: boolean
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
        {hint && <span className="ml-1 normal-case font-normal text-muted-foreground/70">{hint}</span>}
      </label>
      <input
        {...props}
        required={required}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

// ─── MemberForm Modal ─────────────────────────────────────────────────────────

function MemberForm({
  member,
  onClose,
  onSaved,
}: {
  member?: Member | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!member
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", password: "", role: "applicant" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (member) {
      setForm({ firstname: member.firstname, lastname: member.lastname ?? "", email: member.email, password: "", role: member.role })
    } else {
      setForm({ firstname: "", lastname: "", email: "", password: "", role: "applicant" })
    }
  }, [member])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const payload: Record<string, unknown> = {
      firstname: form.firstname,
      lastname: form.lastname || null,
      role: form.role,
    }

    if (!isEdit) {
      payload.email = form.email
    }

    if (form.password) {
      payload.password = form.password
    }
    try {
      const res = await fetch(isEdit ? `/api/admin/members/${member!.id}` : "/api/admin/members", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return }
      onSaved()
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">
            {isEdit ? "Edit Member" : "New Member"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="First name" name="firstname" value={form.firstname} onChange={handleChange} required placeholder="John" />
            <InputField label="Last name" name="lastname" value={form.lastname} onChange={handleChange} placeholder="Doe" />
          </div>

          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            readOnly={isEdit}
            placeholder="john@example.com"
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required={!isEdit}
            placeholder="••••••••"
            hint={isEdit ? "(leave blank to keep)" : undefined}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Role <span className="text-destructive">*</span>
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {Object.entries(ROLES).map(([id, r]) => (
                <option key={id} value={id}>{r.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <div className="mt-1 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
              {loading ? "Saving..." : isEdit ? "Save changes" : "Create member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── MemberDetail Modal ────────────────────────────────────────────────────────

function MemberDetail({
  member,
  onClose,
  onEdit,
}: {
  member: Member
  onClose: () => void
  onEdit: () => void
}) {
  const role = ROLES[member.role] ?? { label: `Role ${member.role}`, className: "bg-muted text-muted-foreground border-border" }
  const createdAt = new Date(member.created_at).toLocaleString("th-TH", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
  const initials = [member.firstname[0], member.lastname?.[0]].filter(Boolean).join("").toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {initials || <User className="h-7 w-7" />}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-card-foreground">
              {member.firstname} {member.lastname ?? ""}
            </p>
            <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${role.className}`}>
              {role.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
          <InfoRow icon={<Hash className="h-4 w-4" />} label="ID" value={`#${member.id}`} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={member.email} />
          <InfoRow icon={<User className="h-4 w-4" />} label="Lastname" value={member.lastname ?? "—"} />
          <InfoRow icon={<Shield className="h-4 w-4" />} label="Role" value={role.label} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Created" value={createdAt} />
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
            Close
          </button>
          <button onClick={onEdit} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DeleteConfirm Modal ──────────────────────────────────────────────────────

function DeleteConfirm({
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  name: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">Delete member</p>
            <p className="text-xs text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{name}</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50">
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminMembersPage() {
  const { data: members, isLoading, error: fetchError, mutate } = useSWR<Member[]>("/api/admin/members", fetcher)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | "all">("all")
  const [sortKey, setSortKey] = useState<SortKey>("id")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const [showForm, setShowForm] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [viewMember, setViewMember] = useState<Member | null>(null)
  const [deleteMember, setDeleteMember] = useState<Member | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const memberList = Array.isArray(members) ? members : []

  const filtered = memberList
    .filter((m) => {
      const q = search.toLowerCase()
      const matchSearch =
        m.firstname.toLowerCase().includes(q) ||
        (m.lastname ?? "").toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      const matchRole = roleFilter === "all" || m.role === roleFilter
      return matchSearch && matchRole
    })
    .sort((a, b) => {
      let av: string | number = a[sortKey] ?? ""
      let bv: string | number = b[sortKey] ?? ""
      if (sortKey === "created_at") {
        av = new Date(String(av)).getTime()
        bv = new Date(String(bv)).getTime()
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })

    const handleDelete = useCallback(async () => {
      if (!deleteMember) return

      setDeleteLoading(true)

      try {
        const res = await fetch(`/api/admin/members/${deleteMember.id}`, {
          method: "DELETE",
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message ?? data.error ?? "Failed to delete member")
        }

        setDeleteMember(null)
        mutate()
      } catch (error) {
        console.error("Delete member error:", error)
      } finally {
        setDeleteLoading(false)
      }
    }, [deleteMember, mutate])

  const handleSaved = useCallback(() => {
    setShowForm(false)
    setEditMember(null)
    mutate()
  }, [mutate])

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
    ) : (
      <ChevronUp className="h-3 w-3 opacity-0 group-hover:opacity-30" />
    )

  const roleCounts = Object.entries(ROLES).map(([id, r]) => ({
    id,
    label: r.label,
    count: memberList.filter((m) => m.role === id).length,
  }))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="px-6 py-8">
        <div className="mx-auto max-w-6xl">

          {/* Page header */}
          <div className="mb-7 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Members</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Loading..." : fetchError ? "Error" : `${memberList.length} total`}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setEditMember(null); setShowForm(true) }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New member
            </button>
          </div>

          {/* Stats row */}
          {memberList.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-3">
              {roleCounts.map(({ id, label, count }) => {
                const role = ROLES[id]
                return (
                  <button
                    key={id}
                    onClick={() => setRoleFilter(roleFilter === id ? "all" : id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      roleFilter === id
                        ? role.className + " opacity-100"
                        : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-xs ${roleFilter === id ? "bg-white/20" : "bg-muted"}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <button
              onClick={() => mutate()}
              className="rounded-lg border border-border bg-transparent p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Error banner */}
          {fetchError && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{fetchError.message}. Please check your database connection environment variables.</span>
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {(
                      [
                        { key: "id", label: "ID", w: "w-16" },
                        { key: "firstname", label: "Name" },
                        { key: "email", label: "Email" },
                        { key: "role", label: "Role", w: "w-28" },
                        { key: "created_at", label: "Created", w: "w-44" },
                      ] as { key: SortKey; label: string; w?: string }[]
                    ).map(({ key, label, w }) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className={`group cursor-pointer select-none px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground ${w ?? ""}`}
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          <SortIcon col={key} />
                        </span>
                      </th>
                    ))}
                    <th className="w-28 px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 animate-pulse rounded bg-muted" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        No members found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((member) => {
                      const role = ROLES[member.role]
                      return (
                        <tr
                          key={member.id}
                          className="group border-b border-border last:border-0 transition hover:bg-muted/20"
                        >
                          <td className="px-4 py-3 text-muted-foreground">#{member.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {member.firstname[0].toUpperCase()}
                              </div>
                              <p className="font-medium text-foreground">
                                {member.firstname} {member.lastname ?? ""}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                role?.className ?? "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {role?.label ?? `Role ${member.role}`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(member.created_at).toLocaleString("th-TH", {
                              year: "numeric", month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setViewMember(member)}
                                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => { setEditMember(member); setShowForm(true) }}
                                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteMember(member)}
                                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!isLoading && filtered.length > 0 && (
              <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                Showing {filtered.length} of {members?.length ?? 0} members
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <MemberForm
          member={editMember}
          onClose={() => { setShowForm(false); setEditMember(null) }}
          onSaved={handleSaved}
        />
      )}
      {viewMember && (
        <MemberDetail
          member={viewMember}
          onClose={() => setViewMember(null)}
          onEdit={() => { setEditMember(viewMember); setViewMember(null); setShowForm(true) }}
        />
      )}
      {deleteMember && (
        <DeleteConfirm
          name={`${deleteMember.firstname} ${deleteMember.lastname ?? ""}`.trim()}
          onConfirm={handleDelete}
          onCancel={() => setDeleteMember(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}