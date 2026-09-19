import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <main className="login-page"><a className="brand" href="/"><span className="brand-mark">C</span><span>CIWAN GAMES</span></a><section className="login-card"><p className="eyebrow">Yönetici girişi</p><h1>Admin paneli</h1><p>İçerik ve oyun dosyalarını yönetmek için giriş yapın.</p><LoginForm /></section></main>;
}
