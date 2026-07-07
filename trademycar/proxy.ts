import { NextRequest, NextResponse } from "next/server";

/**
 * Protects /admin with HTTP Basic Auth.
 *
 * Set ADMIN_PASSWORD in .env.local (username is "admin"). If it isn't
 * set, the dashboard is only reachable in development — production
 * requests get a 503 telling you to configure it.
 */
export function proxy(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse(
      "Admin dashboard is disabled: set ADMIN_PASSWORD in your environment.",
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const [user, pass] = atob(auth.slice(6)).split(":");
      if (user === "admin" && pass === password) return NextResponse.next();
    } catch {
      /* fall through to 401 */
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="TradeMyCar admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/admin/:path*"],
};
