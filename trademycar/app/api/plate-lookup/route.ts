import { NextRequest, NextResponse } from "next/server";
import type { Vehicle } from "@/lib/content";
import { lookupFromCarJam } from "@/lib/carjam";

/**
 * GET /api/plate-lookup?plate=ABC123
 *
 * Returns `{ vehicle: Vehicle }`.
 *
 * ── CARJAM (wired) ─────────────────────────────────────────────────────
 * Uses CarJam's ABCD product (Absolute Basic Car Details — their
 * lowest-cost lookup): GET /a/vehicle:abcd?key=<key>&plate=<plate>
 * Returns JSON with at least: plate, year_of_manufacture, make, model,
 * submodel. CarJam may reply with an empty/null body plus a `Refresh`
 * header while it fetches fresh data, so we retry briefly.
 *
 * Configure in the environment (Railway → Variables):
 *   PLATE_LOOKUP_API_KEY = your CarJam Developer API key   ← required
 *   PLATE_LOOKUP_API_URL = override endpoint (optional; use
 *     https://test.carjam.co.nz/a/vehicle:abcd for CarJam's test env)
 *
 * Without a key, a deterministic mock keeps the flow testable.
 * If CarJam can't find the plate, we return 404 and the client drops the
 * seller into the editable vehicle form — never a dead end.
 */

/* ── Deterministic mock (used until PLATE_LOOKUP_API_KEY is set) ── */

const MODELS = [
  { make: "Toyota", model: "Corolla", specs: ["GX", "SX", "ZR"] },
  { make: "Mazda", model: "CX-5", specs: ["GSX", "Limited", "Takami"] },
  { make: "Ford", model: "Ranger", specs: ["XL", "XLT", "Wildtrak"] },
  { make: "Honda", model: "Civic", specs: ["Sport", "RS"] },
  { make: "Suzuki", model: "Swift", specs: ["GL", "GLX", "Sport"] },
  { make: "Holden", model: "Colorado", specs: ["LS", "LTZ", "Z71"] },
];

function hash(s: string): number {
  let h = 0;
  for (const c of s || "X") h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function mockLookup(plate: string): Vehicle {
  const h = hash(plate);
  const m = MODELS[h % MODELS.length];
  return {
    make: m.make,
    model: m.model,
    spec: m.specs[h % m.specs.length],
    year: String(2014 + (h % 10)),
    km: String((60 + (h % 140)) * 1000),
    fuel: ["Petrol", "Diesel", "Hybrid"][h % 3],
    drive: h % 2 ? "4WD" : "2WD",
  };
}

export async function GET(req: NextRequest) {
  const plate = (req.nextUrl.searchParams.get("plate") ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

  if (plate.length < 2) {
    return NextResponse.json({ error: "Invalid plate" }, { status: 400 });
  }

  const hasKey = Boolean(process.env.PLATE_LOOKUP_API_KEY);

  try {
    if (hasKey) {
      const vehicle = await lookupFromCarJam(plate);
      if (!vehicle) {
        // Unknown plate → client shows the editable vehicle form.
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ vehicle });
    }

    // Mock mode — keep the prototype's ~900ms "Looking up…" feel.
    await new Promise((r) => setTimeout(r, 900));
    return NextResponse.json({ vehicle: mockLookup(plate) });
  } catch (err) {
    console.error("Plate lookup error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
