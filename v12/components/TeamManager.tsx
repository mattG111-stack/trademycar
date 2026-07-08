"use client";

import { useState } from "react";

type User = { id: number; name: string; email: string; createdAt: string };

const inputCls =
  "w-full bg-white border-[1.5px] border-input rounded-[11px] p-3 text-[14.5px] text-[#1B2B3A] focus:border-accent focus:outline-none";

/** Owner-only card: add/remove team member logins. */
export default function TeamManager({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { error?: string; users?: User[] };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Couldn't add them." });
      } else {
        setUsers(data.users ?? users);
        setMsg({
          ok: true,
          text: `${name} added — give them their email + password and the /admin link.`,
        });
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch {
      setMsg({ ok: false, text: "Couldn't reach the server — try again." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (u: User) => {
    if (!window.confirm(`Remove ${u.name}'s login? They'll be logged out immediately.`))
      return;
    const res = await fetch("/api/admin/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id }),
    });
    const data = (await res.json()) as { users?: User[] };
    if (res.ok) setUsers(data.users ?? users.filter((x) => x.id !== u.id));
  };

  return (
    <div className="bg-white border border-line rounded-[22px] p-7 mb-8">
      <div className="text-[13px] font-bold tracking-[.12em] uppercase text-accent mb-1">
        Team
      </div>
      <h2 className="font-display font-extrabold text-[24px] text-ink-2 mt-0 mb-2 tracking-[-.01em]">
        Who can log in
      </h2>
      <p className="text-body-2 text-[14px] mt-0 mb-5">
        Add a login for each person working leads. They sign in at{" "}
        <b>/admin</b> with the email and password you set here.
      </p>

      {users.length > 0 && (
        <div className="mb-6">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-3 border-t border-hairline py-3 first:border-t-0"
            >
              <span>
                <b className="text-[14.5px] text-ink-3">{u.name}</b>{" "}
                <span className="text-body-2 text-[13.5px]">· {u.email}</span>
              </span>
              <button
                onClick={() => remove(u)}
                className="bg-white border-[1.5px] border-input rounded-full px-[14px] py-[6px] text-[12.5px] font-semibold text-error cursor-pointer hover:border-error"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className={inputCls}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className={inputCls}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          placeholder="Password (8+ characters)"
          className={inputCls}
        />
      </div>
      {msg && (
        <div
          className={`text-[13.5px] font-semibold mt-[10px] ${msg.ok ? "text-success" : "text-error"}`}
        >
          {msg.text}
        </div>
      )}
      <button
        onClick={add}
        disabled={busy}
        className="mt-4 bg-accent text-white font-semibold text-[14.5px] px-6 py-3 rounded-full border-none cursor-pointer hover:brightness-[1.12] disabled:opacity-60"
      >
        {busy ? "Adding…" : "Add team member"}
      </button>
    </div>
  );
}
