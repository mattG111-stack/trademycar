"use client";

import { useState } from "react";

/** Owner-only card: paste the CarJam API key straight into the dashboard. */
export default function PlateApiSettings({
  initialMaskedKey,
  initialSource,
}: {
  initialMaskedKey: string | null;
  initialSource: "dashboard" | "environment" | null;
}) {
  const [maskedKey, setMaskedKey] = useState(initialMaskedKey);
  const [source, setSource] = useState(initialSource);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (value: string) => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carjamApiKey: value }),
      });
      const data = (await res.json()) as {
        error?: string;
        carjamApiKey?: string | null;
      };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Couldn't save." });
      } else {
        setMaskedKey(data.carjamApiKey ?? null);
        setSource(value ? "dashboard" : null);
        setInput("");
        setMsg({
          ok: true,
          text: value
            ? "Saved — real plate lookups are on. Test it: enter a real plate on your homepage."
            : "Key removed — the site is using placeholder car data again.",
        });
      }
    } catch {
      setMsg({ ok: false, text: "Couldn't reach the server — try again." });
    } finally {
      setBusy(false);
    }
  };

  const connected = Boolean(maskedKey);

  return (
    <div className="bg-white border border-line rounded-[22px] p-7 mb-8">
      <div className="text-[13px] font-bold tracking-[.12em] uppercase text-accent mb-1">
        Plate lookup
      </div>
      <h2 className="font-display font-extrabold text-[24px] text-ink-2 mt-0 mb-2 tracking-[-.01em]">
        CarJam API key
      </h2>
      <p className="text-body-2 text-[14px] mt-0 mb-4">
        {connected ? (
          <>
            <span className="inline-block w-[9px] h-[9px] rounded-full bg-success mr-[7px] align-middle" />
            <b className="text-success">Connected</b> — key {maskedKey}
            {source === "environment" && " (set in hosting settings)"}. Real
            car details are looked up when sellers enter a plate.
          </>
        ) : (
          <>
            <span className="inline-block w-[9px] h-[9px] rounded-full bg-[#C7CFD6] mr-[7px] align-middle" />
            <b>Not connected</b> — the site is showing placeholder car data.
            Paste your CarJam key below to switch on real lookups.
          </>
        )}
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your CarJam API key"
          className="flex-[1_1_260px] bg-white border-[1.5px] border-input rounded-[11px] p-3 text-[14.5px] text-[#1B2B3A] focus:border-accent focus:outline-none"
        />
        <button
          onClick={() => input.trim() && save(input.trim())}
          disabled={busy || !input.trim()}
          className="bg-accent text-white font-semibold text-[14.5px] px-6 py-3 rounded-full border-none cursor-pointer hover:brightness-[1.12] disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save key"}
        </button>
        {connected && source !== "environment" && (
          <button
            onClick={() => {
              if (window.confirm("Remove the CarJam key? Lookups go back to placeholder data."))
                save("");
            }}
            disabled={busy}
            className="bg-white border-[1.5px] border-input rounded-full px-5 py-3 text-[13.5px] font-semibold text-error cursor-pointer hover:border-error"
          >
            Remove
          </button>
        )}
      </div>
      {msg && (
        <div
          className={`text-[13.5px] font-semibold mt-3 ${msg.ok ? "text-success" : "text-error"}`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
