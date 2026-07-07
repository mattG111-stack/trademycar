import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidAdminCookie } from "@/lib/adminAuth";

/**
 * Protects /admin and /api/admin with a cookie session set by the
 * login page at /admin/login (password = ADMIN_PASSWORD, set in your
 * host's environment variables).
 *
 * If ADMIN_PASSWORD isn't set: open in development, disabled in
 * production.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page and login/logout endpoints are always reachable.
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  if (!process.env.ADMIN_PASSWORD) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse(
      "Admin dashboard is disabled: set ADMIN_PASSWORD in your environment.",
      { status: 503 },
    );
  }

  const ok = await isValidAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return NextResponse.next();

  // API requests get a 401; page requests go to the login screen.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/admin/:path*"],
};
