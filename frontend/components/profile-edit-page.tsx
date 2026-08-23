"use client"

import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Plus, User, Phone, Mail, Check, X } from "lucide-react"
import { Navbar } from "@/components/navbar"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileData {
  firstName: string
  surname: string
  phone: string
  email: string
  avatarUrl: string | null
  avatarFile: File | null
}

// ─── Avatar Uploader ──────────────────────────────────────────────────────────

function AvatarUploader({
  avatarUrl,
  editable = false,
  onFileChange,
  size = "lg",
}: {
  avatarUrl: string | null
  editable?: boolean
  onFileChange?: (file: File, url: string) => void
  size?: "sm" | "lg"
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const dim = size === "lg" ? "h-28 w-28" : "h-24 w-24"

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file || !onFileChange) return

    // สร้าง preview สำหรับแสดงรูปทันที
    const reader = new FileReader()

    reader.onloadend = () => {
      onFileChange(file, reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  return (
    <div className="relative mx-auto w-fit">
      <div
        className={`${dim} overflow-hidden rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-slate-100 to-slate-200`}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Profile avatar"
            loading="eager"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-10 w-10 text-slate-400" />
          </div>
        )}
      </div>

      {editable && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Change profile picture"
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#E8614A] text-white shadow-md transition-transform hover:scale-110 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFile}
          />
        </>
      )}
    </div>
  )
}

// ─── Field (display) ─────────────────────────────────────────────────────────

