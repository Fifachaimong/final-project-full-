# ResumeAnalysis

ระบบวิเคราะห์และคัดกรองเรซูเม่ผู้สมัครงานด้วย AI (AI-Powered Resume Screening & Recruitment Platform) พัฒนาขึ้นเพื่อเป็นตัวกลางระหว่างผู้สมัครงานที่ต้องการส่งเรซูเม่และติดตามผลการสมัคร กับฝ่ายทรัพยากรบุคคล (HR) ที่ต้องการเครื่องมือช่วยคัดกรองผู้สมัครจำนวนมากให้รวดเร็วและแม่นยำขึ้น

> โปรเจกต์นี้จัดทำขึ้นเพื่อการศึกษา (university course project)

---

## ✨ Features

- **สมัครงานออนไลน์** — ผู้สมัครอัปโหลดเรซูเม่และ Transcript เพื่อสมัครตำแหน่งงาน พร้อมติดตามสถานะการสมัครแบบเรียลไทม์
- **วิเคราะห์เรซูเม่ด้วย AI** — ให้คะแนน AI Score, Storytelling Score, Overall Confidence พร้อมสรุปทักษะและเหตุผลประกอบ
- **จัดการประกาศรับสมัครงาน (HR)** — สร้าง แก้ไข ปิด/เปิดรับสมัคร พร้อมอัปโหลดโลโก้บริษัท
- **คัดกรองผู้สมัคร (HR)** — ดูรายชื่อผู้สมัครพร้อมคะแนน AI กรองตามสถานะ (ผ่าน/ไม่ผ่าน/รอพิจารณา) และตัดสินผล
- **จัดการผู้ใช้งาน (Admin)** — เพิ่ม/แก้ไข/ลบบัญชีผู้ใช้ กำหนดบทบาท (admin, hr, applicant)
- **ระบบสิทธิ์ตามบทบาท (Role-based access)** — แต่ละบทบาทเห็นเมนูและหน้าที่ต่างกันตามสิทธิ์การใช้งาน

---

## 🧩 Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) (พร้อม custom token `coral`)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide React](https://lucide.dev/) (icons)

