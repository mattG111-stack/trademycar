import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { recordEvent } from "@/lib/db";

export const SESSION_COOKIE = "tmc_sid";

/**
 * POST /api/track  { event: "visit" | "flow_started" | ... }
 *
 * Anonymous funnel analytics for the admin dashboard. Sessions are a
 * first-party cookie holding a random ID — no personal data is stored
 * against events.
 */
export async function POST(req: NextRequest) {
  let event = "";
  try {
    const body = (await req.json()) as { event?: string };
    event = body.event ?? "";
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  let sid = req.cookies.get(SESSION_COOKIE)?.value;
  const isNew = !sid;
  if (!sid) sid = randomUUID();

  try {
    recordEvent(sid, event);
  } catch (err) {
    console.error("track error:", err);
  }

  const res = NextResponse.json({ ok: true });
  if (isNew) {
    res.cookies.set(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  return res;
}
