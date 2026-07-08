import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getSetting, setSetting } from "@/lib/db";

/**
 * Dashboard settings — owner only.
 *   GET  → current status (key masked)
 *   POST { carjamApiKey } → save ("" to remove)
 */

function mask(v: string | null): string | null {
  if (!v) return null;
  return v.length <= 4 ? "••••" : `••••••••${v.slice(-4)}`;
}

async function requireOwner() {
  const s = await getAdminSession();
  if (!s) return { error: "Unauthorised", status: 401 as const };
  if (!s.isOwner)
    return { error: "Only the owner can change settings.", status: 403 as const };
  return null;
}

export async function GET() {
  const denied = await requireOwner();
  if (denied)
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  const dbKey = getSetting("carjam_api_key");
  const envKey = process.env.PLATE_LOOKUP_API_KEY || null;
  return NextResponse.json({
    carjamApiKey: mask(dbKey ?? envKey),
    source: dbKey ? "dashboard" : envKey ? "environment" : null,
  });
}

export async function POST(req: NextRequest) {
  const denied = await requireOwner();
  if (denied)
    return NextResponse.json({ error: denied.error }, { status: denied.status });

  let key = "";
  try {
    key = String(
      ((await req.json()) as { carjamApiKey?: string }).carjamApiKey ?? "",
    ).trim();
  } catch {
    /* treat as clear */
  }
  setSetting("carjam_api_key", key);
  return NextResponse.json({ ok: true, carjamApiKey: mask(key || null) });
}
