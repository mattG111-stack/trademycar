"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, EditIcon, FileIcon, SlotIcon } from "@/components/icons";
import {
  DRIVES,
  FUELS,
  Finance,
  PHOTO_SLOTS,
  Vehicle,
} from "@/lib/content";
import { track } from "@/lib/track";

const STEPS = 4;

const inputCls =
  "w-full bg-white border-[1.5px] border-input rounded-[11px] p-[14px] text-[16px] text-[#1B2B3A] focus:border-accent focus:outline-none";
const inputSmCls =
  "w-full bg-white border-[1.5px] border-input rounded-[11px] p-3 text-[15px] text-[#1B2B3A] focus:border-accent focus:outline-none";
const inputOfferCls =
  "w-full bg-white border-[1.5px] border-input rounded-[12px] p-[14px] text-[16px] text-[#1B2B3A] focus:border-accent focus:outline-none";
const primaryBtnCls =
  "mt-[22px] w-full bg-accent text-white font-semibold text-[17px] p-4 rounded-full border-none cursor-pointer hover:brightness-[1.12]";
const textBtnCls =
  "mt-3 w-full bg-transparent border-none text-body-2 font-semibold text-[14.5px] cursor-pointer";
const labelCls = "block mb-[6px] font-semibold text-[14.5px] text-[#2A3B4C]";
const smallLabelCls = "block mb-[5px] font-semibold text-[13px] text-body-2";
const segCls = (active: boolean) =>
  `flex-1 p-[13px] border-[1.5px] rounded-[11px] font-semibold text-[15px] cursor-pointer ${
    active
      ? "border-accent bg-[#E7EEFE] text-accent"
      : "border-input bg-white text-[#2A3B4C]"
  }`;
const chipBtnCls = (active: boolean) =>
  `px-[15px] py-[10px] border-[1.5px] rounded-full font-semibold text-[14px] cursor-pointer ${
    active
      ? "border-accent bg-[#E7EEFE] text-accent"
      : "border-input bg-white text-[#2A3B4C]"
  }`;
const driveBtnCls = (active: boolean) =>
  `flex-1 p-3 border-[1.5px] rounded-[11px] font-semibold text-[15px] cursor-pointer ${
    active
      ? "border-accent bg-[#E7EEFE] text-accent"
      : "border-input bg-white text-[#2A3B4C]"
  }`;

function StepHeader({
  step,
  title,
  sub,
  subMargin = 22,
}: {
  step: number;
  title: string;
  sub: string;
  subMargin?: number;
}) {
  return (
    <>
      <div className="text-[12px] font-bold tracking-[.11em] uppercase text-accent mb-2">
        Step {step} of {STEPS}
      </div>
      <h2 className="font-display font-extrabold text-[28px] text-ink-2 mt-0 mb-[6px] tracking-[-.01em]">
        {title}
      </h2>
      <p className="text-body-2 mt-0 text-[16px]" style={{ marginBottom: subMargin }}>
        {sub}
      </p>
    </>
  );
}

type PhotoEntry = { file: File; url: string };

