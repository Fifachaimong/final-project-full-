// ค่าจำกัดการอัปโหลดไฟล์ที่ใช้ร่วมกันทั้ง multer และการอัปโหลดตรงไป Cloudinary
// แก้ที่นี่ที่เดียว

export const MAX_FILE_BYTES = 5 * 1024 * 1024

export const MAX_FILE_LABEL = "5 MB"

// ชนิดไฟล์ที่รับสำหรับเอกสารสมัครงาน (resume / transcript)
export const ALLOWED_DOCUMENT_FORMATS = ["pdf"]

// ชนิดเอกสารที่อนุญาตให้ขอลายเซ็นอัปโหลด -> ชื่อโฟลเดอร์บน Cloudinary
export const DOCUMENT_FOLDERS = {
    resume: "resume",
    transcript: "transcript",
}

export const DOCUMENT_LABELS = {
    resume: "Resume",
    transcript: "Transcript",
}
