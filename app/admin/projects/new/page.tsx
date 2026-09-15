import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectForm } from "./project-form";

export default function NewProjectPage() {
  return <><div className="admin-heading"><div><p className="eyebrow">Yeni içerik</p><h1>Proje ekle</h1><p>Yayınlamadan önce taslak olarak kaydedebilirsiniz.</p></div></div><Card className="admin-card form-card"><CardHeader><CardTitle>Proje bilgileri</CardTitle><CardDescription>Metinler güvenli şekilde işlenir; yüklemeler tür ve boyut kontrolünden geçer.</CardDescription></CardHeader><CardContent><ProjectForm /></CardContent></Card></>;
}
