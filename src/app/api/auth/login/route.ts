import { NextRequest, NextResponse } from "next/server";
import { login, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/nazwa i hasło są wymagane" },
        { status: 400 }
      );
    }

    const result = await login(identifier, password);

    if (!result) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane logowania" },
        { status: 401 }
      );
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
      },
    });

    response.cookies.set(SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas logowania" },
      { status: 500 }
    );
  }
}
