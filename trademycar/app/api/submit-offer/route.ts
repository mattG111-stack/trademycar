import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { saveLead, recordEvent } from "@/lib/db";
import { sendLeadEmail } from "@/lib/email";
import { SESSION_COOKIE } from "@/app/api/track/route";
import type { Vehicle } from "@/lib/content";

/**
 * POST /api/submit-offer  (multipart/form-data)
 *
 * Fields:
 *   lead            JSON string — { plate, vehicle, name, phone, email,
 *                   finance, offerAmount, offerDealer }
 *   offerDocument   optional File (photo/PDF of the competing written offer)
 *   photo_<slotId>  optional Files — vehicle photos
 *
 * On submit:
 *   1. Lead saved to SQLite (./data/trademycar.db) — never lost, even if
 *      email fails.
 *   2. Files written to ./data/uploads/<leadId>/.
 *   3. Inquiry email sent to INQUIRY_EMAIL (see lib/email.ts for config).
 *   4. "submitted" funnel event recorded for the admin dashboard.
 *
 * TODO(crm): if you later add a CRM, push the lead here as well.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const leadRaw = form.get("lead");
    if (typeof leadRaw !== "string") {
      return NextResponse.json({ error: "Missing lead data" }, { status: 400 });
    }
    const lead = JSON.parse(leadRaw) as {
      plate: string;
      vehicle: Vehicle | null;
      name: string;
      phone: string;
      email: string;
      finance: string;
      offerAmount: string;
      offerDealer: string;
    };

    const leadId = `lead_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const sessionId = req.cookies.get(SESSION_COOKIE)?.value ?? "unknown";

    // 1. Persist the lead first — it must survive email/storage hiccups.
    saveLead({
      id: leadId,
      sessionId,
      plate: lead.plate ?? "",
      name: lead.name ?? "",
      phone: lead.phone ?? "",
      email: lead.email ?? "",
      payload: lead,
    });

    // 2. Store uploaded files on disk + collect for email attachment.
    const uploadDir = path.join(process.cwd(), "data", "uploads", leadId);
    const attachments: { filename: string; content: Buffer }[] = [];
    let photoCount = 0;
    for (const [field, value] of form.entries()) {
      if (!(value instanceof File)) continue;
      if (field.startsWith("photo_")) photoCount++;
      const safeName = `${field}__${value.name.replace(/[^\w.\-]/g, "_")}`;
      const buf = Buffer.from(await value.arrayBuffer());
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, safeName), buf);
      attachments.push({ filename: safeName, content: buf });
    }

    // 3. Email the inquiry (no-op with a log until SMTP is configured).
    let emailed = false;
    try {
      emailed = await sendLeadEmail({
        leadId,
        plate: lead.plate ?? "",
        vehicle: lead.vehicle,
        name: lead.name ?? "",
        phone: lead.phone ?? "",
        email: lead.email ?? "",
        finance: lead.finance ?? "",
        offerAmount: lead.offerAmount ?? "",
        offerDealer: lead.offerDealer ?? "",
        attachments,
        photoCount,
      });
    } catch (err) {
      console.error("Lead email failed (lead is saved):", leadId, err);
    }

    // 4. Funnel analytics.
    recordEvent(sessionId, "submitted");

    return NextResponse.json({ ok: true, leadId, emailed });
  } catch (err) {
    console.error("Submit offer error:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
