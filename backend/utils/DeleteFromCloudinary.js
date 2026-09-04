import cloudinary from "../config/cloudinary.js";

export const ExtractPublicId = (url) => {
  if (!url) return null;

  const afterUpload = url.split("/upload/")[1];
  if (!afterUpload) return null;

  const withoutVersion = afterUpload.replace(/^v\d+\//, "");
  const withoutExt = withoutVersion.replace(/\.[^/.]+$/, "");

  return withoutExt;
};


export const DeleteManyFromCloudinary = async (
  publicIds,
  resourceType = "image"
) => {
  if (!publicIds || publicIds.length === 0) return;

  try {
    return await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("DeleteManyFromCloudinary error:", error);
  }
};
