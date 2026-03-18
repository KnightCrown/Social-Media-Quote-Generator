const toInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const SERVER_LIMITS = {
  maxFiles: toInt(process.env.MAX_FILES, 10),
  maxFileSizeMb: toInt(process.env.MAX_FILE_SIZE_MB, 15),
  maxOverlaySizeMb: toInt(process.env.MAX_OVERLAY_SIZE_MB, 10),
  jpegQuality: toInt(process.env.OUTPUT_JPEG_QUALITY, 90),
  tempTtlMinutes: toInt(process.env.TEMP_FILE_TTL_MINUTES, 30),
};

export const CLIENT_LIMITS = {
  maxFiles: toInt(process.env.NEXT_PUBLIC_MAX_FILES, SERVER_LIMITS.maxFiles),
  maxFileSizeMb: toInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB, SERVER_LIMITS.maxFileSizeMb),
};
