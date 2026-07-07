"use client";

export type FunnelEvent =
  | "visit"
  | "flow_started"
  | "vehicle_confirmed"
  | "contact_completed"
  | "offer_step_completed"
  | "submitted";

const sent = new Set<FunnelEvent>();

/** Fire-and-forget funnel event; deduped per page load. */
export function track(event: FunnelEvent) {
  if (sent.has(event)) return;
  sent.add(event);
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => {
    /* analytics must never break the flow */
  });
}
