import nodemailer from "nodemailer";
import type { Vehicle } from "@/lib/content";

/**
 * Sends each inquiry (lead) to your inbox.
 *
 * ── WIRING UP ──────────────────────────────────────────────────────────
 * Set these in .env.local (any SMTP provider works — Gmail app password,
 * SES, Mailgun, Postmark, your host's SMTP…):
 *
 *   INQUIRY_EMAIL=you@trademycar.co.nz     ← where inquiries are sent
 *   SMTP_HOST=smtp.example.com
 *   SMTP_PORT=587
 *   SMTP_USER=...
 *   SMTP_PASS=...
 *   SMTP_FROM="TradeMyCar Leads <leads@trademycar.co.nz>"   (optional)
 *
 * Until INQUIRY_EMAIL + SMTP_* are set, the email step logs and skips —
 * the lead is still saved to the database either way.
 */

export type LeadEmail = {
  leadId: string;
  plate: string;
  vehicle: Vehicle | null;
  name: string;
  phone: string;
  email: string;
  finance: string;
  offerAmount: string;
  offerDealer: string;
  attachments: { filename: string; content: Buffer }[];
  photoCount: number;
};

const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024; // stay under common SMTP limits

export async function sendLeadEmail(lead: LeadEmail): Promise<boolean> {
  const to = process.env.INQUIRY_EMAIL;
  const host = process.env.SMTP_HOST;
  if (!to || !host) {
    console.log(
      "[email] INQUIRY_EMAIL / SMTP_* not configured — skipping email for",
      lead.leadId,
    );
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  const v = lead.vehicle;
  const vehicleLine = v
    ? [v.year, v.make, v.model, v.spec].filter(Boolean).join(" ")
    : "(not confirmed)";
  const km = v?.km ? `${Number(v.km).toLocaleString()} km` : "—";

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#8593A0;font-size:13px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#0F1720;font-weight:600">${value || "—"}</td></tr>`;

  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:560px">
    <h2 style="color:#0F1720;margin:0 0 4px">New inquiry — ${lead.name} · ${lead.plate}</h2>
    <p style="color:#5A6B7A;margin:0 0 16px">Call within 10 minutes: <b style="color:#1A5BE8">${lead.phone}</b></p>
    <table style="border-collapse:collapse">
      ${row("Plate", lead.plate)}
      ${row("Vehicle", vehicleLine)}
      ${row("Odometer", km)}
      ${row("Fuel / drive", v ? [v.fuel, v.drive].filter(Boolean).join(" · ") : "")}
      ${row("Name", lead.name)}
      ${row("Mobile", lead.phone)}
      ${row("Email", lead.email)}
      ${row("Finance owing", lead.finance || "not answered")}
      ${row("Competing offer", lead.offerAmount ? `${lead.offerAmount}${lead.offerDealer ? ` — ${lead.offerDealer}` : ""}` : "none given")}
      ${row("Photos", `${lead.photoCount} uploaded`)}
      ${row("Lead ID", lead.leadId)}
    </table>
  </div>`;

  // Attach files while they fit under the size cap; the rest stay on disk
  // in ./data/uploads/<leadId>/.
  let total = 0;
  const attachments = lead.attachments.filter((a) => {
    total += a.content.length;
    return total <= MAX_ATTACHMENT_BYTES;
  });
  const skipped = lead.attachments.length - attachments.length;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `TradeMyCar Leads <${to}>`,
    to,
    subject: `🚗 New offer request — ${lead.name} · ${lead.plate} · ${vehicleLine}`,
    html:
      html +
      (skipped > 0
        ? `<p style="color:#8593A0;font-size:13px">${skipped} file(s) were too large to attach — stored on the server in data/uploads/${lead.leadId}/.</p>`
        : ""),
    attachments,
  });
  return true;
}
