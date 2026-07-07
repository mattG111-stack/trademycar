import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken } from "@/lib/adminAuth";

/** POST /api/admin/login  { password } → sets the admin session cookie. */
export async function POST(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 503 },
    );
  }

  let supplied = "";
  try {
    supplied = String(((await req.json()) as { password?: string }).password ?? "");
  } catch {
    /* fall through */
  }

  if (supplied !== password) {
    // Small delay to blunt brute-force guessing.
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await adminToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // stay logged in for a week
    path: "/",
  });
  return res;
}
