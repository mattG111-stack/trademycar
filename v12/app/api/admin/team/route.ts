import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hashPassword } from "@/lib/auth";
import { addUser, findUserByEmail, listUsers, removeUser } from "@/lib/db";

/**
 * Team management — owner only.
 *   GET    → list team members
 *   POST   { name, email, password } → add a member
 *   DELETE { id } → remove a member (their logins stop working instantly)
 */

async function requireOwner() {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorised", status: 401 as const };
  if (!session.isOwner)
    return { error: "Only the owner can manage the team.", status: 403 as const };
  return null;
}

export async function GET() {
  const denied = await requireOwner();
  if (denied)
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  return NextResponse.json({ users: listUsers() });
}

export async function POST(req: NextRequest) {
  const denied = await requireOwner();
  if (denied)
    return NextResponse.json({ error: denied.error }, { status: denied.status });

  let name = "", email = "", password = "";
  try {
    const b = (await req.json()) as Record<string, string>;
    name = String(b.name ?? "").trim();
    email = String(b.email ?? "").trim().toLowerCase();
    password = String(b.password ?? "");
  } catch { /* fall through */ }

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return NextResponse.json(
      { error: "Needs a name, a valid email, and a password of at least 8 characters." },
      { status: 400 },
    );
  }
  if (findUserByEmail(email)) {
    return NextResponse.json(
      { error: "That email already has a login." },
      { status: 409 },
    );
  }

  addUser(name, email, hashPassword(password));
  return NextResponse.json({ ok: true, users: listUsers() });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireOwner();
  if (denied)
    return NextResponse.json({ error: denied.error }, { status: denied.status });

  let id = 0;
  try {
    id = Number(((await req.json()) as { id?: number }).id);
  } catch { /* fall through */ }
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  removeUser(id);
  return NextResponse.json({ ok: true, users: listUsers() });
}
