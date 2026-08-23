import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_TOKEN);

// Map each protected path prefix to the roles allowed to view it.
// Adjust role strings to match your `roles.role_name` values exactly.
const ROUTE_RULES: { prefix: string; roles: string[] }[] = [
  { prefix: "/home/admin", roles: ["admin"] },
  { prefix: "/home/hr", roles: ["hr"] },
  { prefix: "/home/applicant", roles: ["applicant"] },

  // HR/admin-only resume management views must come before the
  // general "/resume" rule below, since matching stops at the
  // first prefix that matches.
  { prefix: "/resume/list", roles: ["admin", "hr"] },
  { prefix: "/resume", roles: ["admin", "hr", "applicant"] },

  // TODO: confirm this is the real path/folder for the application page.
  { prefix: "/application", roles: ["admin"] },
];

function homeFor(role: string | undefined) {
  if (role === "admin") return "/home/admin";
  if (role === "hr") return "/home/hr";
  if (role === "applicant") return "/home/applicant";
  return "/";
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const rule = ROUTE_RULES.find((r) => path.startsWith(r.prefix));

  if (!rule) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (!rule.roles.includes(role)) {
      // Logged in, but wrong role — send them to their own home
      // instead of letting them view another role's page.
      return NextResponse.redirect(new URL(homeFor(role), req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/home/:path*", "/resume/:path*", "/application/:path*"],
};