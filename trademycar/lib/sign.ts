import { createHmac } from "node:crypto";

/**
 * Signed photo URLs.
 *
 * Dashboard photo links carry ?t=<signature> — an HMAC over the exact
 * lead + filename. The uploads route accepts a valid signature OR a
 * logged-in session. This makes photos immune to session hiccups
 * (redeploys wiping the session table, cookie quirks) while staying
 * non-guessable to outsiders: each file's signature is unique and
 * reveals nothing about other files.
 */
export function signFile(leadId: string, file: string): string {
  const secret = `${process.env.ADMIN_PASSWORD || "matt@27"}|tmc-img-v1`;
  return createHmac("sha256", secret)
    .update(`${leadId}/${file}`)
    .digest("hex")
    .slice(0, 32);
}
