import { NextRequest, NextResponse } from "next/server";

import { SERVER_LIMITS } from "@/lib/env";
import { OUTPUT_PRESETS, processWithOverlay } from "@/lib/image";
import { cleanupExpiredFiles, saveTempJpeg } from "@/lib/temp-storage";
import { ProcessImageResponse } from "@/lib/types";
import { validateBaseImage, validateOverlay } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await cleanupExpiredFiles();

    const formData = await request.formData();
    const image = formData.get("image");
    const overlay = formData.get("overlay");

    if (!(image instanceof File) || !(overlay instanceof File)) {
      return NextResponse.json({ error: "Image and overlay are required." }, { status: 400 });
    }

    validateBaseImage(image);
    validateOverlay(overlay);

    const baseBuffer = Buffer.from(await image.arrayBuffer());
    const overlayBuffer = Buffer.from(await overlay.arrayBuffer());

    const outputs: ProcessImageResponse["outputs"] = [];

    for (const preset of OUTPUT_PRESETS) {
      const finalBuffer = await processWithOverlay(
        baseBuffer,
        overlayBuffer,
        preset.width,
        preset.height,
        SERVER_LIMITS.jpegQuality,
      );

      const id = await saveTempJpeg(finalBuffer);
      const safeBaseName = image.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
      const fileName = `${safeBaseName}-${preset.kind}.jpg`;

      outputs.push({
        id,
        kind: preset.kind,
        width: preset.width,
        height: preset.height,
        fileName,
        downloadUrl: `/api/files/${id}?name=${encodeURIComponent(fileName)}`,
      });
    }

    return NextResponse.json<ProcessImageResponse>({
      inputName: image.name,
      outputs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
