import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

const COOKIE_NAME = "civan_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;
export const LOCAL_ADMIN_PASSWORD = "civan123";

type RuntimeSecrets = {
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_HASH?: string;
  AUTH_SECRET?: string;
};

function configuredCredentials() {
  const runtime = env as unknown as RuntimeSecrets;
  return {
    password: runtime.ADMIN_PASSWORD || (process.env.NODE_ENV === "development" ? LOCAL_ADMIN_PASSWORD : ""),
    passwordHash: runtime.ADMIN_PASSWORD_HASH || "",
    authSecret: runtime.AUTH_SECRET || "",
  };
}

async function signature(password: string) {
  const bytes = new TextEncoder().encode(`civan-portfolio:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function safeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function verifyStoredHash(candidate: string, storedHash: string) {
  const [algorithm, roundsText, saltValue, expectedValue] = storedHash.split("$");
  const rounds = Number(roundsText);
  if (algorithm !== "pbkdf2-sha256" || rounds !== 100_000 || !saltValue || !expectedValue) return false;

  try {
    const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(candidate), "PBKDF2", false, ["deriveBits"]);
    const derived = new Uint8Array(await crypto.subtle.deriveBits({
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64UrlToBytes(saltValue),
      iterations: rounds,
    }, keyMaterial, 256));
    return safeEqual(derived, base64UrlToBytes(expectedValue));
  } catch {
    return false;
  }
}

function sessionSecret() {
  const configured = configuredCredentials();
  const passwordMaterial = configured.passwordHash || configured.password;
  const authSecret = configured.authSecret || (process.env.NODE_ENV === "development" ? "local-development-session" : "");
  return passwordMaterial && authSecret ? `${passwordMaterial}:${authSecret}` : "";
}

async function sessionSignature(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

export function isSameOriginRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "none"].includes(fetchSite)) return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(candidate: string) {
  const configured = configuredCredentials();
  if (!candidate) return false;
  if (configured.password) return (await signature(candidate)) === (await signature(configured.password));
  if (configured.passwordHash) return verifyStoredHash(candidate, configured.passwordHash);
  return false;
}

export async function isAdmin() {
  const secret = sessionSecret();
  if (!secret) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [expiresText, signatureText] = token.split(".");
  const expires = Number(expiresText);
  if (!Number.isInteger(expires) || expires < Math.floor(Date.now() / 1000) || !signatureText) return false;
  try {
    return safeEqual(await sessionSignature(expiresText, secret), base64UrlToBytes(signatureText));
  } catch {
    return false;
  }
}

export async function createAdminSession() {
  const secret = sessionSecret();
  if (!secret) throw new Error("Yönetici parolası ayarlanmamış.");
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const token = `${expires}.${bytesToBase64Url(await sessionSignature(String(expires), secret))}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Bu işlem için yönetici girişi gerekiyor.");
}
