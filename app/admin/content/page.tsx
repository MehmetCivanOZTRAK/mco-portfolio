import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteContent } from "@/lib/portfolio";
import { ContentForm } from "./content-form";

export default async function ContentPage() {
  const content = await getSiteContent();
  return <><div className="admin-heading"><div><p className="eyebrow">İçerik yönetimi</p><h1>Site metinleri</h1><p>Ana sayfa, proje kartları, footer ve detay sayfalarındaki metinleri değiştirin.</p></div></div><Card className="admin-card form-card content-card"><CardHeader><CardTitle>Herkese açık metinler</CardTitle><CardDescription>{"{name}"} ve {"{year}"} ifadeleri otomatik olarak adınız ve güncel yılla değiştirilir.</CardDescription></CardHeader><CardContent><ContentForm content={content} /></CardContent></Card></>;
}
