import { ImageResponse } from "next/og";

// The handoff flags og-image.png (1200x630) as a missing asset — this
// generates it on-brand at /opengraph-image. Replace with a designed PNG in
// /public later if preferred.

export const alt =
  "TradeMyCar — Sell your car, sorted in an afternoon. We beat any trade-in offer by $500.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#FFFFFF",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 40,
            fontWeight: 800,
            color: "#0F1720",
            letterSpacing: "-1px",
          }}
        >
          TradeMy
          <span style={{ color: "#1A5BE8" }}>Car</span>
          <span style={{ fontSize: 22, fontWeight: 700, marginLeft: 4 }}>
            .co.nz
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 48,
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-2px",
            color: "#0F1720",
            maxWidth: 860,
          }}
        >
          <span>Sell your car, sorted</span>
          <span style={{ display: "flex" }}>
            in&nbsp;<span style={{ color: "#1A5BE8" }}>an afternoon.</span>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 30,
            color: "#4B5563",
          }}
        >
          Free offer · We come to you · Same-day payment
        </div>
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 72,
            width: 220,
            height: 220,
            borderRadius: 9999,
            background: "#FFD64A",
            color: "#1A1400",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 58, fontWeight: 800, lineHeight: 1 }}>
            $500
          </span>
          <span style={{ fontSize: 21, fontWeight: 700, marginTop: 6 }}>
            we beat it by
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 18,
            background: "#1A5BE8",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
