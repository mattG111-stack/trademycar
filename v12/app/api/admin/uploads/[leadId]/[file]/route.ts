import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { getAdminSession } from "@/lib/auth";
import { signFile } from "@/lib/sign";

/**
 * GET /api/admin/uploads/<leadId>/<file>
 *
 * Serves a lead's uploaded photos / offer document to the admin dashboard.
 * Requires a logged-in session OR a valid per-file signature (?t=...),
 * which the dashboard stamps onto every photo link it renders.
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
  req: NextRequest,
  ctx: { params: Promise<{ leadId: string; file: string }> },
) {
  const { leadId, file } = await ctx.params;

  const sig = req.nextUrl.searchParams.get("t") ?? "";
  const signedOk = sig !== "" && sig === signFile(leadId, file);
  if (!signedOk && !(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

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
