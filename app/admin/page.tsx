import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { readPortfolioContent } from "@/lib/content-store";
import { AdminPanel } from "@/components/admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const content = await readPortfolioContent();
  return <AdminPanel initialContent={content} />;
}
