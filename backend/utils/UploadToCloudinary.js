import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const UploadToCloudinary = async (
  buffer,
  mimeType,
  folder,
  fileName
) => {

  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop() : null;
  const baseName = parts.join(".") || fileName;

  const publicId = `${Date.now()}-${baseName}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "auto", // Cloudinary auto แยกรูปภาพ/ไฟล์เอกสาร (PDF, DOC ฯลฯ) ให้เอง
        ...(extension ? { format: extension } : {}),
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          publicUrl: result.secure_url,
          path: result.public_id,
          resourceType: result.resource_type,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
