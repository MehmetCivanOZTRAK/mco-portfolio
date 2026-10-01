"use client";

import { useState } from "react";
import { ArrowLeft, Eye, FileUp, ImageUp, LogOut, Plus, Save, Trash2 } from "lucide-react";
import type { Locale, LocalizedText, PortfolioContent } from "@/lib/content";
import Image from "next/image";

type Tab = "profile" | "sections" | "labels" | "experience" | "projects" | "documents";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "profile", label: "Profil" },
  { id: "sections", label: "Bölüm metinleri" },
  { id: "labels", label: "Menü & düğmeler" },
  { id: "experience", label: "Deneyimler" },
  { id: "projects", label: "Projeler" },
  { id: "documents", label: "CV & Sertifikalar" },
];

const sectionLabels: Record<keyof PortfolioContent["sections"], string> = {
  experienceKicker: "Deneyim üst başlığı",
  experienceTitle: "Deneyim başlığı",
  experienceDescription: "Deneyim açıklaması",
  projectsKicker: "Proje üst başlığı",
  projectsTitle: "Proje başlığı",
  projectsDescription: "Proje açıklaması",
  contentKicker: "İçerik üst başlığı",
  contentTitle: "İçerik başlığı",
  contentDescription: "İçerik açıklaması",
  contactKicker: "İletişim üst başlığı",
  contactTitle: "İletişim başlığı",
  contactDescription: "İletişim açıklaması",
};

const interfaceLabels: Record<keyof PortfolioContent["labels"], string> = {
  navAbout: "Menü — Hakkımda",
  navExperience: "Menü — Deneyim",
  navProjects: "Menü — Projeler",
  navContent: "Menü — İçerik",
  navContact: "Menü — İletişim",
  openCv: "CV yüklüyken görünen düğme",
  cvSoon: "CV yokken görünen düğme",
  contactMe: "İletişim düğmesi",
  admin: "Alt bölüm — yönetim bağlantısı",
  backToTop: "Alt bölüm — yukarı dön bağlantısı",
};

