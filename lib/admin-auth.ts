import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "ciwan_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

type RuntimeSecrets = { ADMIN_EMAIL?: string; ADMIN_PASSWORD_HASH?: string; AUTH_SECRET?: string };

function config() {
  const runtime = env as unknown as RuntimeSecrets;
  const email = runtime.ADMIN_EMAIL ?? process.env.ADMIN_EMAIL;
  const passwordHash = runtime.ADMIN_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD_HASH;
  const secret = runtime.AUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!email || !passwordHash || !secret) throw new Error("Admin kimlik bilgileri yapılandırılmamış.");
  return { email: email.toLocaleLowerCase("tr"), passwordHash, secret };
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function safeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const admin = config();
  if (email.trim().toLocaleLowerCase("tr") !== admin.email) return false;
  const [algorithm, roundsText, saltValue, expectedValue] = admin.passwordHash.split("$");
  const rounds = Number(roundsText);
  if (algorithm !== "pbkdf2-sha256" || !Number.isInteger(rounds) || rounds < 100_000 || !saltValue || !expectedValue) return false;
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: base64UrlToBytes(saltValue), iterations: rounds }, keyMaterial, 256));
  return safeEqual(derived, base64UrlToBytes(expectedValue));
}

export async function createAdminSession() {
  const { email, secret } = config();
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${email}|${expires}`;
  return `${expires}.${bytesToBase64Url(await hmac(payload, secret))}`;
}

export async function verifyAdminSession(token?: string | null) {
  if (!token) return false;
  const [expiresText, signatureText] = token.split(".");
  const expires = Number(expiresText);
  if (!Number.isInteger(expires) || expires < Math.floor(Date.now() / 1000) || !signatureText) return false;
  const { email, secret } = config();
  const expected = await hmac(`${email}|${expires}`, secret);
  try { return safeEqual(expected, base64UrlToBytes(signatureText)); } catch { return false; }
}

export async function requireAdminPage(returnTo = "/admin") {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminSession(token))) redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
  return config().email;
}

export function sessionCookie(token: string, secure = true) {
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure ? "; Secure" : ""}`;
}

export function expiredSessionCookie(secure = true) {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`;
}
