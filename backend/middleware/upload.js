import multer from "multer";
import AppError from "../utils/AppError.js";
import { MAX_FILE_BYTES } from "../config/upload.js";

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_FILE_BYTES
    }
});

const isPdfFile = (file) => {
    const name = (file.originalname || "").toLowerCase();

    if (file.mimetype === "application/pdf") return true;

    const genericType = !file.mimetype || file.mimetype === "application/octet-stream";

    return genericType && name.endsWith(".pdf");
};

export const uploadPdf = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_FILE_BYTES
    },

    fileFilter: (req, file, cb) => {
        if (isPdfFile(file)) {
            return cb(null, true);
        }

        cb(new AppError("รองรับเฉพาะไฟล์ PDF เท่านั้น", 400, file.fieldname));
    }
});

export default upload;