function DisplayField({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </label>

      <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
        {value || (
          <span className="text-slate-300 italic">
            ไม่ระบุ
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Field (input) ────────────────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  disabled = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  icon: React.ReactNode
  type?: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border px-3 text-sm shadow-sm outline-none transition ${
          disabled
            ? "cursor-not-allowed bg-slate-100 text-slate-500"
            : "border-slate-300 bg-white text-slate-800 focus:border-[#E8614A] focus:ring-2 focus:ring-[#E8614A]/20"
        }`}
      />
    </div>
  )
}

// ─── View Card ────────────────────────────────────────────────────────────────

function ViewCard({
  data,
  onEdit,
}: {
  data: ProfileData
  onEdit: () => void
}) {
  return (
    <div className="flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      <div className="rounded-t-3xl bg-gradient-to-r from-slate-800 to-slate-700 px-6 pb-8 pt-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          โปรไฟล์ของฉัน
        </p>

        <AvatarUploader
          avatarUrl={data.avatarUrl}
          editable={false}
          size="lg"
        />

        <div className="mt-4 text-center">
          <p className="text-lg font-bold text-white">
            {data.firstName || data.surname ? (
              `${data.firstName} ${data.surname}`.trim()
            ) : (
              <span className="text-slate-500 italic text-sm">
                ยังไม่ได้ตั้งชื่อ
              </span>
            )}
          </p>

          {data.email && (
            <p className="mt-0.5 text-xs text-slate-400">
              {data.email}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <DisplayField
            label="ชื่อ"
            value={data.firstName}
            icon={<User className="h-3 w-3" />}
          />

          <DisplayField
            label="นามสกุล"
            value={data.surname}
            icon={<User className="h-3 w-3" />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DisplayField
            label="โทรศัพท์"
            value={data.phone}
            icon={<Phone className="h-3 w-3" />}
          />

          <DisplayField
            label="อีเมล"
            value={data.email}
            icon={<Mail className="h-3 w-3" />}
          />
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onEdit}
          className="mt-2 w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-700 active:scale-[0.98]"
        >
          แก้ไขข้อมูล
        </button>
      </div>
    </div>
  )
}

// ─── Edit Card ────────────────────────────────────────────────────────────────

function EditCard({
  draft,
  onChange,
  onConfirm,
  onCancel,
}: {
  draft: ProfileData
  onChange: (
    field: keyof ProfileData,
    value: string | File | null
  ) => void
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex flex-1 flex-col rounded-3xl border border-[#E8614A]/30 bg-white shadow-xl shadow-orange-100/60">
      <div className="rounded-t-3xl bg-gradient-to-r from-[#E8614A] to-[#f0825f] px-6 pb-8 pt-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-orange-100">
          แก้ไขข้อมูล
        </p>

        <AvatarUploader
          avatarUrl={draft.avatarUrl}
          editable={true}
          onFileChange={(file, url) => {
            // url เอาไว้ preview
            onChange("avatarUrl", url)

            // file จริง เอาไว้ส่ง Backend
            onChange("avatarFile", file)
          }}
          size="lg"
        />

        <p className="mt-3 text-center text-xs text-orange-100/80">
          กดปุ่ม{" "}
          <strong className="text-white">+</strong>{" "}
          เพื่อเปลี่ยนรูปโปรไฟล์
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="ชื่อ"
            value={draft.firstName}
            onChange={(v) => onChange("firstName", v)}
            placeholder="ชื่อจริง"
            icon={<User className="h-3 w-3" />}
          />

          <InputField
            label="นามสกุล"
            value={draft.surname}
            onChange={(v) => onChange("surname", v)}
            placeholder="นามสกุล"
            icon={<User className="h-3 w-3" />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="โทรศัพท์"
            value={formatPhone(draft.phone)}
            onChange={(v) =>
              onChange("phone", v.replace(/\D/g, ""))
            }
            placeholder="081-234-5678"
            icon={<Phone className="h-3 w-3" />}
            type="tel"
          />

          <InputField
            label="อีเมล"
            value={draft.email}
            onChange={(v) => onChange("email", v)}
            placeholder="email@example.com"
            icon={<Mail className="h-3 w-3" />}
            type="text"
            disabled
          />
        </div>

        <div className="flex-1" />

        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="group flex items-center justify-center gap-2 rounded-xl border-2 border-red-500 bg-white py-3 text-sm font-semibold text-red-500 shadow-sm transition hover:bg-red-500 hover:text-white active:scale-[0.98]"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="group flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 hover:border-emerald-600 active:scale-[0.98]"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  return `${digits.slice(0, 3)}-${digits.slice(
    3,
    6
  )}-${digits.slice(6)}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ProfileEditPageProps {
  initialProfile: {
    id: number
    firstname: string | null
    lastname: string | null
    email: string | null
    phone: string | null
    icon: string | null
  } | null
}

export default function ProfileEditPage({
  initialProfile,
}: ProfileEditPageProps) {
  const router = useRouter()

  const [saved, setSaved] = useState<ProfileData>({
    firstName: initialProfile?.firstname ?? "",
    surname: initialProfile?.lastname ?? "",
    phone: initialProfile?.phone ?? "",
    email: initialProfile?.email ?? "",
    avatarUrl: initialProfile?.icon ?? null,
    avatarFile: null,
  })

  const [draft, setDraft] = useState<ProfileData>({
    ...saved,
  })

  const [isEditing, setIsEditing] = useState(false)

  const [toast, setToast] = useState<{
    msg: string
    type: "success" | "info"
  } | null>(null)

  const handleChange = (
    field: keyof ProfileData,
    value: string | File | null
  ) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEdit = () => {
    setDraft({
      ...saved,
      avatarFile: null,
    })

    setIsEditing(true)
  }

  const handleConfirm = async () => {
    try {
      /*
       * ใช้ FormData เพราะเราต้องส่งทั้ง
       *
       * firstname
       * lastname
       * phone
       * icon (File)
       *
       * ไป Backend
       */
      const formData = new FormData()

      formData.append("firstname", draft.firstName)
      formData.append("lastname", draft.surname)
      formData.append("phone", draft.phone)

      // ถ้ามีการเลือกรูปใหม่เท่านั้นถึงจะส่ง
      if (draft.avatarFile) {
        formData.append("icon", draft.avatarFile)
      }

      const response = await fetch(
        "http://localhost:5000/auth/profile",
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || "บันทึกไม่สำเร็จ"
        )
      }

      /*
       * Backend บันทึกเรียบร้อยแล้ว
       */
      router.refresh()

      setSaved({
        ...draft,
        avatarFile: null,
      })

      setIsEditing(false)

      showToast(
        "บันทึกข้อมูลเรียบร้อยแล้ว",
        "success"
      )
    } catch (err) {
      console.error(err)

      showToast(
        "บันทึกไม่สำเร็จ",
        "info"
      )
    }
  }

  const handleCancel = () => {
    setDraft({
      ...saved,
      avatarFile: null,
    })

    setIsEditing(false)

    showToast(
      "ยกเลิกการแก้ไข",
      "info"
    )
  }

  const showToast = (
    msg: string,
    type: "success" | "info"
  ) => {
    setToast({
      msg,
      type,
    })

    setTimeout(
      () => setToast(null),
      2500
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-white font-sans">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-500"
              : "bg-slate-600"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}

          {toast.msg}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Page title */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            ข้อมูลโปรไฟล์
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            จัดการข้อมูลส่วนตัวและรูปโปรไฟล์ของคุณ
          </p>
        </div>

        {/* Two-panel layout */}
        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          {/* LEFT — View */}
          <div
            className={`flex ${
              isEditing
                ? "flex-1"
                : "mx-auto w-full max-w-sm"
            }`}
          >
            <ViewCard
              data={saved}
              onEdit={handleEdit}
            />
          </div>

          {/* RIGHT — Edit */}
          {isEditing && (
            <>
              {/* Divider */}
              <div className="hidden items-center md:flex">
                <div className="flex h-full flex-col items-center gap-2">
                  <div className="flex-1 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

                  <div className="rounded-full border border-slate-200 bg-white p-2 shadow-sm">
                    <svg
                      viewBox="0 0 16 16"
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M2 8h12M9 5l3 3-3 3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                </div>
              </div>

              {/* RIGHT — Edit */}
              <div className="flex flex-1">
                <EditCard
                  draft={draft}
                  onChange={handleChange}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}