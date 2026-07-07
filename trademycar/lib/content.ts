export type Vehicle = {
  make: string;
  model: string;
  spec: string;
  year: string;
  km: string;
  fuel: string;
  drive: string;
};

export type Finance = "" | "no" | "yes" | "unsure";

export const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;
export const DRIVES = ["2WD", "4WD"] as const;

export type PhotoSlotIcon =
  | "car"
  | "odo"
  | "rego"
  | "service"
  | "damage"
  | "seat"
  | "tyre"
  | "wheel"
  | "engine";

export const PHOTO_SLOTS: { id: string; label: string; icon: PhotoSlotIcon }[] =
  [
    { id: "front", label: "Front", icon: "car" },
    { id: "driver", label: "Driver's side", icon: "car" },
    { id: "pass", label: "Passenger side", icon: "car" },
    { id: "rear", label: "Rear", icon: "car" },
    { id: "engine", label: "Engine bay", icon: "engine" },
    { id: "odo", label: "Odometer (km)", icon: "odo" },
    { id: "rego", label: "Rego label", icon: "rego" },
    { id: "service", label: "Service book", icon: "service" },
    { id: "damage", label: "Any damage", icon: "damage" },
    { id: "interior", label: "Interior", icon: "seat" },
    { id: "wheel_fl", label: "Wheel — front left", icon: "wheel" },
    { id: "wheel_fr", label: "Wheel — front right", icon: "wheel" },
    { id: "wheel_rl", label: "Wheel — rear left", icon: "wheel" },
    { id: "wheel_rr", label: "Wheel — rear right", icon: "wheel" },
    { id: "tyre_fl", label: "Tread — front left", icon: "tyre" },
    { id: "tyre_fr", label: "Tread — front right", icon: "tyre" },
    { id: "tyre_rl", label: "Tread — rear left", icon: "tyre" },
    { id: "tyre_rr", label: "Tread — rear right", icon: "tyre" },
  ];

export const FAQ: [string, string][] = [
  [
    "Does it cost anything?",
    "No. Getting an offer is completely free and there is no obligation to sell. We never charge fees.",
  ],
  [
    "How fast will I hear back?",
    "Most sellers get a call with a firm offer within the hour during business hours.",
  ],
  [
    "What if I still owe finance?",
    "All good. We settle the outstanding finance directly with your lender and pay you whatever is left.",
  ],
  [
    "Do I have to drop the car off?",
    "No — we come to you for the inspection and collection, at a time that suits.",
  ],
  [
    "Who am I dealing with?",
    "Kiwi blokes who love to help — real people you can talk to.",
  ],
];

export const REVIEWS = [
  {
    quote:
      "“Had an offer within the hour and the cash that afternoon. Didn't even leave the house.”",
    initials: "RT",
    name: "Rangi T.",
    sold: "Sold a 2018 Ford Ranger",
  },
  {
    quote:
      "“Still had finance owing and thought it'd be a nightmare. They sorted the lot and paid me the difference.”",
    initials: "SM",
    name: "Sarah M.",
    sold: "Sold a 2020 Mazda CX-5",
  },
  {
    quote:
      "“Way less hassle than Trade Me and no time-wasters. Would do it again in a heartbeat.”",
    initials: "JL",
    name: "James L.",
    sold: "Sold a 2016 Toyota Corolla",
  },
];

export const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Enter your plate",
    body: "We pull up your car's details in seconds — no forms to fill out.",
  },
  {
    n: "02",
    title: "Send a few photos",
    body: "Snap the angles we show you. Takes about two minutes on your phone.",
  },
  {
    n: "03",
    title: "We come to you & pay",
    body: "On-site inspection, a firm offer, and same-day payment to your bank.",
  },
];

export const WHY_US = [
  {
    title: "Paid the same day",
    body: "Money lands in your bank the moment you accept the offer.",
  },
  {
    title: "We come to you",
    body: "On-site inspection and collection at your home or work.",
  },
  {
    title: "Paperwork sorted",
    body: "We handle the ownership change and PPSR so you don't have to.",
  },
  {
    title: "Finance? No problem",
    body: "We settle what's owing with your lender and pay you the balance.",
  },
];

export function sanitisePlate(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}
