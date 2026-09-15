import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/lib/portfolio";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() { const profile = await getProfile(); return <><div className="admin-heading"><div><p className="eyebrow">Kişisel bilgiler</p><h1>Profil</h1><p>Ana sayfa ve footer metinlerini güncelleyin.</p></div></div><Card className="admin-card form-card"><CardHeader><CardTitle>Hakkımda bilgileri</CardTitle><CardDescription>Bu alanlar herkese açık portfolyoda görünür.</CardDescription></CardHeader><CardContent><ProfileForm profile={profile} /></CardContent></Card></>; }
