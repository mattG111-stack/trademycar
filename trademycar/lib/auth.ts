import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  findSession,
  findUserByEmail,
  insertSession,
  deleteSessionToken,
} from "@/lib/db";

/**
 * Team login system.
 *
 * - The OWNER logs in with just the owner password (ADMIN_PASSWORD env var,
 *   set once in your hosting settings). The owner can add/remove team
 *   members from the dashboard.
 * - TEAM MEMBERS log in with their own email + password, created by the
 *   owner inside the dashboard — no technical setup involved.
 *
 * Sessions are random tokens stored in the database (30 days), held in an
 * httpOnly cookie. Removing a team member kills their sessions instantly.
 */

export const ADMIN_COOKIE = "tmc_admin";
export const SESSION_DAYS = 30;

export type AdminSession = {
  token: string;
  name: string;
  email: string | null;
  isOwner: boolean;
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

/** Owner login (password only) or team login (email + password). */
export function attemptLogin(
  email: string,
  password: string,
): AdminSession | null {
  const ownerPassword = process.env.ADMIN_PASSWORD;

  if (!email) {
    if (!ownerPassword || password !== ownerPassword) return null;
    return createSession("Owner", null, true);
  }

  const user = findUserByEmail(email.toLowerCase().trim());
  if (!user || !verifyPassword(password, user.passHash)) return null;
  return createSession(user.name, user.email, false);
}

function createSession(
  name: string,
  email: string | null,
  isOwner: boolean,
): AdminSession {
  const token = randomBytes(32).toString("hex");
  insertSession({
    token,
    name,
    email,
    isOwner,
    expiresAt: new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString(),
  });
  return { token, name, email, isOwner };
}

/** Read + validate the session from the request cookies (server-side). */
export async function getAdminSession(): Promise<AdminSession | null> {
  // Development convenience: dashboard is open if no owner password is set.
  if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === "development") {
    return { token: "dev", name: "Dev", email: null, isOwner: true };
  }
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const s = findSession(token);
  if (!s) return null;
  return { token, name: s.name, email: s.email, isOwner: s.isOwner };
}

export function logoutToken(token: string) {
  deleteSessionToken(token);
}
