"use client";

export default function LogoutButton() {
  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin/login";
    }
  };
  return (
    <button
      onClick={logout}
      className="bg-white border-[1.5px] border-input rounded-full px-4 py-[7px] text-[13px] font-semibold text-[#2A3B4C] cursor-pointer hover:border-accent hover:text-accent"
    >
      Log out
    </button>
  );
}
