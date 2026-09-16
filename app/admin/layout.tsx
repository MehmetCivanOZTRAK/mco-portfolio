import Link from "next/link";
import { Database, FilePlus2, FolderKanban, LogOut, Settings2, Type } from "lucide-react";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { AdminWebMcp } from "@/components/admin-webmcp";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireChatGPTUser("/admin");
  return <div className="admin-shell"><AdminWebMcp />
    <aside className="admin-sidebar">
      <Link className="brand" href="/"><span className="brand-mark">C</span><span>CIWAN.DEV</span></Link>
      <nav className="admin-nav" aria-label="Yönetim menüsü">
        <Link href="/admin"><FolderKanban /> Projeler</Link>
        <Link href="/admin/projects/new"><FilePlus2 /> Yeni proje</Link>
        <Link href="/admin/profile"><Settings2 /> Profil</Link>
        <Link href="/admin/content"><Type /> Site metinleri</Link>
        <Link href="/admin/database"><Database /> Veritabanı</Link>
      </nav>
      <div className="admin-user"><span>{user.displayName}</span><a href={chatGPTSignOutPath("/")}><LogOut size={16} /> Çıkış</a></div>
    </aside>
    <div className="admin-content">{children}</div>
  </div>;
}
