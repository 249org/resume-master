import { NextRequest, NextResponse } from "next/server";

// Cloudflare Workers Edge middleware cannot import better-auth because it uses
// dynamic code evaluation. We do a lightweight cookie-presence check here for
// fast UX redirects. Full session validation happens in each protected
// server component / API route via auth.api.getSession().
// On HTTPS, Better Auth sets `__Secure-better-auth.session_token` (see cookie builder in better-auth).
const SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

export function middleware(request: NextRequest) {
  const hasSession = hasSessionCookie(request);
  if (!hasSession) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/users/:path*"],
};
