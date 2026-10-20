import { MAX_FILE_LABEL } from "../config/upload.js"

const MULTER_ERRORS = {
    LIMIT_FILE_SIZE : { status : 413, message : `ไฟล์ต้องมีขนาดไม่เกิน ${MAX_FILE_LABEL}` },
    LIMIT_UNEXPECTED_FILE : { status : 400, message : 'ส่งไฟล์ผิดช่องหรือจำนวนไฟล์เกินกำหนด' },
}

const ErrorMiddleware = (err, req, res, next) => {
    console.error(err)

    if (err.name === 'MulterError') {
        const mapped = MULTER_ERRORS[err.code] || { status : 400, message : 'อัปโหลดไฟล์ไม่สำเร็จ' }

        return res.status(mapped.status).json({
            message : mapped.message,
            field : err.field || null
        })
    }

    const statusError = err.status || 500

    if (err.field === null) {
        res.status(statusError).json({
            message : err.message || 'Internal Server Error',
        })
    }
    else {
        res.status(statusError).json({
            message : err.message || 'Internal Server Error',
            field : err.field || null
        })
    }
}

export default ErrorMiddleware