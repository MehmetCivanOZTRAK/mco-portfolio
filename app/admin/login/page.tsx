import { redirect } from "next/navigation";
import { isAdmin, LOCAL_ADMIN_PASSWORD } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin-login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <AdminLoginForm localPassword={process.env.NODE_ENV === "development" ? LOCAL_ADMIN_PASSWORD : undefined} />;
}
