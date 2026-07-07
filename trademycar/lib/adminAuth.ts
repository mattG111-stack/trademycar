/**
 * Admin session token: an HMAC-style hash derived from ADMIN_PASSWORD.
 * Stored in an httpOnly cookie after login. Changing ADMIN_PASSWORD
 * invalidates all existing sessions. Uses Web Crypto so it runs in both
 * the proxy (edge) and API routes.
 */

export const ADMIN_COOKIE = "tmc_admin";

export async function adminToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`trademycar-admin-v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidAdminCookie(
  cookieValue: string | undefined,
): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !cookieValue) return false;
  return cookieValue === (await adminToken(password));
}
