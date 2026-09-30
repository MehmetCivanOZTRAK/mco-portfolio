import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

const COOKIE_NAME = "civan_admin_session";
export const LOCAL_ADMIN_PASSWORD = "civan123";

function configuredPassword() {
  return env.ADMIN_PASSWORD || (process.env.NODE_ENV === "development" ? LOCAL_ADMIN_PASSWORD : "");
}

async function signature(password: string) {
  const bytes = new TextEncoder().encode(`civan-portfolio:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyAdminPassword(candidate: string) {
  const expected = configuredPassword();
  if (!expected || !candidate) return false;
  return (await signature(candidate)) === (await signature(expected));
}

export async function isAdmin() {
  const password = configuredPassword();
  if (!password) return false;
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === await signature(password);
}

export async function createAdminSession() {
  const password = configuredPassword();
  if (!password) throw new Error("ADMIN_PASSWORD ayarlanmamış.");
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await signature(password), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Bu işlem için yönetici girişi gerekiyor.");
}
