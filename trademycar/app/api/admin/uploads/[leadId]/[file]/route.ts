import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * GET /api/admin/uploads/<leadId>/<file>
 *
 * Serves a lead's uploaded photos / offer document to the admin dashboard.
 * Protected by the same Basic Auth as /admin (see proxy.ts matcher).
 */

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".pdf": "application/pdf",
};

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ leadId: string; file: string }> },
) {
  const { leadId, file } = await ctx.params;

  // Path-traversal guard: only allow plain names we generated ourselves.
  if (!/^[\w.-]+$/.test(leadId) || !/^[\w.\- ()]+$/.test(file)) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "data", "uploads", leadId, file);
  try {
    const buf = await fs.readFile(filePath);
    const ext = path.extname(file).toLowerCase();
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${file}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
