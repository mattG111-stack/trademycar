import { NextResponse } from "next/server";

/**
 * Deliberately does nothing.
 *
 * An earlier version of this project used proxy.ts to guard /admin with a
 * password check. GitHub's drag-and-drop upload can only ADD or REPLACE
 * files — it can't delete — so this harmless version exists purely to
 * overwrite the old one on upload.
 *
 * All admin protection now lives in app/admin/(dash)/layout.tsx (page
 * access) and the /api/admin/* routes (API access), backed by the login
 * system in lib/auth.ts.
 */
export function proxy() {
  return NextResponse.next();
}
