"use client";

import { useState } from "react";
import { Logo } from "@/components/icons";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/admin";
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Wrong password — try again.");
    } catch {
      setError("Couldn't reach the server — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-alt flex items-center justify-center px-6">
      <div className="w-full max-w-[400px] animate-rise">
        <div className="flex justify-center mb-6">
          <Logo size={48} />
        </div>
        <div className="bg-white border border-line rounded-[22px] p-[26px] [box-shadow:0_1px_2px_rgba(16,34,51,.05),0_24px_48px_-32px_rgba(16,34,51,.28)]">
          <h1 className="font-display font-extrabold text-[24px] text-ink-2 mt-0 mb-1 tracking-[-.01em]">
            Admin login
          </h1>
          <p className="text-body-2 text-[14.5px] mt-0 mb-5">
            Your leads dashboard. Enter your admin password.
          </p>
          <label className="block mb-[6px] font-semibold text-[14.5px] text-[#2A3B4C]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full bg-white border-[1.5px] border-input rounded-[11px] p-[14px] text-[16px] text-[#1B2B3A] focus:border-accent focus:outline-none"
          />
          {error && (
            <div className="text-error text-[13.5px] font-semibold mt-[10px]">
              {error}
            </div>
          )}
          <button
            onClick={submit}
            disabled={busy}
            className="mt-4 w-full bg-accent text-white font-semibold text-[16px] p-[15px] rounded-full border-none cursor-pointer hover:brightness-[1.12] disabled:opacity-60"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </div>
        <p className="text-center text-[12.5px] text-muted mt-4">
          Password is the ADMIN_PASSWORD set in your hosting settings.
        </p>
      </div>
    </div>
  );
}