export function AdminPanel({ initialContent }: { initialContent: PortfolioContent }) {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [editingLanguage, setEditingLanguage] = useState<Locale>("tr");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3600);
  }

  async function save() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(content),
      });
      const result = await response.json() as PortfolioContent & { error?: string };
      if (!response.ok) throw new Error(result.error || "Kaydedilemedi.");
      setContent(result);
      flash("Değişiklikler yayınlanmak üzere kaydedildi.");
    } catch (error) {
      flash(error instanceof Error ? error.message : "Kaydetme sırasında hata oluştu.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign(new URL("/admin/login", window.location.origin).toString());
  }

  async function upload(file: File, category: "image" | "document" | "game") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const result = await response.json() as { url?: string; fileName?: string; mimeType?: string; error?: string };
    if (!response.ok) throw new Error(result.error || "Yükleme başarısız.");
    return result as { url: string; fileName: string; mimeType: string };
  }

  async function uploadPhoto(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await upload(file, "image");
      setContent((current) => ({ ...current, profile: { ...current.profile, photoUrl: result.url } }));
      flash("Portre yüklendi. Kalıcı olması için Kaydet'e basın.");
    } catch (error) { flash(error instanceof Error ? error.message : "Yüklenemedi."); }
    finally { setBusy(false); }
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await upload(file, "image");
      setContent((current) => ({ ...current, branding: { ...current.branding, logoUrl: result.url } }));
      flash("Logo yüklendi. Kalıcı olması için Kaydet'e basın.");
    } catch (error) { flash(error instanceof Error ? error.message : "Logo yüklenemedi."); }
    finally { setBusy(false); }
  }

  async function uploadFavicon(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await upload(file, "image");
      setContent((current) => ({ ...current, branding: { ...current.branding, faviconUrl: result.url } }));
      flash("Sekme ikonu yüklendi. Kalıcı olması için Kaydet'e basın.");
    } catch (error) { flash(error instanceof Error ? error.message : "Sekme ikonu yüklenemedi."); }
    finally { setBusy(false); }
  }

  function updateProfile(key: "name" | "email" | "photoUrl", value: string) {
    setContent((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  }

  function translated(value: LocalizedText) {
    return value[editingLanguage];
  }

  function updateTranslation(value: LocalizedText, next: string): LocalizedText {
    return { ...value, [editingLanguage]: next };
  }

  function updateProfileTranslation(key: "eyebrow" | "role" | "description" | "location" | "availability", value: string) {
    setContent((current) => ({
      ...current,
      profile: { ...current.profile, [key]: updateTranslation(current.profile[key], value) },
    }));
  }

  function updateSocial(key: keyof PortfolioContent["socials"], value: string) {
    setContent((current) => ({ ...current, socials: { ...current.socials, [key]: value } }));
  }

  function addExperience() {
    setContent((current) => ({
      ...current,
      experiences: [...current.experiences, { id: crypto.randomUUID(), type: "experience", period: { tr: "2026", en: "2026" }, title: { tr: "Yeni deneyim", en: "New experience" }, organization: { tr: "Kurum", en: "Organization" }, description: { tr: "Deneyiminizi açıklayın.", en: "Describe your experience." } }],
    }));
  }

  function updateExperience(index: number, key: string, value: string) {
    setContent((current) => ({ ...current, experiences: current.experiences.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  }

  function updateExperienceTranslation(index: number, key: "period" | "title" | "organization" | "description", value: string) {
    setContent((current) => ({ ...current, experiences: current.experiences.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: updateTranslation(item[key], value) } : item) }));
  }

  function addProject() {
    setContent((current) => ({
      ...current,
      projects: [...current.projects, { id: crypto.randomUUID(), title: "Yeni proje", category: { tr: "Kategori", en: "Category" }, description: { tr: "Projenizi kısaca anlatın.", en: "Describe your project briefly." }, technologies: "Teknolojiler", link: "#iletisim", actionType: "details", actionLabel: { tr: "Projeyi incele", en: "View project" }, imageUrl: "" }],
    }));
  }

  function updateProject(index: number, key: string, value: string) {
    setContent((current) => ({ ...current, projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  }

  function updateProjectTranslation(index: number, key: "category" | "description" | "actionLabel", value: string) {
    setContent((current) => ({ ...current, projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: updateTranslation(item[key], value) } : item) }));
  }

  async function uploadProjectImage(index: number, file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await upload(file, "image");
      updateProject(index, "imageUrl", result.url);
      flash("Proje görseli yüklendi. Kalıcı olması için Kaydet'e basın.");
    } catch (error) { flash(error instanceof Error ? error.message : "Yüklenemedi."); }
    finally { setBusy(false); }
  }

  async function uploadGamePackage(index: number, file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await upload(file, "game");
      setContent((current) => ({
        ...current,
        projects: current.projects.map((item, itemIndex) => itemIndex === index ? {
          ...item,
          link: result.url,
          actionType: "download",
          actionLabel: { tr: "Oyunu indir", en: "Download game" },
        } : item),
      }));
      flash("Oyun paketi yüklendi. Kalıcı olması için Kaydet'e basın.");
    } catch (error) { flash(error instanceof Error ? error.message : "Oyun paketi yüklenemedi."); }
    finally { setBusy(false); }
  }

  async function addDocument(type: "cv" | "certificate", file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await upload(file, "document");
      setContent((current) => {
        const remaining = type === "cv" ? current.documents.filter((item) => item.type !== "cv") : current.documents;
        const title = type === "cv" ? `${current.profile.name} — CV` : file.name.replace(/\.pdf$/i, "");
        return { ...current, documents: [...remaining, { id: crypto.randomUUID(), title: { tr: title, en: title }, type, fileUrl: result.url, fileName: result.fileName, issuedAt: new Date().getFullYear().toString() }] };
      });
      flash("PDF yüklendi. Başlığını düzenleyip Kaydet'e basın.");
    } catch (error) { flash(error instanceof Error ? error.message : "Yüklenemedi."); }
    finally { setBusy(false); }
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-title"><span className="brand">MCO<span>.</span></span><div><b>Portfolyo Yönetimi</b><small>Tüm içerik, görsel ve belgeler</small></div></div>
        <div className="admin-actions">
          <div className="admin-language" aria-label="Düzenlenen içerik dili">
            <button type="button" className={editingLanguage === "tr" ? "active" : ""} onClick={() => setEditingLanguage("tr")}>TR</button>
            <button type="button" className={editingLanguage === "en" ? "active" : ""} onClick={() => setEditingLanguage("en")}>EN</button>
          </div>
          <button className="admin-button" type="button" onClick={() => window.location.assign(new URL("/", window.location.origin).toString())}><ArrowLeft size={16} /><span>Siteye dön</span></button>
          <button className="admin-button" type="button" onClick={() => window.open(new URL("/", window.location.origin).toString(), "_blank", "noopener,noreferrer")}><Eye size={16} /><span>Önizle</span></button>
          <button className="admin-button" type="button" onClick={logout}><LogOut size={16} /><span>Çıkış</span></button>
          <button className="admin-button primary" type="button" onClick={save} disabled={busy}><Save size={16} /><span>{busy ? "İşleniyor" : "Kaydet"}</span></button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Yönetim bölümleri">
          {tabs.map((tab) => <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
        </aside>

        <section className="admin-panel">
          <div className="admin-panel-head"><h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1><p><b>{editingLanguage === "tr" ? "Türkçe" : "İngilizce"}</b> içerikleri düzenliyorsunuz. Değişiklikleri bitirdiğinizde Kaydet düğmesini kullanın.</p></div>

          {activeTab === "profile" && (
            <>
              <div className="admin-card"><h2>Ana ekran</h2><div className="admin-grid">
                <Field label="İsim" value={content.profile.name} onChange={(value) => updateProfile("name", value)} />
                <Field label="Kısa tanım" value={translated(content.profile.eyebrow)} onChange={(value) => updateProfileTranslation("eyebrow", value)} />
                <Field label="Rol" value={translated(content.profile.role)} onChange={(value) => updateProfileTranslation("role", value)} />
                <Field label="Konum" value={translated(content.profile.location)} onChange={(value) => updateProfileTranslation("location", value)} />
                <Field label="E-posta" value={content.profile.email} onChange={(value) => updateProfile("email", value)} />
                <Field label="Uygunluk bilgisi" value={translated(content.profile.availability)} onChange={(value) => updateProfileTranslation("availability", value)} />
                <Field className="full" multiline label="Açıklama" value={translated(content.profile.description)} onChange={(value) => updateProfileTranslation("description", value)} />
              </div></div>
              <div className="admin-card"><h2>Portre fotoğrafı</h2><label className="upload-zone"><ImageUp /><b>Yeni portre seç</b><small>JPG, PNG veya WEBP · en fazla 8 MB</small><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadPhoto(event.target.files?.[0])} /></label></div>
              <div className="admin-card"><h2>Logo ve sekme ikonu</h2><div className="admin-grid">
                <Field label="Logo yazısı" value={content.branding.logoText} onChange={(value) => setContent((current) => ({ ...current, branding: { ...current.branding, logoText: value } }))} />
                <label className="upload-zone admin-field"><ImageUp /><b>Logo görseli yükle</b><small>PNG, JPG veya WEBP · görsel varsa logo yazısının yerine kullanılır</small><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadLogo(event.target.files?.[0])} /></label>
                {content.branding.logoUrl && <div className="admin-logo-preview full"><Image src={content.branding.logoUrl} alt="Yüklenen logo" width={160} height={64} /><button className="admin-button danger" type="button" onClick={() => setContent((current) => ({ ...current, branding: { ...current.branding, logoUrl: "" } }))}>Görsel logoyu kaldır</button></div>}
                <label className="upload-zone admin-field"><ImageUp /><b>Tarayıcı sekme ikonu yükle</b><small>Kare PNG veya WEBP önerilir · en az 128 × 128 piksel</small><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadFavicon(event.target.files?.[0])} /></label>
                {content.branding.faviconUrl && <div className="admin-logo-preview"><Image src={content.branding.faviconUrl} alt="Tarayıcı sekme ikonu" width={56} height={56} /><button className="admin-button danger" type="button" onClick={() => setContent((current) => ({ ...current, branding: { ...current.branding, faviconUrl: "" } }))}>Sekme ikonunu kaldır</button></div>}
              </div></div>
              <div className="admin-card"><h2>Sosyal bağlantılar</h2><div className="admin-grid">
                {(Object.keys(content.socials) as Array<keyof typeof content.socials>).map((key) => <Field key={key} label={key[0].toUpperCase() + key.slice(1)} value={content.socials[key]} onChange={(value) => updateSocial(key, value)} />)}
                <Field className="full" label="YouTube kanal kimliği (UC… ile başlar)" value={content.creator.youtubeChannelId} onChange={(value) => setContent((current) => ({ ...current, creator: { ...current.creator, youtubeChannelId: value.trim() } }))} />
                <p className="admin-help full">Bu kimlik girildiğinde sitedeki içerik kartı kanalındaki en yeni videonun kapağını ve başlığını otomatik gösterir.</p>
              </div></div>
            </>
          )}

          {activeTab === "sections" && <div className="admin-card"><h2>Sayfadaki bölüm başlıkları</h2><div className="admin-grid">
            {(Object.keys(content.sections) as Array<keyof typeof content.sections>).map((key) => <Field key={key} className={key.toLowerCase().includes("description") ? "full" : ""} multiline={key.toLowerCase().includes("description")} label={sectionLabels[key]} value={translated(content.sections[key])} onChange={(value) => setContent((current) => ({ ...current, sections: { ...current.sections, [key]: updateTranslation(current.sections[key], value) } }))} />)}
          </div></div>}

          {activeTab === "labels" && <div className="admin-card"><h2>Menü ve düğme yazıları</h2><p className="admin-help">Üstte seçili olan dil için görünen metinleri düzenleyin.</p><div className="admin-grid">
            {(Object.keys(content.labels) as Array<keyof typeof content.labels>).map((key) => <Field key={key} label={interfaceLabels[key]} value={translated(content.labels[key])} onChange={(value) => setContent((current) => ({ ...current, labels: { ...current.labels, [key]: updateTranslation(current.labels[key], value) } }))} />)}
          </div></div>}

          {activeTab === "experience" && <div className="admin-card"><div className="admin-item-top"><h2>Deneyim kartları</h2><button className="admin-button" type="button" onClick={addExperience}><Plus size={16} /> Kart ekle</button></div><div className="admin-list">
            {content.experiences.map((item, index) => <div className="admin-item" key={item.id}><div className="admin-item-top"><div><h3>{translated(item.title)}</h3><small>{translated(item.organization)}</small></div><div className="admin-item-actions"><button aria-label="Sil" type="button" onClick={() => setContent((current) => ({ ...current, experiences: current.experiences.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={16} /></button></div></div><div className="admin-grid three">
              <label className="admin-field"><span>Tür</span><select value={item.type} onChange={(event) => updateExperience(index, "type", event.target.value)}><option value="education">Eğitim</option><option value="experience">Deneyim</option><option value="certificate">Sertifika</option></select></label>
              <Field label="Dönem" value={translated(item.period)} onChange={(value) => updateExperienceTranslation(index, "period", value)} />
              <Field label="Başlık" value={translated(item.title)} onChange={(value) => updateExperienceTranslation(index, "title", value)} />
              <Field label="Kurum" value={translated(item.organization)} onChange={(value) => updateExperienceTranslation(index, "organization", value)} />
              <Field className="full" multiline label="Açıklama" value={translated(item.description)} onChange={(value) => updateExperienceTranslation(index, "description", value)} />
            </div></div>)}
          </div></div>}

          {activeTab === "projects" && <div className="admin-card"><div className="admin-item-top"><h2>Proje kartları</h2><button className="admin-button" type="button" onClick={addProject}><Plus size={16} /> Proje ekle</button></div><div className="admin-list">
            {content.projects.map((item, index) => <div className="admin-item" key={item.id}><div className="admin-item-top"><div><h3>{item.title}</h3><small>{translated(item.category)}</small></div><div className="admin-item-actions"><button aria-label="Sil" type="button" onClick={() => setContent((current) => ({ ...current, projects: current.projects.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={16} /></button></div></div><div className="admin-grid">
              <Field label="Proje adı" value={item.title} onChange={(value) => updateProject(index, "title", value)} /><Field label="Kategori" value={translated(item.category)} onChange={(value) => updateProjectTranslation(index, "category", value)} />
              <Field label="Teknolojiler" value={item.technologies} onChange={(value) => updateProject(index, "technologies", value)} /><Field label="Proje / oyun bağlantısı" value={item.link} onChange={(value) => updateProject(index, "link", value)} />
              <label className="admin-field"><span>Bağlantı türü</span><select value={item.actionType} onChange={(event) => updateProject(index, "actionType", event.target.value)}><option value="details">Proje detayı / kaynak kod</option><option value="play">Tarayıcıda oyna</option><option value="download">Bilgisayara indir</option><option value="store">Steam / Play Store / mağaza</option></select></label>
              <Field label="Düğme yazısı" value={translated(item.actionLabel)} onChange={(value) => updateProjectTranslation(index, "actionLabel", value)} />
              <Field className="full" multiline label="Açıklama" value={translated(item.description)} onChange={(value) => updateProjectTranslation(index, "description", value)} />
              <label className="upload-zone admin-field full"><ImageUp /><b>Proje görseli yükle</b><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadProjectImage(index, event.target.files?.[0])} />{item.imageUrl && <small>Görsel hazır: {item.imageUrl}</small>}</label>
              <label className="upload-zone admin-field full"><FileUp /><b>İndirilebilir oyun paketi yükle</b><small>Windows, macOS veya Linux build klasörünü önce ZIP yapın · en fazla 95 MB</small><input type="file" accept=".zip,application/zip,application/x-zip-compressed" onChange={(event) => uploadGamePackage(index, event.target.files?.[0])} /></label>
              <p className="admin-help full">Tarayıcıda oynatmak için Unity WebGL build&apos;ini hostinginize klasör halinde yükleyip index.html adresini bağlantı alanına yazın. Steam veya Play Store için mağaza sayfasının adresini kullanın.</p>
            </div></div>)}
          </div></div>}

          {activeTab === "documents" && <><div className="admin-card"><h2>PDF yükle</h2><div className="admin-grid">
            <label className="upload-zone"><FileUp /><b>CV yükle veya değiştir</b><small>PDF · en fazla 15 MB</small><input type="file" accept="application/pdf" onChange={(event) => addDocument("cv", event.target.files?.[0])} /></label>
            <label className="upload-zone"><FileUp /><b>Sertifika ekle</b><small>PDF · en fazla 15 MB</small><input type="file" accept="application/pdf" onChange={(event) => addDocument("certificate", event.target.files?.[0])} /></label>
          </div></div><div className="admin-card"><h2>Yayınlanan belgeler</h2><div className="admin-list">
            {content.documents.map((item, index) => <div className="admin-item" key={item.id}><div className="admin-item-top"><div><h3>{translated(item.title)}</h3><small>{item.type === "cv" ? "CV" : "Sertifika"} · {item.fileName}</small></div><div className="admin-item-actions"><a className="admin-button" href={item.fileUrl} target="_blank"><Eye size={16} /></a><button aria-label="Sil" type="button" onClick={() => setContent((current) => ({ ...current, documents: current.documents.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={16} /></button></div></div><div className="admin-grid">
              <Field label="Belge başlığı" value={translated(item.title)} onChange={(value) => setContent((current) => ({ ...current, documents: current.documents.map((doc, itemIndex) => itemIndex === index ? { ...doc, title: updateTranslation(doc.title, value) } : doc) }))} />
              <Field label="Tarih / dönem" value={item.issuedAt} onChange={(value) => setContent((current) => ({ ...current, documents: current.documents.map((doc, itemIndex) => itemIndex === index ? { ...doc, issuedAt: value } : doc) }))} />
            </div></div>)}
            {!content.documents.length && <p className="empty-note">Henüz belge eklenmedi.</p>}
          </div></div></>}
        </section>
      </div>
      {notice && <output className="admin-notice">{notice}</output>}
    </main>
  );
}

function Field({ label, value, onChange, multiline = false, className = "" }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; className?: string }) {
  return <label className={`admin-field ${className}`}><span>{label}</span>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}
