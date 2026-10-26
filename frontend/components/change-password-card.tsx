"use client"

import { useId, useRef, useState } from "react"
import { Check, Circle, Eye, EyeOff, Loader2, Lock, X } from "lucide-react"
import { changePassword } from "@/app/actions/profile"

// กติกาเดียวกับตอนสมัคร (backend/schema/auth.js): ตัวเลขอย่างน้อย 5 ตัว + พิมพ์ใหญ่ + พิมพ์เล็ก
// bcrypt อ่านรหัสผ่านแค่ 72 ไบต์แรก จึงจำกัดไว้ที่ 72 ไบต์ (ตัวอักษรไทยนับตัวละ 3 ไบต์)
const MAX_BYTES = 72

const byteLength = (value: string) => new TextEncoder().encode(value).length

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  invalid = false,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete: string
  invalid?: boolean
  disabled?: boolean
}) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  return (
    <div className="min-w-0 space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider text-slate-400"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={invalid}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 w-full rounded-lg border bg-white pl-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 ${
            invalid
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-300 focus:border-[#E8614A] focus:ring-2 focus:ring-[#E8614A]/20"
          }`}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 transition hover:text-slate-600"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export function ChangePasswordCard({
  email,
  onSuccess,
}: {
  email?: string
  onSuccess: (message: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // ล็อกแบบทันที กันส่งซ้ำ (state อัปเดตช้ากว่าการกดซ้ำติดกัน)
  const inFlight = useRef(false)

  const rules = [
    {
      ok: (next.match(/[0-9]/g) ?? []).length >= 5,
      label: "ตัวเลขอย่างน้อย 5 ตัว",
    },
    { ok: /[A-Z]/.test(next), label: "ตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว" },
    { ok: /[a-z]/.test(next), label: "ตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว" },
  ]

  const tooLong = byteLength(next) > MAX_BYTES
  const sameAsCurrent = next.length > 0 && next === current
  const mismatch = confirm.length > 0 && confirm !== next

  const canSubmit =
    !submitting &&
    current.length > 0 &&
    rules.every((r) => r.ok) &&
    !tooLong &&
    !sameAsCurrent &&
    confirm.length > 0 &&
    confirm === next

  const close = () => {
    setOpen(false)
    setCurrent("")
    setNext("")
    setConfirm("")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (inFlight.current || !canSubmit) return

    inFlight.current = true
    setSubmitting(true)
    setError("")

    try {
      const result = await changePassword({
        currentPassword: current,
        newPassword: next,
      })

      if (!result.success) {
        // เก็บค่าที่กรอกไว้ ผู้ใช้แก้ช่องที่ผิดแล้วกดส่งซ้ำได้
        setError(result.message)
        return
      }

      close()
      onSuccess("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว")
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Lock className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">รหัสผ่าน</p>
          <p className="text-xs text-slate-400">
            เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี
          </p>
        </div>
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 w-full rounded-xl border-2 border-slate-800 bg-white py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-800 hover:text-white active:scale-[0.98]"
        >
          เปลี่ยนรหัสผ่าน
        </button>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {/* ช่อง username ซ่อนไว้ ให้โปรแกรมจัดการรหัสผ่านของเบราว์เซอร์อัปเดตบัญชีถูกอัน */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={email ?? ""}
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />

          <PasswordField
            label="รหัสผ่านปัจจุบัน"
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
            disabled={submitting}
          />

          <PasswordField
            label="รหัสผ่านใหม่"
            value={next}
            onChange={setNext}
            autoComplete="new-password"
            invalid={tooLong || sameAsCurrent}
            disabled={submitting}
          />

          <ul className="space-y-1 text-xs" aria-label="เงื่อนไขรหัสผ่านใหม่">
            {rules.map((rule) => (
              <li
                key={rule.label}
                className={`flex items-center gap-1.5 ${
                  rule.ok ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {rule.ok ? (
                  <Check className="h-3 w-3 shrink-0 stroke-[3]" />
                ) : (
                  <Circle className="h-3 w-3 shrink-0" />
                )}
                {rule.label}
              </li>
            ))}
          </ul>

          {tooLong && (
            <p className="text-xs text-red-500">
              รหัสผ่านยาวเกินไป (สูงสุด 72 ไบต์ ตัวอักษรไทยนับตัวละ 3 ไบต์)
            </p>
          )}

          {sameAsCurrent && (
            <p className="text-xs text-red-500">
              รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน
            </p>
          )}

          <PasswordField
            label="ยืนยันรหัสผ่านใหม่"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            invalid={mismatch}
            disabled={submitting}
          />

          {mismatch && (
            <p className="text-xs text-red-500">รหัสผ่านไม่ตรงกัน</p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600"
            >
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={close}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-500 bg-white py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-red-500"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:border-emerald-600 hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:hover:bg-slate-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  ยืนยัน
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
