import type { PhotoSlotIcon } from "@/lib/content";

/** Wordmark + car/$ icon — SVG lifted directly from the design prototype. */
export function Logo({ size = 48 }: { size?: number }) {
  return (
    <span className="flex items-center gap-[11px]">
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        role="img"
        aria-label="TradeMyCar logo"
      >
        <path
          fill="#0F1720"
          fillRule="evenodd"
          d="M20 46.5c1.6-3.6 3.6-6.8 5.6-9.2 2.8-3.4 6.4-5 10.4-5h8c4 0 7.6 1.6 10.4 5 2 2.4 4 5.6 5.6 9.2l.2.5H66a2.2 2.2 0 010 4.4h-1.8c.5 1.7.8 3.5.8 5.3V63a3.2 3.2 0 01-3.2 3.2h-2.2A3.2 3.2 0 0156.4 63v-1.2H23.6V63a3.2 3.2 0 01-3.2 3.2h-2.2A3.2 3.2 0 0115 63v-4.8c0-1.8.3-3.6.8-5.3H14a2.2 2.2 0 010-4.4h1.8zM24 51.5a4 4 0 100 8 4 4 0 000-8zm32 0a4 4 0 100 8 4 4 0 000-8zm-22 2.5a1.8 1.8 0 000 3.6h12a1.8 1.8 0 000-3.6z"
        />
        <path
          fill="#fff"
          d="M27 47.5c.8-4.4 2-8 3.6-10.4 1.4-2 3.2-3 5.4-3h8c2.2 0 4 1 5.4 3 1.6 2.4 2.8 6 3.6 10.4z"
        />
        <path
          d="M40 9v27M46.5 14h-9.5a4.2 4.2 0 000 8.4h5a4.2 4.2 0 010 8.4h-9.5"
          stroke="#16A34A"
          strokeWidth="4.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="font-display font-extrabold text-ink tracking-[-.03em]"
        style={{ fontSize: size === 48 ? 20 : 19 }}
      >
        TradeMy
        <span className="text-accent">Car</span>
        <span className="text-[11px] font-bold text-ink tracking-normal">
          .co.nz
        </span>
      </span>
    </span>
  );
}

type Kid = [string, Record<string, string | number>];

const ICON_PATHS: Record<PhotoSlotIcon, Kid[]> = {
  car: [
    ["path", { d: "M6 11l1.2-3.6A2 2 0 019.1 6h5.8a2 2 0 011.9 1.4L18 11" }],
    [
      "path",
      {
        d: "M4 11h16v4.5a1 1 0 01-1 1h-1.2a1 1 0 01-1-1V15H7.2v.5a1 1 0 01-1 1H5a1 1 0 01-1-1z",
      },
    ],
    ["line", { x1: 7, y1: 13.4, x2: 8.6, y2: 13.4 }],
    ["line", { x1: 15.4, y1: 13.4, x2: 17, y2: 13.4 }],
  ],
  odo: [
    ["path", { d: "M4.5 16a7.5 7.5 0 0115 0" }],
    ["path", { d: "M12 16l3.6-4" }],
    ["circle", { cx: 12, cy: 16, r: 1.1 }],
  ],
  rego: [
    ["rect", { x: 3, y: 7, width: 18, height: 10, rx: 2 }],
    ["line", { x1: 7, y1: 10.5, x2: 7, y2: 13.5 }],
    ["line", { x1: 10, y1: 10.5, x2: 10, y2: 13.5 }],
    ["line", { x1: 14, y1: 10.5, x2: 14, y2: 13.5 }],
    ["line", { x1: 17, y1: 10.5, x2: 17, y2: 13.5 }],
  ],
  service: [
    [
      "path",
      {
        d: "M14.7 6.3a4 4 0 00-5.2 5.2L4 17l3 3 5.5-5.5a4 4 0 005.2-5.2l-2.3 2.3-2.1-.6-.6-2.1z",
      },
    ],
  ],
  damage: [
    ["path", { d: "M12 4L2.5 19.5h19z" }],
    ["line", { x1: 12, y1: 10, x2: 12, y2: 13.5 }],
    ["circle", { cx: 12, cy: 16.6, r: 0.5, fill: "#9AA6B2", stroke: "none" }],
  ],
  seat: [
    ["path", { d: "M6 4h2a2 2 0 012 2v6H7a3 3 0 01-3-3V6a2 2 0 012-2z" }],
    ["path", { d: "M10 12h6a2 2 0 012 2v2h-8z" }],
    ["line", { x1: 6, y1: 20, x2: 6, y2: 16 }],
    ["line", { x1: 18, y1: 20, x2: 18, y2: 16 }],
  ],
  tyre: [
    ["rect", { x: 6, y: 2.5, width: 12, height: 19, rx: 5 }],
    ["path", { d: "M9 4.5V19.5" }],
    ["path", { d: "M15 4.5V19.5" }],
    ["path", { d: "M10.6 6.5l1.4 1.1 1.4-1.1" }],
    ["path", { d: "M10.6 10l1.4 1.1 1.4-1.1" }],
    ["path", { d: "M10.6 13.5l1.4 1.1 1.4-1.1" }],
    ["path", { d: "M10.6 17l1.4 1.1 1.4-1.1" }],
  ],
  wheel: [
    ["circle", { cx: 12, cy: 12, r: 9 }],
    ["circle", { cx: 12, cy: 12, r: 3 }],
    ["line", { x1: 12, y1: 3, x2: 12, y2: 9 }],
    ["line", { x1: 12, y1: 15, x2: 12, y2: 21 }],
    ["line", { x1: 3.4, y1: 9.2, x2: 9.2, y2: 11.1 }],
    ["line", { x1: 14.8, y1: 12.9, x2: 20.6, y2: 14.8 }],
    ["line", { x1: 6.7, y1: 19.3, x2: 10.2, y2: 14.4 }],
    ["line", { x1: 13.8, y1: 9.6, x2: 17.3, y2: 4.7 }],
  ],
  engine: [
    ["path", { d: "M8 5h5v3" }],
    ["path", { d: "M6 8h9l2.5 2.5H20v6h-2.5L15 19H8l-2-2H4v-7h2z" }],
    ["line", { x1: 20, y1: 12, x2: 21.5, y2: 12 }],
    ["line", { x1: 4, y1: 13.5, x2: 2.5, y2: 13.5 }],
  ],
};

export function SlotIcon({ type }: { type: PhotoSlotIcon }) {
  const kids = ICON_PATHS[type] ?? ICON_PATHS.car;
  return (
    <svg
      width={26}
      height={26}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9AA6B2"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kids.map(([Tag, attrs], i) => {
        const El = Tag as keyof React.JSX.IntrinsicElements;
        return <El key={i} {...(attrs as object)} />;
      })}
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

export function FileIcon() {
  return (
    <svg
      width={26}
      height={26}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9AA6B2"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 2.5h7L19 7.5v13A1.5 1.5 0 0117.5 22h-11A1.5 1.5 0 015 20.5v-16A1.5 1.5 0 016.5 2.5z" />
      <path d="M13.5 2.5V7.5H19" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      width={38}
      height={38}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
