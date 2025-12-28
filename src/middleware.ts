import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers
    })
    const { pathname } = request.nextUrl
    const segments = pathname.split('/')
    const urlID = segments[2]


    if (!session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (session.user.id !== urlID) {
        return NextResponse.redirect(new URL(`/users/${session.user.id}`, request.url));

    }
    return NextResponse.next();
}

export const config = {
    runtime: "nodejs",
    matcher: ["/users/:path*"],
};