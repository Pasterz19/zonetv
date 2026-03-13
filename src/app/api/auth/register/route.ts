import { NextResponse } from "next/server";
import { queryOne, executeSql } from "@/server/db";
import { hash } from "bcryptjs";
import { z } from "zod";

const usernameRegex = /^[A-Za-z0-9]{4,8}$/;

const bodySchema = z.object({
  name: z
    .string()
    .min(4, "Nazwa użytkownika musi mieć co najmniej 4 znaki.")
    .max(8, "Nazwa użytkownika może mieć maksymalnie 8 znaków.")
    .regex(
      usernameRegex,
      "Nazwa użytkownika może zawierać tylko litery i cyfry (bez znaków specjalnych).",
    ),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
  captchaA: z.number().int(),
  captchaB: z.number().int(),
  captchaAnswer: z.number().int(),
  company: z.string().optional(), // honeypot
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const message =
        firstIssue?.path?.[0] === "name"
          ? firstIssue.message
          : firstIssue?.path?.[0] === "email"
            ? "Podaj poprawny adres e-mail."
            : firstIssue?.path?.[0] === "password"
              ? "Hasło musi mieć co najmniej 8 znaków."
              : firstIssue?.path?.[0] === "confirmPassword"
                ? "Powtórz hasło, aby kontynuować."
                : "Nieprawidłowe dane formularza.";

      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const {
      name,
      email,
      password,
      confirmPassword,
      captchaA,
      captchaB,
      captchaAnswer,
      company,
    } = parsed.data;

    // Anti-bot: honeypot field should stay empty
    if (company && company.trim().length > 0) {
      return NextResponse.json(
        { ok: false, error: "Weryfikacja nieudana." },
        { status: 400 },
      );
    }

    // Simple math captcha
    if (captchaA + captchaB !== captchaAnswer) {
      return NextResponse.json(
        { ok: false, error: "Nieprawidłowa odpowiedź na pytanie kontrolne." },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { ok: false, error: "Hasła nie są zgodne." },
        { status: 400 },
      );
    }

    // Check if email exists
    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM User WHERE email = ?",
      [email]
    );
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Użytkownik z takim e-mailem już istnieje." },
        { status: 409 },
      );
    }

    // Check if name exists
    const existingName = await queryOne<{ id: string }>(
      "SELECT id FROM User WHERE name = ?",
      [name]
    );
    if (existingName) {
      return NextResponse.json(
        {
          ok: false,
          error: "Ta nazwa użytkownika jest już zajęta.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 10);

    // Generate cuid-like ID
    const id = `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;

    await executeSql(
      "INSERT INTO User (id, email, name, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'USER', datetime('now'), datetime('now'))",
      [id, email, name, passwordHash]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error
        ? `Wewnętrzny błąd rejestracji: ${err.message}`
        : "Wewnętrzny błąd rejestracji.";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
