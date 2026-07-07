"use client";

import { useState } from "react";
import { Logo } from "@/components/icons";
import { FAQ, HOW_IT_WORKS, REVIEWS, WHY_US, sanitisePlate } from "@/lib/content";

const screw =
  "absolute w-[9px] h-[9px] rounded-full [background:radial-gradient(circle_at_35%_30%,#d6dbe1,#7c828b)] [box-shadow:0_1px_1px_rgba(0,0,0,.3)]";

type Props = {
  plate: string;
  onPlateChange: (v: string) => void;
  onStart: () => void;
};

export default function MarketingSite({ plate, onPlateChange, onStart }: Props) {
  const [open, setOpen] = useState<boolean[]>(FAQ.map(() => false));

  const goTop = () => {
    const input = document.getElementById("plateInput") as HTMLInputElement | null;
    if (input) {
      try {
        input.focus({ preventScroll: true });
      } catch {
        input.focus();
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-[12px] border-b border-hairline">
        <div className="max-w-[1120px] mx-auto px-6 h-[66px] flex items-center justify-between">
          <Logo size={48} />
          <button
            onClick={goTop}
            className="bg-accent text-white font-semibold text-[14px] px-[18px] py-[11px] rounded-full border-none cursor-pointer hover:brightness-[1.12]"
          >
            Get my offer
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white">
        <div className="max-w-[1120px] mx-auto px-6 pt-16 pb-14 flex flex-wrap gap-12 items-center">
          <div className="flex-[1_1_380px] min-w-[300px]">
            <div className="inline-flex items-center gap-[9px] text-[14px] font-semibold text-body-2 mb-[22px]">
              <span className="text-star tracking-[2px] text-[14px]">★★★★★</span>
              <span>4.9 &nbsp;·&nbsp; 2,300+ Kiwi sellers</span>
            </div>
            <h1 className="font-display font-extrabold text-[clamp(38px,6vw,62px)] leading-[1.04] tracking-[-.02em] text-ink m-0">
              <span className="sr-only">
                Sell your car in New Zealand — we beat any trade-in offer by
                $500.{" "}
              </span>
              Sell your car, sorted in{" "}
              <span className="text-accent">an afternoon.</span>
            </h1>
            <p className="text-[clamp(17px,2.2vw,19px)] text-body mt-[22px] mb-0 max-w-[46ch]">
              Selling your car in New Zealand? Enter your plate, we come to you,
              make a firm offer and pay the same day — and we beat any written
              trade-in offer by $500.
            </p>
            <div className="inline-flex items-center gap-[11px] mt-[26px] bg-guarantee text-[#1A1400] font-bold text-[15px] px-[18px] py-[11px] rounded-full">
              <span className="bg-[#1A1400] text-guarantee font-extrabold text-[12px] px-[9px] py-[3px] rounded-full tracking-[.02em]">
                GUARANTEE
              </span>
              We beat any trade-in offer
            </div>
          </div>

          {/* Plate card */}
          <div className="flex-[1_1_340px] min-w-[300px] max-w-[440px]">
            <div className="bg-white border border-line rounded-[22px] p-[26px] [box-shadow:0_1px_2px_rgba(16,34,51,.05),0_24px_48px_-32px_rgba(16,34,51,.28)]">
              <div className="text-[13px] font-bold tracking-[.1em] uppercase text-muted mb-3">
                Start with your plate
              </div>
              <div className="relative bg-white border-4 border-[#0E0E0E] rounded-[18px] px-9 py-4 [box-shadow:inset_0_0_0_2px_#0E0E0E,0_2px_6px_rgba(16,34,51,.12)]">
                <span className={`${screw} top-[11px] left-[18px]`} />
                <span className={`${screw} top-[11px] right-[18px]`} />
                <span className={`${screw} bottom-[11px] left-[18px]`} />
                <span className={`${screw} bottom-[11px] right-[18px]`} />
                <input
                  id="plateInput"
                  value={plate}
                  onChange={(e) => onPlateChange(sanitisePlate(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && onStart()}
                  inputMode="text"
                  autoComplete="off"
                  maxLength={6}
                  placeholder="ABC123"
                  aria-label="Your number plate"
                  className="border-none outline-none bg-transparent font-extrabold text-[34px] tracking-[.16em] uppercase text-center text-[#111] p-1 w-full"
                />
              </div>
              <button
                onClick={onStart}
                className="mt-[14px] w-full bg-accent text-white font-semibold text-[17px] p-[17px] rounded-full border-none cursor-pointer flex items-center justify-center gap-2 hover:brightness-[1.12] [box-shadow:0_14px_26px_-12px_rgba(28,107,228,.7)] hover:-translate-y-px transition-transform"
              >
                Get my offer <span className="text-[18px]">→</span>
              </button>
              <div className="mt-[14px] text-[13px] text-muted text-center font-medium">
                Free · No obligation · Takes 60 seconds to start
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee band */}
      <section className="bg-accent">
        <div className="max-w-[1120px] mx-auto px-6 py-12 flex flex-wrap items-center gap-x-10 gap-y-6 justify-between">
          <div className="flex-[1_1_440px] min-w-[280px]">
            <div className="font-display font-extrabold text-[clamp(25px,3.6vw,36px)] tracking-[-.02em] leading-[1.08] text-white">
              We&apos;ll beat any trade-in offer —{" "}
              <span className="text-guarantee">guaranteed.</span>
            </div>
            <p className="mt-3 mb-0 text-[16px] text-[#C9D4DF] font-medium max-w-[54ch]">
              Bring us a dealer&apos;s written trade-in offer — that&apos;s all
              we need — and we&apos;ll beat it by{" "}
              <b className="text-white">$500</b>.
            </p>
          </div>
          <div className="flex-none flex flex-col items-center justify-center w-[132px] h-[132px] rounded-full bg-guarantee text-[#1A1400] text-center">
            <span className="font-display font-extrabold text-[30px] leading-none">
              $500
            </span>
            <span className="text-[12px] font-bold mt-[2px] tracking-[.02em]">
              we beat it by
            </span>
          </div>
        </div>
      </section>

      {/* Stat band */}
      <section>
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] text-center">
            {[
              ["$0", "fees — free, no-obligation offer"],
              ["1 hour", "average time to an offer"],
              ["Same day", "payment to your bank"],
            ].map(([stat, label], i) => (
              <div
                key={stat}
                className={`px-3 py-[30px] ${i < 2 ? "border-r border-hairline" : ""}`}
              >
                <div className="font-display text-[clamp(26px,4vw,34px)] font-semibold text-accent">
                  {stat}
                </div>
                <div className="text-[13.5px] text-muted-2 font-medium mt-[2px]">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-[76px]">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-[560px] mb-11">
            <div className="text-[13px] font-bold tracking-[.12em] uppercase text-accent">
              How it works
            </div>
            <h2 className="font-display font-extrabold text-[clamp(28px,4.5vw,40px)] tracking-[-.02em] text-ink-2 mt-3 mb-0 leading-[1.1]">
              Sold in three straightforward steps.
            </h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-px bg-line border border-line rounded-[22px] overflow-hidden">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} className="bg-white px-7 py-8">
                <div className="font-display text-[34px] text-[#B7C1CB] font-semibold leading-none">
                  {s.n}
                </div>
                <div className="font-bold text-[19px] text-ink-3 mt-4 mb-[6px]">
                  {s.title}
                </div>
                <div className="text-body-2 text-[15px]">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-[76px] bg-alt border-y border-hairline">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-[560px] mb-11">
            <div className="text-[13px] font-bold tracking-[.12em] uppercase text-accent">
              Why TradeMyCar
            </div>
            <h2 className="font-display font-extrabold text-[clamp(28px,4.5vw,40px)] tracking-[-.02em] text-ink-2 mt-3 mb-0 leading-[1.1]">
              The fair, no-hassle way to sell.
            </h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[14px]">
            {WHY_US.map((c) => (
              <div
                key={c.title}
                className="bg-white border border-line rounded-[20px] p-6"
              >
                <div className="font-bold text-[16.5px] text-ink-3 mb-[7px]">
                  {c.title}
                </div>
                <div className="text-body-2 text-[14.5px]">{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-[76px]">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-[560px] mb-11">
            <div className="text-[13px] font-bold tracking-[.12em] uppercase text-accent">
              Real sellers
            </div>
            <h2 className="font-display font-extrabold text-[clamp(28px,4.5vw,40px)] tracking-[-.02em] text-ink-2 mt-3 mb-0 leading-[1.1]">
              Kiwis on how easy it was.
            </h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            {REVIEWS.map((r) => (
              <div
                key={r.initials}
                className="bg-white border border-line rounded-[20px] p-[26px]"
              >
                <div className="text-[#C88A2E] tracking-[2px] text-[14px] mb-[14px]">
                  ★★★★★
                </div>
                <p className="mt-0 mb-[18px] text-[16px] text-[#2A3B4C]">
                  {r.quote}
                </p>
                <div className="flex items-center gap-[11px]">
                  <span className="w-10 h-10 rounded-full bg-[#E7EBEF] text-[#3A4B5A] font-bold flex items-center justify-center text-[14px]">
                    {r.initials}
                  </span>
                  <span>
                    <b className="block text-[14.5px] text-ink-3">{r.name}</b>
                    <small className="text-[#7A8896] text-[13px]">
                      {r.sold}
                    </small>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[76px] bg-alt border-t border-hairline">
        <div className="max-w-[760px] mx-auto px-6">
          <div className="mb-9">
            <div className="text-[13px] font-bold tracking-[.12em] uppercase text-accent">
              Good to know
            </div>
            <h2 className="font-display font-extrabold text-[clamp(28px,4.5vw,40px)] tracking-[-.02em] text-ink-2 mt-3 mb-0 leading-[1.1]">
              Questions, answered.
            </h2>
          </div>
          {FAQ.map(([q, a], i) => (
            <div
              key={q}
              className="bg-white border border-line rounded-[18px] mb-[10px] overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpen((o) => o.map((v, j) => (j === i ? !v : v)))
                }
                aria-expanded={open[i]}
                className="w-full text-left bg-transparent border-none cursor-pointer px-5 py-[18px] font-semibold text-[16px] text-ink-3 flex justify-between items-center gap-[14px]"
              >
                <span>{q}</span>
                <span className="text-accent text-[22px] font-normal flex-none leading-none">
                  {open[i] ? "–" : "+"}
                </span>
              </button>
              {open[i] && (
                <div className="px-5 pb-5 text-body-2 text-[15px] leading-[1.55]">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-accent text-center py-[72px] rounded-t-[44px]">
        <div className="max-w-[640px] mx-auto px-6">
          <h2 className="font-display font-extrabold text-[clamp(28px,5vw,42px)] tracking-[-.02em] text-white m-0 leading-[1.08]">
            Ready to sell your car?
          </h2>
          <p className="text-[#D3E2FB] text-[17px] mt-[14px] mb-[26px]">
            Enter your plate and get a firm offer today.
          </p>
          <button
            onClick={goTop}
            className="bg-white text-accent font-semibold text-[16px] px-[30px] py-4 rounded-full border-none cursor-pointer hover:brightness-95"
          >
            Get my offer →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-alt text-body-2 text-[13.5px] pt-10 pb-12 border-t border-hairline">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="flex items-center gap-[10px] mb-[14px]">
            <Logo size={36} />
          </div>
          <p className="my-[6px]">
            Free · No obligation to sell · We never sell your details to third
            parties.
          </p>
          <p className="my-[6px] opacity-70 text-[12px]">
            Terms &amp; conditions apply. The $500 beat-guarantee applies to a
            genuine written trade-in offer from a NZ dealer on the same
            vehicle, is subject to our inspection, and the vehicle must be in
            the condition described; we may decline vehicles with undisclosed
            damage or faults.
          </p>
        </div>
      </footer>
    </div>
  );
}
