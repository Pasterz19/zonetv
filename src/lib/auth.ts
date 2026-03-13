import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { queryOne } from "@/server/db";

const SESSION_COOKIE_NAME = "zonetv_session";

// Require AUTH_SECRET - no fallback for security
const authSecret = process.env.AUTH_SECRET;
if (!authSecret) {
  throw new Error(
    "AUTH_SECRET environment variable is required. " +
    "Please set a secure random string (min 32 characters)."
  );
}

const secretKey = new TextEncoder().encode(authSecret);

interface SessionPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  role: string;
}

export async function auth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secretKey);
    const session = payload as unknown as SessionPayload;
    
    const userId = session.sub;
    if (!userId) return null;

    const user = await queryOne<UserRow>(
      "SELECT id, email, name, passwordHash, role FROM User WHERE id = ?",
      [userId]
    );
    
    if (!user) return null;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    return null;
  }
}

export async function login(identifier: string, password: string) {
  const trimmed = identifier.trim();
  const lowercased = trimmed.toLowerCase();

  // Try to find user by email first (case-insensitive), then by name
  let user = await queryOne<UserRow>(
    "SELECT id, email, name, passwordHash, role FROM User WHERE LOWER(email) = ?",
    [lowercased]
  );
  
  if (!user) {
    user = await queryOne<UserRow>(
      "SELECT id, email, name, passwordHash, role FROM User WHERE LOWER(name) = ?",
      [lowercased]
    );
  }

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  const token = await new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(user.id)
    .setExpirationTime("7d")
    .sign(secretKey);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token,
  };
}

export const SESSION_COOKIE = SESSION_COOKIE_NAME;

// Also export the secret key for other modules
export const SECRET_KEY = secretKey;
