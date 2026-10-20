import crypto from "node:crypto";
import cloudinary from "../config/cloudinary.js";
import AppError from "./AppError.js";
import { DeleteManyFromCloudinary } from "./DeleteFromCloudinary.js";
import {
    ALLOWED_DOCUMENT_FORMATS,
    DOCUMENT_FOLDERS,
    DOCUMENT_LABELS,
    MAX_FILE_BYTES,
    MAX_FILE_LABEL,
} from "../config/upload.js";

const ASSET_RESOURCE_TYPES = ["image", "raw"];

const toSafeBaseName = (fileName = "") => {
    const parts = String(fileName).split(".");

    if (parts.length > 1) parts.pop();

    return parts
        .join(".")
        .normalize("NFC")
        .replace(/[^a-zA-Z0-9ก-๙_\-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
};

const publicIdPattern = (type, userId) =>
    new RegExp(`^${DOCUMENT_FOLDERS[type]}/\\d{13}-u${userId}-[a-f0-9]{12}(-[^/]*)?$`);

export const BuildPublicId = (type, userId, fileName) => {
    const safeName = toSafeBaseName(fileName);

    return (
        `${DOCUMENT_FOLDERS[type]}/${Date.now()}-u${userId}-` +
        crypto.randomBytes(6).toString("hex") +
        (safeName ? `-${safeName}` : "")
    );
};

export const CreateUploadSignature = (userId, { type, filename } = {}) => {
    if (!DOCUMENT_FOLDERS[type]) {
        throw new AppError("type must be resume or transcript", 400, "type");
    }

    const { cloud_name, api_key, api_secret } = cloudinary.config();

    if (!cloud_name || !api_key || !api_secret) {
        console.error("Cloudinary is not configured");
        throw new AppError("Upload service is not configured", 500);
    }

    const timestamp = Math.round(Date.now() / 1000);
    const public_id = BuildPublicId(type, userId, filename);
    const allowed_formats = ALLOWED_DOCUMENT_FORMATS.join(",");

    const signature = cloudinary.utils.api_sign_request(
        { allowed_formats, public_id, timestamp },
        api_secret
    );

    return {
        cloud_name,
        api_key,
        timestamp,
        signature,
        public_id,
        allowed_formats,
        upload_url: `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        max_file_bytes: MAX_FILE_BYTES,
    };
};

const isNotFound = (err) =>
    err?.error?.http_code === 404 || err?.http_code === 404;

const FindUploadedAsset = async (publicId) => {
    for (const resourceType of ASSET_RESOURCE_TYPES) {
        try {
            const asset = await cloudinary.api.resource(publicId, {
                resource_type: resourceType,
            });

            return { ...asset, resource_type: resourceType };
        } catch (err) {
            if (isNotFound(err)) continue;
            throw err;
        }
    }

    return null;
};

export const DeleteAssets = async (assets = []) => {
    const byType = {};

    for (const { publicId, resourceType } of assets) {
        if (!publicId) continue;
        (byType[resourceType || "image"] ||= []).push(publicId);
    }

    await Promise.all(
        Object.entries(byType).map(([resourceType, ids]) =>
            DeleteManyFromCloudinary(ids, resourceType)
        )
    );
};

export const ResolveDirectUpload = async (userId, type, publicId) => {
    const label = DOCUMENT_LABELS[type];

    if (typeof publicId !== "string" || !publicIdPattern(type, userId).test(publicId)) {
        throw new AppError(`ข้อมูลไฟล์ ${label} ไม่ถูกต้อง`, 400, type);
    }

    let asset;

    try {
        asset = await FindUploadedAsset(publicId);
    } catch (err) {
        console.error("Cloudinary lookup error:", err);
        throw new AppError("ตรวจสอบไฟล์ที่อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", 502);
    }

    if (!asset) {
        throw new AppError(`ไม่พบไฟล์ ${label} ที่อัปโหลด กรุณาอัปโหลดใหม่อีกครั้ง`, 400, type);
    }

    const assetRef = { publicId, resourceType: asset.resource_type };

    if (!ALLOWED_DOCUMENT_FORMATS.includes(String(asset.format).toLowerCase())) {
        await DeleteAssets([assetRef]);
        throw new AppError(`ไฟล์ ${label} ต้องเป็น PDF เท่านั้น`, 400, type);
    }

    if (asset.bytes > MAX_FILE_BYTES) {
        await DeleteAssets([assetRef]);
        throw new AppError(`ไฟล์ ${label} ต้องมีขนาดไม่เกิน ${MAX_FILE_LABEL}`, 413, type);
    }

    return {
        url: asset.secure_url,
        ...assetRef,
    };
};
