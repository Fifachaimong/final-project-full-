const registerSchema = {
    firstname : {
        type : 'string',
        required : true,
        validate : [
            {
                check : (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message : 'ชื่อต้องประกอบด้วยตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
            }
        ]
    },
    lastname : {
        type : 'string',
        required : true,
        validate : [
            {
                check : (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message : 'นามสกุลต้องประกอบด้วยตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
            }
        ]
    },
    email : {
        type : 'string',
        required : true,
        validate : [
            {
                check : (value) => /^[a-zA-Z0-9]{1,20}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
                message : 'กรุณากรอกอีเมลให้ถูกต้องตามรูปแบบ'
            }
        ]
    },
    password : {
        type : 'string',
        required : true,
        validate : [
            {
                check : (value) => /^(?=(?:.*[0-9]){5,})(?=.*[a-z])(?=.*[A-Z]).+$/.test(value),
                message : 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 5 ตัว และต้องมีตัวพิมพ์ใหญ่และตัวพิมพ์เล็กอย่างน้อย 1 ตัว'
            }
        ]
    },
    role : {
        type : ['applicant', 'hr'],
        required : false,
        default : 'applicant'
    }
}

const loginSchema = {
    email : {
        type : 'string',
        required : true
    },
    password : {
        type : 'string',
        required : true
    }
}

const editMyProfileSchema = {
    firstname : {
        type : 'string',
        required : false,
        validate : [
            {
                check : (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message : 'ชื่อต้องประกอบด้วยตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
            }
        ]
    },
    lastname : {
        type : 'string',
        required : false,
        validate : [
            {
                check : (value) => /^[a-zA-Zก-๙]+$/.test(value),
                message : 'นามสกุลต้องประกอบด้วยตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
            }
        ]
    },
    phone : {
        type : 'string',
        required : false,
        validate : [
            {
                check : (value) => /^[0-9]{10}$/.test(value),
                message : 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น'
            }
        ]
    }
}

export { registerSchema, loginSchema, editMyProfileSchema }