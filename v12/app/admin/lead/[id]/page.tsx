import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Logo } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";
import { PHOTO_SLOTS } from "@/lib/content";
import { getAdminSession } from "@/lib/auth";
import { getLead } from "@/lib/db";
import { signFile } from "@/lib/sign";

export const dynamic = "force-dynamic";

/** "photo_wheel_fl__IMG_1234.jpg" → "Wheel — front left" */
function fileLabel(name: string): string {
  if (name.startsWith("offerDocument__")) return "Written offer";
  const m = name.match(/^photo_(.+?)__/);
  if (m) {
    const slot = PHOTO_SLOTS.find((s) => s.id === m[1]);
    if (slot) return slot.label;
    return m[1].replace(/_/g, " ");
  }
  return name;
}

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getAdminSession())) redirect("/admin/login");
  const { id } = await params;
  const lead = getLead(id);
  if (!lead) notFound();

  const v = lead.vehicle;
  const vehTitle = v
    ? [v.year, v.make, v.model, v.spec].filter(Boolean).join(" ")
    : "Vehicle not confirmed";
  const chips = v
    ? [
        v.km ? `${Number(v.km).toLocaleString()} km` : null,
        v.fuel,
        v.drive,
      ].filter(Boolean)
    : [];
  const photos = lead.files.filter((f) => f.isImage && !f.isOfferDoc);
  const docs = lead.files.filter((f) => f.isOfferDoc || !f.isImage);

  const financeLabel =
    lead.finance === "yes"
      ? "Finance owing — settle with lender, pay the balance"
      : lead.finance === "no"
        ? "No finance owing"
        : lead.finance === "unsure"
          ? "Not sure about finance"
          : "Finance not answered";

  return (
    <div className="min-h-screen bg-alt">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-[12px] border-b border-hairline">
        <div className="max-w-[1120px] mx-auto px-6 h-[66px] flex items-center justify-between">
          <Link href="/" className="no-underline">
            <Logo size={36} />
          </Link>
          <span className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-[13.5px] font-bold text-accent no-underline hover:underline"
            >
              ← All leads
            </Link>
            <LogoutButton />
          </span>
        </div>
      </header>

      <main className="max-w-[1120px] mx-auto px-6 py-10">
        {/* Lead summary */}
        <div className="bg-white border border-line rounded-[22px] p-7 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[12px] font-bold tracking-[.1em] uppercase text-muted mb-2">
                Lead · {lead.createdAt} UTC
              </div>
              <h1 className="font-display font-extrabold text-[clamp(26px,4vw,36px)] tracking-[-.02em] text-ink-2 m-0 leading-[1.1]">
                {vehTitle}
              </h1>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-[#0E0E0E] text-white font-extrabold tracking-[.12em] text-[14px] px-[13px] py-[6px] rounded-[8px]">
                  {lead.plate || "NO PLATE"}
                </span>
                {chips.map((c) => (
                  <span
                    key={c}
                    className="bg-[#F1F4F7] text-[#2A3B4C] font-semibold text-[13.5px] px-[13px] py-[7px] rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-none">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-block bg-accent text-white font-semibold text-[15px] px-6 py-3 rounded-full no-underline hover:brightness-[1.12]"
                >
                  Call {lead.name || "seller"} →
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 mt-6 pt-6 border-t border-hairline">
            <div>
              <div className="text-[11.5px] font-bold tracking-[.08em] uppercase text-muted mb-1">
                Contact
              </div>
              <div className="font-bold text-[16px] text-ink-3">
                {lead.name || "—"}
              </div>
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="block text-accent font-semibold text-[14.5px] no-underline mt-[2px]"
                >
                  {lead.phone}
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="block text-accent text-[14px] no-underline mt-[2px]"
                >
                  {lead.email}
                </a>
              )}
            </div>
            <div>
              <div className="text-[11.5px] font-bold tracking-[.08em] uppercase text-muted mb-1">
                Finance
              </div>
              <div className="text-[14.5px] text-ink-3 font-medium">
                {financeLabel}
              </div>
            </div>
            <div>
              <div className="text-[11.5px] font-bold tracking-[.08em] uppercase text-muted mb-1">
                Competing offer
              </div>
              {lead.offerAmount ? (
                <div className="text-[14.5px] text-ink-3">
                  <b>
                    {lead.offerAmount.startsWith("$")
                      ? lead.offerAmount
                      : `$${lead.offerAmount}`}
                  </b>
                  {lead.offerDealer && ` — ${lead.offerDealer}`}
                  <div className="text-[13px] text-success font-semibold mt-[2px]">
                    Beat it by $500 → guarantee applies
                  </div>
                </div>
              ) : (
                <div className="text-[14.5px] text-body-2">None given</div>
              )}
            </div>
            {docs.length > 0 && (
              <div>
                <div className="text-[11.5px] font-bold tracking-[.08em] uppercase text-muted mb-1">
                  Documents
                </div>
                {docs.map((f) => (
                  <a
                    key={f.name}
                    href={`/api/admin/uploads/${lead.id}/${encodeURIComponent(f.name)}?t=${signFile(lead.id, f.name)}`}
                    target="_blank"
                    className="inline-flex items-center h-9 px-3 mr-2 mt-1 rounded-[8px] border border-line bg-[#F6F8FA] text-[12.5px] font-bold text-ink-3 no-underline"
                  >
                    {fileLabel(f.name)} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All photos */}
        <div className="bg-white border border-line rounded-[22px] p-7">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display font-extrabold text-[24px] text-ink-2 m-0 tracking-[-.01em]">
              Photos
            </h2>
            <span className="text-[13px] text-muted font-medium">
              {photos.length} of {PHOTO_SLOTS.length} · click any photo for
              full size
            </span>
          </div>
          {photos.length === 0 ? (
            <p className="text-body-2 text-[14.5px] m-0">
              No photos were uploaded with this lead.
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {photos.map((f) => {
                const url = `/api/admin/uploads/${lead.id}/${encodeURIComponent(f.name)}?t=${signFile(lead.id, f.name)}`;
                return (
                  <a
                    key={f.name}
                    href={url}
                    target="_blank"
                    className="block no-underline group"
                  >
                    <span className="block aspect-[4/3] rounded-[14px] overflow-hidden border border-line bg-[#F1F4F7]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={fileLabel(f.name)}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                    </span>
                    <span className="block text-[13.5px] font-semibold text-ink-3 mt-2">
                      {fileLabel(f.name)}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
