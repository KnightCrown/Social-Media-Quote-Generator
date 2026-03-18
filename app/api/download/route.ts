import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";

import { cleanupExpiredFiles, readTempJpeg } from "@/lib/temp-storage";
import { ZipRequestFile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await cleanupExpiredFiles();

    const body = (await request.json()) as { files?: ZipRequestFile[] };
    const files = body.files ?? [];

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files selected for ZIP export." }, { status: 400 });
    }

    const zip = new JSZip();

    for (const file of files) {
      if (!file?.id || !file?.fileName) {
        continue;
      }

      const bytes = await readTempJpeg(file.id);
      const safeName = file.fileName.replace(/[^a-zA-Z0-9-_.]/g, "-");
      zip.file(safeName, bytes);
    }

    const archive = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    const archiveBuffer = Buffer.from(archive);

    return new Response(archiveBuffer, {
      status: 200,
      headers: {
        "content-type": "application/zip",
        "cache-control": "no-store",
        "content-disposition": 'attachment; filename="processed-images.zip"',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ZIP export failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
