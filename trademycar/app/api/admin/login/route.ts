import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_DAYS, attemptLogin } from "@/lib/auth";

/**
 * POST /api/admin/login  { email?, password }
 * Owner: leave email blank, use the owner password (ADMIN_PASSWORD).
 * Team member: email + the password the owner created for them.
 */
export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "The owner password (ADMIN_PASSWORD) isn't set up on the server yet." },
      { status: 503 },
    );
  }

  let email = "";
  let password = "";
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    email = String(body.email ?? "").trim();
    password = String(body.password ?? "");
  } catch {
    /* fall through */
  }

  const session = password ? attemptLogin(email, password) : null;
  if (!session) {
    await new Promise((r) => setTimeout(r, 800)); // blunt brute-force guessing
    return NextResponse.json(
      { error: email ? "Wrong email or password." : "Wrong owner password." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true, name: session.name });
  res.cookies.set(ADMIN_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 86400,
    path: "/",
  });
  return res;
}