export default function OfferFlow({
  plate,
  onExit,
}: {
  plate: string;
  onExit: () => void;
}) {
  const [ptr, setPtr] = useState(0);
  const [looking, setLooking] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [finance, setFinance] = useState<Finance>("");
  const [contactErr, setContactErr] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerDealer, setOfferDealer] = useState("");
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<Record<string, PhotoEntry>>({});
  const [submitting, setSubmitting] = useState(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  // Plate lookup — hits /api/plate-lookup (mocked until the real API key is wired in).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/plate-lookup?plate=${encodeURIComponent(plate)}`,
        );
        const data = (await res.json()) as { vehicle?: Vehicle };
        if (!res.ok || !data.vehicle) throw new Error("lookup failed");
        if (!cancelled) setVehicle(data.vehicle);
      } catch {
        // Lookup failed — let the seller fill in the details themselves.
        if (!cancelled) {
          setVehicle({
            make: "",
            model: "",
            spec: "",
            year: "",
            km: "",
            fuel: "",
            drive: "",
          });
          setEditing(true);
        }
      } finally {
        if (!cancelled) setLooking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plate]);

  // Release photo preview object URLs on unmount.
  useEffect(
    () => () => {
      Object.values(photosRef.current).forEach((p) =>
        URL.revokeObjectURL(p.url),
      );
    },
    [],
  );

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const go = (n: number) => {
    // Funnel analytics — forward transitions only (back doesn't re-count).
    if (n > ptr) {
      if (n === 1) track("vehicle_confirmed");
      if (n === 2) track("contact_completed");
      if (n === 3) track("offer_step_completed");
    }
    setPtr(n);
    scrollUp();
  };
  const back = () => {
    if (ptr === 0) onExit();
    else {
      setContactErr(false);
      go(ptr - 1);
    }
  };

  const contactNext = () => {
    const bad = !name.trim() || phone.replace(/\D/g, "").length < 7;
    if (bad) {
      setContactErr(true);
      return;
    }
    setContactErr(false);
    go(2);
  };

  const addPhoto = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotos((p) => {
      if (p[id]) URL.revokeObjectURL(p[id].url);
      return { ...p, [id]: { file: f, url: URL.createObjectURL(f) } };
    });
  };

  const finish = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append(
        "lead",
        JSON.stringify({
          plate,
          vehicle,
          name,
          phone,
          email,
          finance,
          offerAmount,
          offerDealer,
        }),
      );
      if (offerFile) fd.append("offerDocument", offerFile);
      for (const [id, p] of Object.entries(photos)) {
        fd.append(`photo_${id}`, p.file);
      }
      await fetch("/api/submit-offer", { method: "POST", body: fd });
    } catch {
      // The lead is the priority — don't strand the seller on a network blip.
    } finally {
      setSubmitting(false);
      go(4);
    }
  };

  const setVeh = (k: keyof Vehicle, v: string) =>
    setVehicle((cur) => (cur ? { ...cur, [k]: v } : cur));

  const vehTitle = vehicle?.year
    ? [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ")
    : plate;
  const kmDisplay = vehicle?.km
    ? `${Number(vehicle.km).toLocaleString()} km`
    : "—";
  const photoCount = Object.keys(photos).length;

  return (
    <div className="max-w-[520px] mx-auto px-6 pt-6 pb-16 [animation:rise_.35s_ease_both]">
      {/* Top bar: back + progress */}
      <div className="flex items-center gap-[14px] mt-[6px] mb-[26px]">
        <button
          onClick={back}
          aria-label="Back"
          className="bg-white border border-line rounded-[10px] w-[42px] h-[42px] flex-none text-ink-3 text-[20px] cursor-pointer flex items-center justify-center"
        >
          ‹
        </button>
        <div className="flex gap-[6px] flex-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`flex-1 h-[5px] rounded-full ${
                i <= ptr ? "bg-accent" : "bg-[#DBE0E5]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1 — confirm vehicle */}
      {ptr === 0 && (
        <div className="animate-rise">
          <StepHeader
            step={1}
            title="Is this your car?"
            sub="We pulled this straight from your plate."
          />
          <div className="bg-white border border-line rounded-[20px] p-[22px]">
            <div className="text-[12px] font-bold tracking-[.1em] uppercase text-muted mb-[10px]">
              Your vehicle
            </div>

            {looking && (
              <div className="inline-flex items-center gap-[9px] text-body-2 font-semibold">
                <span className="w-[9px] h-[9px] rounded-full bg-accent animate-blip" />{" "}
                Looking up your plate…
              </div>
            )}

            {vehicle && !editing && !looking && (
              <div>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="font-display font-extrabold text-[24px] text-ink-3 leading-[1.1]">
                      {vehTitle}
                    </div>
                    <div className="text-body-2 text-[14.5px] mt-1">
                      {vehicle.spec}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-none flex items-center gap-[6px] bg-[#EEF3F7] text-accent border-none rounded-full px-[15px] py-2 font-bold text-[13px] cursor-pointer"
                  >
                    <EditIcon /> Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[kmDisplay, vehicle.fuel, vehicle.drive]
                    .filter(Boolean)
                    .map((chip) => (
                      <span
                        key={chip}
                        className="bg-[#F1F4F7] text-[#2A3B4C] font-semibold text-[13.5px] px-[13px] py-[7px] rounded-full"
                      >
                        {chip}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {vehicle && editing && (
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={smallLabelCls}>Make</label>
                    <input
                      value={vehicle.make}
                      onChange={(e) => setVeh("make", e.target.value)}
                      className={inputSmCls}
                    />
                  </div>
                  <div>
                    <label className={smallLabelCls}>Model</label>
                    <input
                      value={vehicle.model}
                      onChange={(e) => setVeh("model", e.target.value)}
                      className={inputSmCls}
                    />
                  </div>
                  <div>
                    <label className={smallLabelCls}>Year</label>
                    <input
                      value={vehicle.year}
                      onChange={(e) => setVeh("year", e.target.value)}
                      inputMode="numeric"
                      maxLength={4}
                      className={inputSmCls}
                    />
                  </div>
                  <div>
                    <label className={smallLabelCls}>Variant / spec</label>
                    <input
                      value={vehicle.spec}
                      onChange={(e) => setVeh("spec", e.target.value)}
                      placeholder="e.g. GSX"
                      className={inputSmCls}
                    />
                  </div>
                </div>
                <label className={`${smallLabelCls} mt-[14px]`}>
                  Current odometer (km)
                </label>
                <input
                  value={vehicle.km}
                  onChange={(e) => setVeh("km", e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 84000"
                  className={inputSmCls}
                />
                <label className={`${smallLabelCls} mt-[14px] mb-[6px]`}>
                  Fuel type
                </label>
                <div className="flex flex-wrap gap-2">
                  {FUELS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setVeh("fuel", f)}
                      className={chipBtnCls(vehicle.fuel === f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <label className={`${smallLabelCls} mt-[14px] mb-[6px]`}>
                  Drivetrain
                </label>
                <div className="flex gap-2">
                  {DRIVES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setVeh("drive", d)}
                      className={driveBtnCls(vehicle.drive === d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setEditing(false)}
                  className="mt-[18px] w-full bg-ink-3 text-white font-semibold text-[15px] p-[13px] rounded-full border-none cursor-pointer hover:brightness-[1.2]"
                >
                  Save details
                </button>
              </div>
            )}
          </div>
          <button onClick={() => go(1)} className="mt-[18px] w-full bg-accent text-white font-semibold text-[17px] p-4 rounded-full border-none cursor-pointer hover:brightness-[1.12]">
            Yes, that&apos;s my car
          </button>
          <button onClick={onExit} className={textBtnCls}>
            No, that&apos;s not my car
          </button>
        </div>
      )}

      {/* Step 2 — contact */}
      {ptr === 1 && (
        <div className="animate-rise">
          <StepHeader
            step={2}
            title="Where do we send your offer?"
            sub="We'll call you with a firm number. No spam, ever."
          />
          <label className={labelCls}>Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="First name"
            className={inputCls}
          />
          <div className="grid grid-cols-2 gap-[11px] mt-4">
            <div>
              <label className={labelCls}>Mobile</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                autoComplete="tel"
                placeholder="021…"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@…"
                className={inputCls}
              />
            </div>
          </div>
          {contactErr && (
            <div className="text-error text-[13.5px] font-semibold mt-[10px]">
              Pop in your name and mobile so we can call with your offer.
            </div>
          )}
          <label className={`${labelCls} mt-5 mb-2`}>
            Any finance still owing on the car?
          </label>
          <div className="flex gap-[10px]">
            {(
              [
                ["No", "no"],
                ["Yes", "yes"],
                ["Not sure", "unsure"],
              ] as const
            ).map(([label, val]) => (
              <button
                key={val}
                onClick={() => setFinance(val)}
                className={segCls(finance === val)}
              >
                {label}
              </button>
            ))}
          </div>
          {finance === "yes" && (
            <p className="text-[13.5px] text-body-2 mt-[10px] mb-0">
              All good — we settle the finance directly and pay you the
              balance.
            </p>
          )}
          <button onClick={contactNext} className={primaryBtnCls}>
            Continue →
          </button>
        </div>
      )}

      {/* Step 3 — competing offer */}
      {ptr === 2 && (
        <div className="animate-rise">
          <StepHeader
            step={3}
            title="Got a trade-in offer?"
            sub="We guarantee to beat any written offer by $500. Share it and we'll go higher."
          />
          <label className={labelCls}>Their offer</label>
          <input
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            inputMode="numeric"
            placeholder="$ e.g. 17,500"
            className={inputOfferCls}
          />
          <label className={`${labelCls} mt-4`}>
            Which dealer?{" "}
            <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            value={offerDealer}
            onChange={(e) => setOfferDealer(e.target.value)}
            placeholder="Dealer name"
            className={inputOfferCls}
          />
          <label className="relative flex flex-col items-center justify-center gap-[6px] border-[1.5px] border-dashed border-[#C7CFD6] rounded-[16px] bg-white p-[22px] text-center cursor-pointer mt-4">
            <FileIcon />
            <b className="font-bold text-ink-3 text-[15px]">
              Upload the written offer
            </b>
            <small className="text-body-2 text-[13px]">
              Photo or PDF — optional
            </small>
            {offerFile && (
              <span className="text-success font-semibold text-[13.5px]">
                ✓ {offerFile.name}
              </span>
            )}
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setOfferFile(e.target.files?.[0] ?? null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
          <div className="flex items-center gap-[11px] bg-[#FFF6D6] border border-[#F5E39A] rounded-[14px] px-[15px] py-[13px] mt-4">
            <span className="flex-none bg-guarantee text-[#3A2E00] font-extrabold px-[10px] py-1 rounded-[9px] text-[13px]">
              +$500
            </span>
            <span className="text-[13.5px] text-[#5A4A00] font-semibold">
              We&apos;ll beat your written offer by $500 — guaranteed.
            </span>
          </div>
          <button onClick={() => go(3)} className={primaryBtnCls}>
            Continue →
          </button>
          <button onClick={() => go(3)} className={textBtnCls}>
            I don&apos;t have an offer yet →
          </button>
        </div>
      )}

      {/* Step 4 — photos */}
      {ptr === 3 && (
        <div className="animate-rise">
          <StepHeader
            step={4}
            title="Add a few photos"
            sub="A few clear photos get you a firmer offer, faster. Make sure the odometer, rego and any damage are readable."
            subMargin={18}
          />
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[14px] text-body-2 font-semibold">
              {photoCount} of {PHOTO_SLOTS.length} added
            </span>
            <button
              onClick={finish}
              className="text-[14px] text-accent font-semibold bg-transparent border-none cursor-pointer"
            >
              Skip for now →
            </button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[11px]">
            {PHOTO_SLOTS.map((slot) => {
              const filled = photos[slot.id];
              return (
                <label
                  key={slot.id}
                  className="relative aspect-[4/3] border-[1.5px] border-dashed border-[#C7CFD6] rounded-[18px] bg-white overflow-hidden flex flex-col items-center justify-center gap-[7px] cursor-pointer"
                >
                  {filled ? (
                    <>
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${filled.url}')` }}
                      />
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-success text-white flex items-center justify-center text-[13px] font-bold">
                        ✓
                      </span>
                    </>
                  ) : (
                    <>
                      <SlotIcon type={slot.icon} />
                      <span className="text-[13px] font-semibold text-body-2 text-center px-[6px]">
                        {slot.label}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={addPhoto(slot.id)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
          <button onClick={finish} className={primaryBtnCls} disabled={submitting}>
            {submitting ? "Sending…" : "Get my offer"}
          </button>
        </div>
      )}

      {/* Done */}
      {ptr === 4 && (
        <div className="text-center py-8 animate-rise">
          <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-5 text-success">
            <CheckIcon />
          </div>
          <h2 className="font-display font-extrabold text-[30px] text-ink-2 mt-0 mb-2">
            You&apos;re all set.
          </h2>
          <p className="text-body-2 mt-0 mb-[18px] text-[16px]">
            Expect a call in the next 10 minutes — keep your phone handy.
          </p>
          <div className="inline-flex items-center gap-[9px] bg-[#EEF3F7] text-accent px-[18px] py-[11px] rounded-full font-semibold text-[15px]">
            <span className="w-[10px] h-[10px] rounded-full bg-accent animate-blip" />{" "}
            We&apos;ll call you within 10 minutes
          </div>
        </div>
      )}
    </div>
  );
}
