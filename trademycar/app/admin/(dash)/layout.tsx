import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

/** Everything in this group requires a logged-in owner or team member. */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <>{children}</>;
}