**Backend**
- [Express.js](https://expressjs.com/) — แยกเลเยอร์ `models/`, `service/`, `controllers/`
- [MySQL](https://www.mysql.com/) (ผ่าน `mysql2/promise`)
- [Supabase Storage](https://supabase.com/) — จัดเก็บไฟล์เรซูเม่/Transcript/โลโก้

**สถาปัตยกรรม**
- Next.js API Routes ทำหน้าที่เป็น **thin proxy layer** ส่งต่อ request (พร้อม cookies สำหรับ auth middleware) ไปยัง Express backend
- การอัปโหลดไฟล์ไปยัง Supabase ถูกจัดการที่ฝั่ง backend

---

## 📁 โครงสร้างโปรเจกต์ (ย่อ)

```
frontend/
├── app/
│   ├── api/               # Next.js API routes (proxy → Express backend)
│   ├── home/{admin,hr,applicant}/
│   ├── resume/            # รายการ/รายละเอียดประกาศงาน
│   ├── resumehistory/     # ประวัติการสมัครของผู้สมัคร
│   ├── member/[post_id]/[member_id]/  # รายละเอียดผู้สมัครรายบุคคล (HR)
│   ├── application/       # จัดการผู้ใช้งาน (Admin)
│   ├── profile/           # โปรไฟล์ผู้ใช้
│   ├── about/
│   ├── login/ register/
│   └── layout.tsx
├── components/            # Navbar, UserAvatar, UI components ฯลฯ
├── contexts/              # user-context (ดึง /api/me ครั้งเดียวทั้งแอป)
├── lib/                   # db, auth (JWT), utils
├── supabase/              # Supabase client/server/middleware
└── proxy.ts               # Route-based role protection (middleware)

backend/
├── models/                # DB queries
├── service/                # Business logic
├── controllers/           # Request handlers
└── server.js               # รวม routes (/auth, /hr, /admin, /applicant ฯลฯ)
```

---

## 🔐 บทบาทผู้ใช้งาน (Roles)

| บทบาท | หน้าแรก | สิทธิ์การใช้งาน |
|---|---|---|
| `admin` | `/home/admin` | จัดการบัญชีผู้ใช้ทั้งหมดในระบบ |
| `hr` | `/home/hr` | สร้าง/แก้ไข/ปิดประกาศงาน, ดูและคัดกรองผู้สมัคร |
| `applicant` | `/home/applicant` | สมัครงาน, ติดตามสถานะและคะแนน AI ของตนเอง |

---

## 🚀 การติดตั้งและเริ่มใช้งาน (Getting Started)

### สิ่งที่ต้องมี
- Node.js (แนะนำเวอร์ชัน LTS ล่าสุด)
- MySQL Server
- บัญชี [Supabase](https://supabase.com/) สำหรับเก็บไฟล์

### 1. Clone โปรเจกต์

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. ติดตั้ง dependencies

**Frontend**
```bash
cd frontend
npm install
```

**Backend**
```bash
cd backend
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในแต่ละโปรเจกต์ (frontend / backend) ตามตัวอย่างด้านล่าง:

```env
# Database
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=resume_analysis

# JWT
JWT_TOKEN=your_jwt_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

> ⚠️ ตรวจสอบชื่อ env var ของ Supabase ให้ตรงกับที่ตั้งไว้ใน Supabase Dashboard เสมอ (ใช้ `PUBLISHABLE_KEY` ไม่ใช่ `ANON_KEY`)

### 4. รันโปรเจกต์

**Backend** (ค่าเริ่มต้น `http://localhost:5000`)
```bash
cd backend
npm run dev
```

**Frontend** (ค่าเริ่มต้น `http://localhost:3000`)
```bash
cd frontend
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 🗺️ API Overview (สรุปคร่าว ๆ)

Next.js API routes (`/api/*`) ทำหน้าที่ proxy ไปยัง Express backend ตาม prefix ดังนี้:

| Prefix | ใช้งานโดย |
|---|---|
| `/auth/*` | ระบบล็อกอิน/สมัครสมาชิก/โปรไฟล์ (ทุกบทบาท) |
| `/hr/*` | ฟังก์ชันของ HR (จัดการประกาศงาน/ผู้สมัคร) |
| `/admin/*` | ฟังก์ชันของ Admin (จัดการผู้ใช้งาน) |
| `/applicant/*` | ฟังก์ชันของผู้สมัคร (สมัครงาน/ดูผลลัพธ์) |

---

## 👥 ผู้พัฒนา

| ชื่อ | หน้าที่ |
|---|---|
| นายจักรกฤษณ์ จาปัญญะ | Frontend Developer |
| นายนฤชิต ไชยมงคล | Backend Developer |
| นายกิตติภพ อินธิสาร | AI & API Developer |

---

## ☁️ การ Deploy

- **Frontend** — Deploy ด้วย [Vercel](https://vercel.com/)
- **Database** — ใช้ [Aiven](https://aiven.io/) สำหรับโฮสต์ฐานข้อมูล MySQL

---

## 📌 หมายเหตุสำหรับผู้พัฒนา

- โปรเจกต์นี้เป็นงานในรายวิชา จึงตั้งใจ **ไม่ใส่** ตราสัญลักษณ์พาร์ทเนอร์หรือองค์ประกอบที่สื่อถึงความเป็นทางการ/ความร่วมมือกับองค์กรจริง
- ทุกข้อความในหน้าเว็บใช้ภาษาไทย
- ตรวจสอบ Express mount prefix ใน `server.js` ให้ตรงกับ URL ที่ยิงจาก Next.js API routes เสมอ เพื่อป้องกัน proxy fail แบบเงียบ ๆ

---

## 📄 License

(พัฒนาขึ้นเพื่อเป็นส่วนหนึ่งของวิชาโครงงานวิศวกรรมซอฟต์แวร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา)