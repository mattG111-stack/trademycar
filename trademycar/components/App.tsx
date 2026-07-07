"use client";

import { useEffect, useState } from "react";
import MarketingSite from "@/components/MarketingSite";
import OfferFlow from "@/components/OfferFlow";
import { track } from "@/lib/track";

export default function App() {
  const [view, setView] = useState<"site" | "flow">("site");
  const [plate, setPlate] = useState("");

  useEffect(() => {
    track("visit");
  }, []);

  const start = () => {
    if (plate.trim().length < 2) {
      const input = document.getElementById("plateInput");
      input?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    track("flow_started");
    setView("flow");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exitFlow = () => {
    setView("site");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return view === "site" ? (
    <MarketingSite plate={plate} onPlateChange={setPlate} onStart={start} />
  ) : (
    <OfferFlow plate={plate} onExit={exitFlow} />
  );
}
