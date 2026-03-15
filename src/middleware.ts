import { NextRequest, NextResponse } from "next/server";

// Cloudflare Workers Edge middleware cannot import better-auth because it uses
// dynamic code evaluation. We do a lightweight cookie-presence check here for
// fast UX redirects. Full session validation happens in each protected
// server component / API route via auth.api.getSession().
const SESSION_COOKIE = "better-auth.session_token";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
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
