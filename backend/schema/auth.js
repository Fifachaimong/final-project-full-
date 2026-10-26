// กติกาความซับซ้อนของรหัสผ่าน — ใช้ร่วมกันตอนสมัครและตอนเปลี่ยนรหัสผ่าน
const passwordComplexity = {
    check: (value) => /^(?=(?:.*[0-9]){5,})(?=.*[a-z])(?=.*[A-Z]).+$/.test(value),
    message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 5 ตัว และต้องมีตัวพิมพ์ใหญ่และตัวพิมพ์เล็กอย่างน้อย 1 ตัว'
}

const registerSchema = {
    firstname: {
        type: 'string',
        required: true,
        validate: [
            {
                check: (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message: 'ชื่อต้องประกอบด้วยตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
            }
        ]
    },
    lastname: {
        type: 'string',
        required: true,
        validate: [
            {
                check: (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message: 'นามสกุลต้องประกอบด้วยตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
            }
        ]
    },
    email: {
        type: 'string',
        required: true,
        validate: [
            {
                check: (value) => /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
                message: 'กรุณากรอกอีเมลให้ถูกต้องตามรูปแบบ'
            }
        ]
    },
    password: {
        type: 'string',
        required: true,
        validate: [passwordComplexity]
    },
    role: {
        type: ['applicant'],
        required: false,
        default: 'applicant'
    }
}

const loginSchema = {
    email: {
        type: 'string',
        required: true
    },
    password: {
        type: 'string',
        required: true
    }
}

const editMyProfileSchema = {
    firstname: {
        type: 'string',
        required: false,
        validate: [
            {
                check: (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message: 'ชื่อต้องประกอบด้วยตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
            }
        ]
    },
    lastname: {
        type: 'string',
        required: false,
        validate: [
            {
                check: (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message: 'นามสกุลต้องประกอบด้วยตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
            }
        ]
    },
    phone: {
        type: 'string',
        required: false,
        validate: [
            {
                check: (value) => /^[0-9]{10}$/.test(value),
                message: 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น'
            }
        ]
    },
    student_id: {
        type: 'string',
        required: false,
        validate: [
            {
                check: (value) => /^[0-9]{11}-[0-9]$/.test(value),
                message: 'รหัสนักศึกษาต้องเป็นตัวเลข 11 หลัก ตามด้วยเครื่องหมาย - และตัวเลข 1 หลัก'
            }
        ]
    }
}

const changePasswordSchema = {
    current_password: {
        type: 'string',
        required: true
    },
    new_password: {
        type: 'string',
        required: true,
        validate: [
            passwordComplexity,
            {
                check: (value) => Buffer.byteLength(value, 'utf8') <= 72,
                message: 'รหัสผ่านยาวเกินไป (สูงสุด 72 ไบต์ โดยตัวอักษรไทยนับตัวละ 3 ไบต์)'
            }
        ]
    }
}

export { registerSchema, loginSchema, editMyProfileSchema, changePasswordSchema }