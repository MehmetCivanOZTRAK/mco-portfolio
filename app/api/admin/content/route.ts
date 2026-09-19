import { z } from "zod";
import { getDb } from "@/db";
import { siteContent } from "@/db/schema";
import { apiFailure, assertSameOrigin, requireApiAdmin } from "@/lib/security";
import { fallbackSiteContent } from "@/lib/site-content";

const keys = Object.keys(fallbackSiteContent) as [keyof typeof fallbackSiteContent, ...(keyof typeof fallbackSiteContent)[]];
const schema = z.object(Object.fromEntries(keys.map((key) => [key, z.string().trim().min(1).max(300)])) as Record<keyof typeof fallbackSiteContent, z.ZodString>);

export async function PUT(request: Request) {
  try {
    await requireApiAdmin(request);
    assertSameOrigin(request);
    const content = schema.parse(await request.json());
    const [row] = await getDb().insert(siteContent).values({ id: 1, content: JSON.stringify(content) }).onConflictDoUpdate({ target: siteContent.id, set: { content: JSON.stringify(content), updatedAt: new Date().toISOString() } }).returning();
    return Response.json({ content: JSON.parse(row.content) });
  } catch (error) { return apiFailure(error); }
}
