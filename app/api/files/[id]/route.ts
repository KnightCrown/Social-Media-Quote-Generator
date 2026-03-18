import { NextRequest } from "next/server";

import { cleanupExpiredFiles, readTempJpeg } from "@/lib/temp-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    await cleanupExpiredFiles();

    const bytes = await readTempJpeg(context.params.id);
    const requestedName = request.nextUrl.searchParams.get("name") ?? `${context.params.id}.jpg`;
    const safeName = requestedName.replace(/[^a-zA-Z0-9-_.]/g, "-");

    return new Response(bytes, {
      status: 200,
      headers: {
        "content-type": "image/jpeg",
        "cache-control": "no-store",
        "content-disposition": `attachment; filename=\"${safeName}\"`,
      },
    });
  } catch {
    return new Response("File not found or expired.", { status: 404 });
  }
}
