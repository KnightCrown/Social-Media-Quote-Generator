import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { SERVER_LIMITS } from "@/lib/env";

const TEMP_ROOT = path.join(os.tmpdir(), "social-media-quote-generator");
const SAFE_ID = /^[a-zA-Z0-9_-]+$/;

const ensureRoot = async () => {
  await fs.mkdir(TEMP_ROOT, { recursive: true });
};

export const cleanupExpiredFiles = async () => {
  await ensureRoot();
  const entries = await fs.readdir(TEMP_ROOT);
  const threshold = Date.now() - SERVER_LIMITS.tempTtlMinutes * 60 * 1000;

  await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(TEMP_ROOT, entry);
      const stats = await fs.stat(filePath);
      if (stats.mtimeMs < threshold) {
        await fs.unlink(filePath).catch(() => undefined);
      }
    }),
  );
};

export const saveTempJpeg = async (buffer: Buffer) => {
  await ensureRoot();
  const id = crypto.randomUUID().replace(/-/g, "");
  const filePath = path.join(TEMP_ROOT, `${id}.jpg`);
  await fs.writeFile(filePath, buffer);
  return id;
};

export const readTempJpeg = async (id: string) => {
  if (!SAFE_ID.test(id)) {
    throw new Error("Invalid file id.");
  }

  const filePath = path.join(TEMP_ROOT, `${id}.jpg`);
  return fs.readFile(filePath);
};
