import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

/** POST /api/admin/logout → clears the admin session cookie. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
