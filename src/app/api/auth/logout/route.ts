import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST handler for form submissions (used by forms)
export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);

  // Clear session cookie
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}

// GET handler for direct links (backup)
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 307);

  // Clear session cookie
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
