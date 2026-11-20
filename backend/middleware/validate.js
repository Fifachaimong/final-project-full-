import AppError from "../utils/AppError.js"

const FIELD_LABELS = {
    firstname: "ชื่อ",
    lastname: "นามสกุล",
    email: "อีเมล",
    password: "รหัสผ่าน",
    current_password: "รหัสผ่านปัจจุบัน",
    new_password: "รหัสผ่านใหม่",
    role: "บทบาท",
    phone: "หมายเลขโทรศัพท์",
    student_id: "รหัสนักศึกษา",
    company_name: "ชื่อบริษัท/หน่วยงาน",
    title: "ชื่อตำแหน่ง",
    faculty: "คณะ/สาขา",
    description: "รายละเอียดงาน",
    model_provider: "AI Model Provider",
    deadline: "กำหนดการ",
    posts_status: "สถานะประกาศ",
    status: "สถานะผู้สมัคร",
    type: "ประเภทไฟล์",
    filename: "ชื่อไฟล์",
    size: "ขนาดไฟล์",
}

const ENUM_LABELS = {
    applicant: "ผู้สมัคร",
    hr: "HR",
    admin: "ผู้ดูแลระบบ",
    pending: "รอพิจารณา",
    approved: "ผ่านการพิจารณา",
    rejected: "ไม่ผ่านการพิจารณา",
    open: "เปิดรับสมัคร",
    closed: "ปิดรับสมัคร",
    resume: "Resume",
    transcript: "Transcript",
}

const getFieldLabel = (field) => FIELD_LABELS[field] || "ข้อมูล"

export const ValidateBody = (schema) => {
    return (req, res, next) => {
        const data = req.body
        for (const key in data) {
            if (!(key in schema)) {
                return next(new AppError('ไม่อนุญาตให้ส่งข้อมูลช่องนี้', 400, key))
            }
        }
        
        for (const key in schema) {
            const rule = schema[key]
            const value = data[key]
            if (rule.required && value === undefined) {
                return next(new AppError(`กรุณากรอก${getFieldLabel(key)}`, 400, key))
            }

            if (!rule.required && value === undefined) {
                if (rule.default !== undefined) {
                    data[key] = rule.default
                }

                continue
            }

            if (rule.type === 'string') {
                if (typeof value !== 'string') {
                    return next(new AppError(`${getFieldLabel(key)}ไม่ถูกต้อง`, 400, key))
                }
                if (!value.trim()) {
                    return next(new AppError(`${getFieldLabel(key)}ห้ามเว้นว่าง`, 400, key))
                }
            }
            
            if (rule.type === 'number') {
                if (typeof value !== 'number') {
                    return next(new AppError(`${getFieldLabel(key)}ต้องเป็นตัวเลข`, 400, key))
                }
            }

            if (Array.isArray(rule.type)) {
                if (!rule.type.includes(value)) {
                    const allowedValues = rule.type.map((item) => ENUM_LABELS[item] || item).join(' หรือ ')
                    return next(new AppError(`${getFieldLabel(key)}ไม่ถูกต้อง กรุณาเลือก${allowedValues}`, 400, key))
                }
            }

            if (rule.validate) {
                for (const item of rule.validate) {
                    if (!item.check(value)) {
                        return next(new AppError(item.message, 400, key))
                    }
                }
            }
            
        }
        next()
    }
}