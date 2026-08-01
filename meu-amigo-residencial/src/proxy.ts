import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const tipo = req.auth?.user?.tipo;

  const protegido =
    pathname.startsWith("/morador") ||
    pathname.startsWith("/prestador") ||
    pathname.startsWith("/admin");

  if (!protegido) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/morador") && tipo !== "MORADOR") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
  if (pathname.startsWith("/prestador") && tipo !== "PRESTADOR") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
  if (pathname.startsWith("/admin") && tipo !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/morador/:path*", "/prestador/:path*", "/admin/:path*"],
};
