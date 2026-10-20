import { MAX_FILE_BYTES, MAX_FILE_LABEL } from "../config/upload.js"

const uploadSignatureSchema = {
    type : {
        type : ['resume', 'transcript'],
        required : true
    },
    filename : {
        type : 'string',
        required : false
    },
    size : {
        type : 'number',
        required : false,
        validate : [
            {
                check : (value) => value > 0 && value <= MAX_FILE_BYTES,
                message : `ไฟล์ต้องมีขนาดไม่เกิน ${MAX_FILE_LABEL}`
            }
        ]
    }
}

export { uploadSignatureSchema }
