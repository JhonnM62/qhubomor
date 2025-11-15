import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;
  const protectedPaths = [/^\/games(\/.*)?$/, /^\/claim$/, /^\/admin(\/.*)?$/, /^\/bingo$/];
  const isProtected = protectedPaths.some((re) => re.test(path));
  if (isProtected && !token) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }
  if (/^\/admin(\/.*)?$/.test(path)) {
    const role = (token as any)?.role ?? "USER";
    if (role !== "ADMIN") {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/games/:path*", "/claim", "/admin/:path*"] };
