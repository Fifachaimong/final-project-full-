import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const UploadToCloudinary = async (
  buffer,
  mimeType,
  folder,
  fileName
) => {

  const decodedFileName = Buffer.from(fileName, "latin1").toString("utf8");

  const parts = decodedFileName.split(".");
  const extension = parts.length > 1 ? parts.pop() : null;
  const baseName = parts.join(".") || decodedFileName;

  const safeBaseName = baseName
    .normalize("NFC")
    .replace(/[^a-zA-Z0-9ก-๙_\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);

  const publicId = `${Date.now()}-${safeBaseName || "file"}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "auto",
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