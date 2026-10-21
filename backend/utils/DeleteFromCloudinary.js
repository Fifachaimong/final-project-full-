import cloudinary from "../config/cloudinary.js";

const CHUNK_SIZE = 100;
const MAX_RETRIES = 2;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (error) => {
  const code = error?.http_code ?? error?.error?.http_code;

  return code === undefined || code === 420 || code === 429 || code >= 500;
};

const withRetry = async (task) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= MAX_RETRIES || !isRetryable(error)) throw error;

      await sleep(300 * 2 ** attempt);
    }
  }
};

export const ParseCloudinaryUrl = (url) => {
  if (typeof url !== "string" || !url) return null;

  const { cloud_name } = cloudinary.config();

  let pathname;

  try {
    pathname = new URL(url).pathname;
  } catch {
    return null;
  }

  const prefix = `/${cloud_name}/`;

  if (!cloud_name || !pathname.startsWith(prefix)) return null;

  const match = pathname
    .slice(prefix.length)
    .match(/^(image|video|raw)\/upload\/(.+)$/);

  if (!match) return null;

  const [, resourceType, rest] = match;

  const afterVersion = rest.match(/(?:^|\/)v\d+\/(.+)$/);

  let publicId = afterVersion ? afterVersion[1] : rest;

  try {
    publicId = decodeURIComponent(publicId);
  } catch {
    
  }

  if (resourceType !== "raw") {
    publicId = publicId.replace(/\.[^/.]+$/, "");
  }

  return publicId ? { resourceType, publicId } : null;
};

export const ExtractPublicId = (url) => ParseCloudinaryUrl(url)?.publicId ?? null;

export const DeleteManyFromCloudinary = async (
  publicIds,
  resourceType = "image"
) => {
  const summary = { deleted: [], notFound: [], failed: [] };

  const ids = [
    ...new Set(
      (publicIds || []).filter((id) => typeof id === "string" && id)
    ),
  ];

  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);

    try {
      const result = await withRetry(() =>
        cloudinary.api.delete_resources(chunk, {
          resource_type: resourceType,
          invalidate: true,
        })
      );

      for (const [id, status] of Object.entries(result?.deleted ?? {})) {
        if (status === "deleted") summary.deleted.push(id);
        else if (status === "not_found") summary.notFound.push(id);
        else summary.failed.push(id);
      }
    } catch (error) {
      console.error(
        `DeleteManyFromCloudinary error (${resourceType}, ${chunk.length} files):`,
        error
      );

      summary.failed.push(...chunk);
    }
  }

  if (summary.notFound.length > 0) {
    console.warn(
      `[cloudinary] ${summary.notFound.length} ${resourceType} file(s) not found ` +
        `(ถูกลบไปแล้ว หรือ resource_type ไม่ตรง): ${summary.notFound.slice(0, 5).join(", ")}`
    );
  }

  if (summary.failed.length > 0) {
    console.error(
      `[cloudinary] failed to delete ${summary.failed.length} ${resourceType} file(s): ` +
        summary.failed.slice(0, 5).join(", ")
    );
  }

  return summary;
};

export const DeleteByUrls = async (urls = []) => {
  const groups = {};

  for (const url of urls) {
    const parsed = ParseCloudinaryUrl(url);

    if (!parsed) continue;

    (groups[parsed.resourceType] ||= []).push(parsed.publicId);
  }

  const results = {};

  for (const [resourceType, ids] of Object.entries(groups)) {
    results[resourceType] = await DeleteManyFromCloudinary(ids, resourceType);
  }

  return results;
};
