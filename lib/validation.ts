import { SERVER_LIMITS } from "@/lib/env";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const OVERLAY_MIME_TYPES = new Set(["image/png"]);

const mbToBytes = (mb: number) => mb * 1024 * 1024;

export const validateBaseImage = (file: File) => {
  if (!IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPG, PNG, or WEBP.");
  }

  if (file.size > mbToBytes(SERVER_LIMITS.maxFileSizeMb)) {
    throw new Error(`Base image exceeds ${SERVER_LIMITS.maxFileSizeMb}MB.`);
  }
};

export const validateOverlay = (file: File) => {
  if (!OVERLAY_MIME_TYPES.has(file.type)) {
    throw new Error("Overlay must be a PNG to preserve transparency.");
  }

  if (file.size > mbToBytes(SERVER_LIMITS.maxOverlaySizeMb)) {
    throw new Error(`Overlay exceeds ${SERVER_LIMITS.maxOverlaySizeMb}MB.`);
  }
};

export const validateQueueCount = (count: number) => {
  if (count < 1) {
    throw new Error("Upload at least one image.");
  }

  if (count > SERVER_LIMITS.maxFiles) {
    throw new Error(`Upload up to ${SERVER_LIMITS.maxFiles} images per batch.`);
  }
};
