import type { Vehicle } from "@/lib/content";
import { getSetting } from "@/lib/db";

/**
 * CarJam ABCD integration helpers — see app/api/plate-lookup/route.ts
 * for the endpoint docs and configuration.
 */

const CARJAM_DEFAULT_URL = "https://www.carjam.co.nz/a/vehicle:abcd";

/** The CarJam key: dashboard setting first, environment variable second. */
export function getCarJamKey(): string {
  try {
    const fromDashboard = getSetting("carjam_api_key");
    if (fromDashboard) return fromDashboard;
  } catch {
    /* fall through to env */
  }
  return process.env.PLATE_LOOKUP_API_KEY || "";
}

/** "TOYOTA COROLLA" → "Toyota Corolla" (CarJam data is often ALL CAPS). */
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[\s\-/])\w/g, (c) => c.toUpperCase())
    // Keep designation codes readable (GX, ZR, XLT, 4WD, RAV4) without
    // uppercasing real short words like "Cab" or "Van": a token is a code
    // if it contains a digit, or is <=3 letters with no vowel.
    .replace(/\b[a-z0-9]{1,4}\b/gi, (m) =>
      /\d/.test(m) || (m.length <= 3 && !/[aeiou]/i.test(m))
        ? m.toUpperCase()
        : m,
    );
}

function str(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}

/** Map a CarJam ABCD response body onto our Vehicle shape. */
export function mapCarJam(raw: unknown): Vehicle | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  // Be tolerant of a wrapper object.
  const v = (o.make || o.model
    ? o
    : ((o.vehicle ?? o.data ?? o.message ?? {}) as Record<string, unknown>));
  const make = str(v.make);
  const model = str(v.model);
  if (!make && !model) return null;
  return {
    make: titleCase(make),
    model: titleCase(model),
    spec: titleCase(str(v.submodel)),
    year: str(v.year_of_manufacture ?? v.year),
    // ABCD doesn't include odometer/fuel/drive — the seller confirms or
    // edits these in step 1, and the odometer photo captures current km.
    km: str(v.latest_odometer ?? v.odometer),
    fuel: titleCase(str(v.fuel_type ?? v.fuel)),
    drive: str(v.drive),
  };
}

export async function lookupFromCarJam(plate: string): Promise<Vehicle | null> {
  const key = getCarJamKey();
  if (!key) return null; // Not configured yet → mock fallback.
  const base = process.env.PLATE_LOOKUP_API_URL || CARJAM_DEFAULT_URL;
  const url = `${base}?key=${encodeURIComponent(key)}&plate=${encodeURIComponent(plate)}`;

  // CarJam may answer with an empty body + Refresh header while it pulls
  // fresh data from the Motor Vehicle Register. Retry a few times.
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return null; // plate not found
    if (!res.ok) throw new Error(`CarJam responded ${res.status}`);

    const text = (await res.text()).trim();
    if (text && text !== "null") {
      let body: unknown;
      try {
        body = JSON.parse(text);
      } catch {
        throw new Error("CarJam returned unparseable response");
      }
      const mapped = mapCarJam(body);
      if (mapped) return mapped;
      // Parsed but no vehicle fields → treat like still-fetching once,
      // then give up as not found.
      if (attempt >= 1) return null;
    }

    const refresh = Number(res.headers.get("refresh"));
    const waitMs = Number.isFinite(refresh) && refresh > 0
      ? Math.min(refresh, 3) * 1000
      : 1200;
    await new Promise((r) => setTimeout(r, waitMs));
  }
  return null;
}

