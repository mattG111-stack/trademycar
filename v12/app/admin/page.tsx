import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";
import TeamManager from "@/components/TeamManager";
import PlateApiSettings from "@/components/PlateApiSettings";
import { getAdminSession } from "@/lib/auth";
import { getCarJamKey } from "@/lib/carjam";
import { signFile } from "@/lib/sign";
import { getDashboardStats, getSetting, listUsers } from "@/lib/db";

export const dynamic = "force-dynamic";

const PERIODS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "All time", days: null },
] as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const days =
    daysParam === "all" ? null : Number(daysParam) > 0 ? Number(daysParam) : 30;
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const stats = getDashboardStats(days);
  const maxSessions = Math.max(1, ...stats.funnel.map((f) => f.sessions));

  return (
    <div className="min-h-screen bg-alt">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-[12px] border-b border-hairline">
        <div className="max-w-[1120px] mx-auto px-6 h-[66px] flex items-center justify-between">
          <Link href="/" className="no-underline">
            <Logo size={36} />
          </Link>
          <span className="flex items-center gap-4">
            <span className="text-[13px] font-bold tracking-[.1em] uppercase text-muted">
              {session ? session.name : "Admin"}
            </span>
            <LogoutButton />
          </span>
        </div>
      </header>

      <main className="max-w-[1120px] mx-auto px-6 py-10">
        {/* Period selector */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <h1 className="font-display font-extrabold text-[clamp(26px,4vw,36px)] tracking-[-.02em] text-ink-2 m-0">
            How sellers are converting
          </h1>
          <div className="flex gap-2">
            {PERIODS.map((p) => {
              const active =
                p.days === days || (p.days === null && days === null);
              return (
                <Link
                  key={p.label}
                  href={p.days === null ? "/admin?days=all" : `/admin?days=${p.days}`}
                  className={`px-4 py-2 rounded-full text-[13.5px] font-semibold no-underline border-[1.5px] ${
                    active
                      ? "border-accent bg-[#E7EEFE] text-accent"
                      : "border-input bg-white text-[#2A3B4C]"
                  }`}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Leads — one line each: vehicle details, contacts, photos */}
        <div className="bg-white border border-line rounded-[22px] p-7 mb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 className="font-display font-extrabold text-[20px] text-ink-2 m-0 tracking-[-.01em]">
              Leads
            </h2>
            <span className="text-[13px] text-muted font-medium">
              {stats.leads.length.toLocaleString()} total · newest first
            </span>
          </div>
          {stats.leads.length === 0 ? (
            <p className="text-body-2 text-[14.5px] m-0">
              No leads yet — they&apos;ll show here (and land in your inbox) as
              soon as someone completes the flow.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full border-collapse text-[13.5px] whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[11.5px] uppercase tracking-[.08em] text-muted">
                    <th className="pb-2 pr-4 font-bold">When (UTC)</th>
                    <th className="pb-2 pr-4 font-bold">Plate</th>
                    <th className="pb-2 pr-4 font-bold">Vehicle</th>
                    <th className="pb-2 pr-4 font-bold">Contact</th>
                    <th className="pb-2 pr-4 font-bold">Finance</th>
                    <th className="pb-2 pr-4 font-bold">Their offer</th>
                    <th className="pb-2 pr-4 font-bold">Photos & docs</th>
                    <th className="pb-2 font-bold"></th>
                  </tr>
                </thead>
                <tbody className="align-middle">
                  {stats.leads.map((l) => {
                    const v = l.vehicle;
                    const vehTitle = v
                      ? [v.year, v.make, v.model, v.spec]
                          .filter(Boolean)
                          .join(" ")
                      : "—";
                    const vehMeta = v
                      ? [
                          v.km ? `${Number(v.km).toLocaleString()} km` : null,
                          v.fuel,
                          v.drive,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : "";
                    const photos = l.files.filter(
                      (f) => f.isImage && !f.isOfferDoc,
                    );
                    const docs = l.files.filter(
                      (f) => f.isOfferDoc || !f.isImage,
                    );
                    return (
                      <tr key={l.id} className="border-t border-hairline">
                        <td className="py-3 pr-4 text-body-2">{l.createdAt}</td>
                        <td className="py-3 pr-4">
                          <Link
                            href={`/admin/lead/${l.id}`}
                            className="font-extrabold tracking-[.08em] text-accent no-underline hover:underline"
                          >
                            {l.plate || "(no plate)"}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-semibold text-ink-3">
                            {vehTitle}
                          </span>
                          {vehMeta && (
                            <span className="text-body-2"> · {vehMeta}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-semibold text-ink-3">
                            {l.name || "—"}
                          </span>
                          {l.phone && (
                            <>
                              {" · "}
                              <a
                                href={`tel:${l.phone}`}
                                className="font-semibold text-accent no-underline"
                              >
                                {l.phone}
                              </a>
                            </>
                          )}
                          {l.email && (
                            <>
                              {" · "}
                              <a
                                href={`mailto:${l.email}`}
                                className="text-accent no-underline"
                              >
                                {l.email}
                              </a>
                            </>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-body-2">
                          {l.finance === "yes"
                            ? "Owing"
                            : l.finance === "no"
                              ? "None"
                              : l.finance === "unsure"
                                ? "Not sure"
                                : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          {l.offerAmount ? (
                            <>
                              <span className="font-semibold text-ink-3">
                                {l.offerAmount.startsWith("$")
                                  ? l.offerAmount
                                  : `$${l.offerAmount}`}
                              </span>
                              {l.offerDealer && (
                                <span className="text-body-2">
                                  {" "}
                                  — {l.offerDealer}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-body-2">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center gap-[6px]">
                            {photos.map((f) => {
                              const url = `/api/admin/uploads/${l.id}/${encodeURIComponent(f.name)}?t=${signFile(l.id, f.name)}`;
                              return (
                                <a
                                  key={f.name}
                                  href={url}
                                  target="_blank"
                                  title={f.name}
                                  className="block w-12 h-9 rounded-[6px] overflow-hidden border border-line flex-none"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={url}
                                    alt={f.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                </a>
                              );
                            })}
                            {docs.map((f) => (
                              <a
                                key={f.name}
                                href={`/api/admin/uploads/${l.id}/${encodeURIComponent(f.name)}?t=${signFile(l.id, f.name)}`}
                                target="_blank"
                                title={f.name}
                                className="inline-flex items-center h-9 px-2 rounded-[6px] border border-line bg-[#F6F8FA] text-[11.5px] font-bold text-ink-3 no-underline flex-none"
                              >
                                {f.isOfferDoc ? "OFFER DOC" : "FILE"}
                              </a>
                            ))}
                            {photos.length === 0 && docs.length === 0 && (
                              <span className="text-body-2">none</span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 pl-4">
                          <Link
                            href={`/admin/lead/${l.id}`}
                            className="text-[13px] font-bold text-accent no-underline hover:underline whitespace-nowrap"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Headline stats */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px] mb-8">
          {[
            {
              label: "Visitors",
              value: stats.totalVisits.toLocaleString(),
              sub: "unique sessions on the site",
            },
            {
              label: "Leads submitted",
              value: stats.totalLeads.toLocaleString(),
              sub: "completed the offer flow",
            },
            {
              label: "Conversion rate",
              value:
                stats.conversionRate === null
                  ? "—"
                  : `${stats.conversionRate}%`,
              sub: "visitors → submitted leads",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white border border-line rounded-[20px] p-6"
            >
              <div className="text-[12px] font-bold tracking-[.1em] uppercase text-muted">
                {c.label}
              </div>
              <div className="font-display font-extrabold text-[40px] text-accent leading-[1.1] mt-1">
                {c.value}
              </div>
              <div className="text-[13.5px] text-body-2 mt-1">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div className="bg-white border border-line rounded-[22px] p-7 mb-8">
          <div className="text-[13px] font-bold tracking-[.12em] uppercase text-accent mb-1">
            Funnel
          </div>
          <h2 className="font-display font-extrabold text-[24px] text-ink-2 mt-0 mb-6 tracking-[-.01em]">
            Where people drop off
          </h2>
          <div className="flex flex-col gap-4">
            {stats.funnel.map((row, i) => {
              const prev = i > 0 ? stats.funnel[i - 1].sessions : null;
              const lost =
                prev !== null && prev > 0 ? prev - row.sessions : null;
              return (
                <div key={row.event}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 mb-[6px]">
                    <span className="font-semibold text-[15px] text-ink-3">
                      {i + 1}. {row.label}
                    </span>
                    <span className="text-[13.5px] text-body-2">
                      <b className="text-ink-3">
                        {row.sessions.toLocaleString()}
                      </b>
                      {row.stepRate !== null && (
                        <>
                          {" "}
                          · {row.stepRate}% of previous step
                          {lost !== null && lost > 0 && (
                            <span className="text-error font-semibold">
                              {" "}
                              · −{lost.toLocaleString()} dropped
                            </span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="h-[26px] bg-[#EEF1F4] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        row.event === "submitted" ? "bg-success" : "bg-accent"
                      }`}
                      style={{
                        width: `${Math.max(
                          row.sessions > 0 ? 2 : 0,
                          (row.sessions / maxSessions) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[13px] text-muted mt-5 mb-0">
            Counts are unique sessions (first-party cookie). &ldquo;Passed the
            trade-in step&rdquo; includes people who tapped &ldquo;I don&apos;t
            have an offer yet&rdquo;.
          </p>
        </div>

        {/* Daily traffic */}
        <div className="bg-white border border-line rounded-[22px] p-7 mb-8">
          <h2 className="font-display font-extrabold text-[20px] text-ink-2 mt-0 mb-4 tracking-[-.01em]">
            Last 14 days
          </h2>
          {stats.visitsByDay.length === 0 ? (
            <p className="text-body-2 text-[14.5px] m-0">No traffic yet.</p>
          ) : (
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-[.08em] text-muted">
                  <th className="pb-2 font-bold">Day</th>
                  <th className="pb-2 font-bold text-right">Visitors</th>
                  <th className="pb-2 font-bold text-right">Leads</th>
                </tr>
              </thead>
              <tbody>
                {stats.visitsByDay.map((d) => (
                  <tr key={d.day} className="border-t border-hairline">
                    <td className="py-2 text-ink-3 font-medium">{d.day}</td>
                    <td className="py-2 text-right">{d.visits}</td>
                    <td className="py-2 text-right font-semibold text-success">
                      {d.leads}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {session?.isOwner && <TeamManager initialUsers={listUsers()} />}

        {session?.isOwner && (
          <PlateApiSettings
            initialMaskedKey={(() => {
              const k = getCarJamKey();
              return k ? `••••••••${k.slice(-4)}` : null;
            })()}
            initialSource={
              getSetting("carjam_api_key")
                ? "dashboard"
                : process.env.PLATE_LOOKUP_API_KEY
                  ? "environment"
                  : null
            }
          />
        )}

      </main>
    </div>
  );
}
