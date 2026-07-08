import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, logoutToken } from "@/lib/auth";

/** POST /api/admin/logout → ends the session. */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (token) logoutToken(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
