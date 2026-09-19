import { expiredSessionCookie } from "@/lib/admin-auth";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  assertSameOrigin(request);
  return new Response(null, { status: 303, headers: { Location: "/", "Set-Cookie": expiredSessionCookie(new URL(request.url).protocol === "https:") } });
}
