import { z } from "zod";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { apiFailure, assertSameOrigin, requireApiAdmin } from "@/lib/security";

const schema = z.object({ displayName: z.string().trim().min(2).max(60), role: z.string().trim().min(2).max(80), headline: z.string().trim().min(10).max(180), about: z.string().trim().min(20).max(2000), email: z.string().trim().email().or(z.literal("")) });

export async function PUT(request: Request) {
  try {
    await requireApiAdmin(); assertSameOrigin(request);
    const data = schema.parse(await request.json());
    const [profile] = await getDb().insert(profiles).values({ id: 1, ...data }).onConflictDoUpdate({ target: profiles.id, set: { ...data, updatedAt: new Date().toISOString() } }).returning();
    return Response.json({ profile });
  } catch (error) { return apiFailure(error); }
}
