"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileDown,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import type { PortfolioContent } from "@/lib/content";
import type { Locale, LocalizedText } from "@/lib/content";
import Image from "next/image";
import Link from "next/link";
import type { LatestVideo } from "@/lib/youtube";
import { FlowButton } from "@/components/ui/flow-button";
import { SocialTooltip } from "@/components/ui/social-media";

const socialAssets = {
  github: "/logos/github.png",
  linkedin: "/logos/linkedin.webp",
  instagram: "/logos/instagram.webp",
  youtube: "/logos/youtube.webp",
};

const socialLabels = {
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
};

const socialColors = {
  github: "#24292f",
  linkedin: "#0a66c2",
  instagram: "#e4405f",
  youtube: "#ff0033",
};

const interfaceCopy = {
  tr: {
    nav: { hakkimda: "Hakkımda", deneyim: "Deneyim", projeler: "Projeler", icerik: "İçerik", iletisim: "İletişim" },
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    menuHint: "Menüden bir bölüme geçebilir ya da ekranı kaydırarak keşfedebilirsin.",
    greeting: "Merhaba, ben",
    creatorBadge: "Üreten öğrenci",
    openCv: "CV'yi aç",
    cvSoon: "CV yakında",
    contactMe: "Bana ulaş",
    documentKicker: "Belge arşivi",
    documentTitle: "CV & sertifikalar",
    noDocuments: "Belgeler yönetim panelinden eklenebilir.",
    instagramText: "Kısa notlar & geliştirme günlükleri",
    youtubeText: "Projeler, anlatımlar & kamera arkası",
    latestVideo: "En yeni YouTube videosu",
    previousVideo: "Bir önceki YouTube videosu",
    youtubeCta: "En yeni videoları YouTube'da izle",
    youtubeChannel: "YouTube kanalına git",
    watchOnYouTube: "YouTube'da izle",
    admin: "İçerik yönetimi",
    backToTop: "Yukarı dön ↑",
    portraitAlt: "portresi",
    photoPlaceholder: "Fotoğrafını ekle",
    languageLabel: "Dil seçimi",
  },
  en: {
    nav: { hakkimda: "About", deneyim: "Experience", projeler: "Projects", icerik: "Content", iletisim: "Contact" },
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menuHint: "Choose a section from the menu or scroll to explore.",
    greeting: "Hi, I'm",
    creatorBadge: "Student creator",
    openCv: "Open résumé",
    cvSoon: "Résumé coming soon",
    contactMe: "Contact me",
    documentKicker: "Document archive",
    documentTitle: "Résumé & certificates",
    noDocuments: "Documents can be added from the admin panel.",
    instagramText: "Short notes & development logs",
    youtubeText: "Projects, tutorials & behind the scenes",
    latestVideo: "Latest YouTube video",
    previousVideo: "Previous YouTube video",
    youtubeCta: "Watch the latest videos on YouTube",
    youtubeChannel: "Visit YouTube channel",
    watchOnYouTube: "Watch on YouTube",
    admin: "Content management",
    backToTop: "Back to top ↑",
    portraitAlt: "portrait",
    photoPlaceholder: "Add your photo",
    languageLabel: "Language selection",
  },
} as const;

const navigationIds = ["hakkimda", "deneyim", "projeler", "icerik", "iletisim"] as const;
type NavigationId = (typeof navigationIds)[number];

function externalLink(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function PortfolioClient({ content }: { content: PortfolioContent }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>("tr");
  const [activeSection, setActiveSection] = useState<NavigationId>("hakkimda");
  const [latestVideos, setLatestVideos] = useState<LatestVideo[]>([]);
  const { profile, sections, socials, experiences, projects, documents, branding } = content;
  const ui = interfaceCopy[locale];
  const localized = (value: LocalizedText) => value[locale] || value.tr;
  const cv = documents.find((document) => document.type === "cv");
  const certificates = documents.filter((document) => document.type === "certificate");
  const socialItems = useMemo(() => (Object.keys(socialLabels) as Array<keyof typeof socialLabels>)
    .filter((key) => Boolean(socials[key]))
    .map((key) => ({ href: socials[key], ariaLabel: socialLabels[key], tooltip: socialLabels[key], svgUrl: socialAssets[key], color: socialColors[key] })), [socials]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("portfolio-language");
    const localeFrame = savedLocale === "tr" || savedLocale === "en"
      ? window.requestAnimationFrame(() => setLocale(savedLocale))
      : undefined;

    let scrollFrame = 0;
    const updateActiveSection = () => {
      scrollFrame = 0;
      const activationLine = Math.min(window.innerHeight * 0.32, 260);
      let nextSection: NavigationId = navigationIds[0];

      for (const id of navigationIds) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= activationLine) nextSection = id;
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        nextSection = navigationIds[navigationIds.length - 1];
      }
      setActiveSection((current) => current === nextSection ? current : nextSection);
    };
    const scheduleSectionUpdate = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateActiveSection);
    };

    window.addEventListener("scroll", scheduleSectionUpdate, { passive: true });
    window.addEventListener("resize", scheduleSectionUpdate);
    scrollFrame = window.requestAnimationFrame(updateActiveSection);
    return () => {
      window.removeEventListener("scroll", scheduleSectionUpdate);
      window.removeEventListener("resize", scheduleSectionUpdate);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (localeFrame !== undefined) window.cancelAnimationFrame(localeFrame);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const channelId = content.creator.youtubeChannelId.trim();
    if (!/^UC[\w-]{20,}$/.test(channelId)) return;

    const controller = new AbortController();
    fetch(`/api/youtube?channelId=${encodeURIComponent(channelId)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("YouTube feed unavailable")))
      .then((data: unknown) => {
        if (Array.isArray(data)) setLatestVideos(data.slice(0, 2) as LatestVideo[]);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) return;
      });

    return () => controller.abort();
  }, [content.creator.youtubeChannelId]);

  function chooseLanguage(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem("portfolio-language", nextLocale);
  }

  const closeMenu = () => setMenuOpen(false);

  const renderLogo = () => branding.logoUrl ? (
    <Image className="brand-image" src={branding.logoUrl} alt={`${profile.name} logo`} width={132} height={42} priority />
  ) : (
    <span className="brand-text">{branding.logoText.replace(/\.$/, "")}<i>{branding.logoText.endsWith(".") ? "." : ""}</i></span>
  );

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#anasayfa" aria-label={locale === "tr" ? "Ana sayfa" : "Home"}>{renderLogo()}</a>
        <nav className="desktop-nav" aria-label="Ana menü">
          {navigationIds.map((id) => <a key={id} className={activeSection === id ? "is-active" : ""} href={`#${id}`} onClick={() => setActiveSection(id)}>{ui.nav[id]}</a>)}
        </nav>
        <div className="header-tools">
          <div className="language-switch" aria-label={ui.languageLabel} role="group">
            <span className={`language-switch-highlight ${locale === "en" ? "is-en" : ""}`} />
            <button type="button" className={locale === "tr" ? "active" : ""} onClick={() => chooseLanguage("tr")} aria-pressed={locale === "tr"}>TR</button>
            <button type="button" className={locale === "en" ? "active" : ""} onClick={() => chooseLanguage("en")} aria-pressed={locale === "en"}>EN</button>
          </div>
          <button className="menu-button" type="button" aria-label={ui.openMenu} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={22} /></button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-top">
          <span className="brand">{renderLogo()}</span>
          <button type="button" aria-label={ui.closeMenu} onClick={closeMenu}><X size={26} /></button>
        </div>
        <nav aria-label="Mobil menü">
          {navigationIds.map((id, index) => (
            <a key={id} href={`#${id}`} className={activeSection === id ? "is-active" : ""} onClick={() => { setActiveSection(id); closeMenu(); }}><span>{String(index + 1).padStart(2, "0")}</span>{ui.nav[id]}</a>
          ))}
        </nav>
        <p>{ui.menuHint}</p>
      </div>

      <section className="hero section-pad" id="anasayfa">
        <div className="hero-portrait-wrap">
          <div className="portrait-orbit orbit-one" />
          <div className="portrait-orbit orbit-two" />
          <div className="hero-portrait">
            {profile.photoUrl ? (
              <Image src={profile.photoUrl} alt={`${profile.name} ${ui.portraitAlt}`} fill sizes="(max-width: 760px) 78vw, 410px" priority />
            ) : (
              <div className="portrait-placeholder" aria-label="Yönetim panelinden portre yüklenebilir">
                <span>{profile.name.slice(0, 1)}</span><small>{ui.photoPlaceholder}</small>
              </div>
            )}
          </div>
          <div className="portrait-badge"><Sparkles size={15} /> {ui.creatorBadge}</div>
        </div>

        <div className="hero-copy" id="hakkimda">
          <p className="eyebrow">{localized(profile.eyebrow)}</p>
          <h1>{ui.greeting} <em>{profile.name}</em>.</h1>
          <p className="role-line">{localized(profile.role)}</p>
          <p className="hero-description">{localized(profile.description)}</p>
          <div className="social-row" aria-label={locale === "tr" ? "Sosyal medya bağlantıları" : "Social media links"}><SocialTooltip items={socialItems} /></div>
          <div className="hero-actions">
            {cv ? (
              <FlowButton className="flow-primary" text={ui.openCv} href={cv.fileUrl} target="_blank" rel="noreferrer" />
            ) : (
              <FlowButton className="flow-primary" text={ui.cvSoon} href="#belgeler" />
            )}
            <FlowButton text={ui.contactMe} href="#iletisim" />
          </div>
          <div className="hero-meta">
            <span><MapPin size={15} /> {localized(profile.location)}</span>
            <span className="available-dot">{localized(profile.availability)}</span>
          </div>
        </div>
      </section>

      <section className="section-pad content-section" id="deneyim">
        <SectionHeading kicker={localized(sections.experienceKicker)} title={localized(sections.experienceTitle)} description={localized(sections.experienceDescription)} />
        <div className="experience-grid">
          {experiences.map((item, index) => (
            <article className="experience-card" key={item.id}>
              <div className="card-number">0{index + 1}</div>
              <div className={`experience-icon type-${item.type}`}>
                {item.type === "education" ? <GraduationCap /> : item.type === "experience" ? <BriefcaseBusiness /> : <FileDown />}
              </div>
              <p className="experience-period">{localized(item.period)}</p>
              <h3>{localized(item.title)}</h3><h4>{localized(item.organization)}</h4><p>{localized(item.description)}</p>
            </article>
          ))}
        </div>
        <div className="document-strip" id="belgeler">
          <div><p className="eyebrow">{ui.documentKicker}</p><h3>{ui.documentTitle}</h3></div>
          <div className="document-links">
            {cv && <a href={cv.fileUrl} target="_blank" rel="noreferrer"><FileDown size={16} /> {localized(cv.title)}</a>}
            {certificates.map((document) => (
              <a key={document.id} href={document.fileUrl} target="_blank" rel="noreferrer"><FileDown size={16} /> {localized(document.title)}<small>{document.issuedAt}</small></a>
            ))}
            {!documents.length && <span className="empty-note">{ui.noDocuments}</span>}
          </div>
        </div>
      </section>

      <section className="projects-section section-pad" id="projeler">
        <SectionHeading kicker={localized(sections.projectsKicker)} title={localized(sections.projectsTitle)} description={localized(sections.projectsDescription)} />
        <div className="project-stack">
          {projects.map((project, index) => (
            <article className="project-card" style={{ "--stack-index": index } as React.CSSProperties} key={project.id}>
              <div className="project-copy">
                <div className="project-count">{String(index + 1).padStart(2, "0")}</div>
                <p className="project-category">{localized(project.category)}</p><h3>{project.title}</h3><p>{localized(project.description)}</p>
                <div className="project-tech">{project.technologies}</div>
                <a
                  href={project.link || "#iletisim"}
                  target={externalLink(project.link) ? "_blank" : undefined}
                  rel="noreferrer"
                  download={project.actionType === "download" && !externalLink(project.link) ? "" : undefined}
                >
                  {localized(project.actionLabel)} {project.actionType === "play" ? <Play size={17} /> : project.actionType === "download" ? <FileDown size={17} /> : <ArrowUpRight size={17} />}
                </a>
              </div>
              <div className={`project-visual project-visual-${index % 4}`}>
                {project.imageUrl ? <Image src={project.imageUrl} alt={`${project.title} proje görseli`} fill sizes="(max-width: 760px) calc(100vw - 76px), 560px" /> : (
                  <div className="mock-window"><div className="mock-bar"><i /><i /><i /></div><div className="mock-content"><span /><strong>{project.title}</strong><span /><span /></div></div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="creator-section section-pad" id="icerik">
        <div className="creator-copy">
          <SectionHeading kicker={localized(sections.contentKicker)} title={localized(sections.contentTitle)} description={localized(sections.contentDescription)} />
          <div className="creator-links">
            <a href={socials.instagram} target="_blank" rel="noreferrer"><Image src={socialAssets.instagram} alt="" width={38} height={38} /><span><b>Instagram</b><small>{ui.instagramText}</small></span><ArrowUpRight /></a>
            <a href={socials.youtube} target="_blank" rel="noreferrer"><Image src={socialAssets.youtube} alt="" width={38} height={38} /><span><b>YouTube</b><small>{ui.youtubeText}</small></span><Play /></a>
          </div>
        </div>
        <div className="creator-stage">
          {latestVideos[1] && (
            <a
              className="video-card video-card-back has-thumbnail"
              href={latestVideos[1].url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${ui.watchOnYouTube}: ${latestVideos[1].title}`}
              style={{ "--video-thumbnail": `url(${latestVideos[1].thumbnailUrl})` } as React.CSSProperties}
            ><Play /><strong>{latestVideos[1].title}</strong><small>{ui.previousVideo}</small></a>
          )}
          {latestVideos[0] ? (
            <a
              className="video-card video-card-front has-thumbnail"
              href={latestVideos[0].url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${ui.watchOnYouTube}: ${latestVideos[0].title}`}
              style={{ "--video-thumbnail": `url(${latestVideos[0].thumbnailUrl})` } as React.CSSProperties}
            ><Play /><strong>{latestVideos[0].title}</strong><small>{ui.latestVideo}</small></a>
          ) : (
            <a className="video-card video-card-front" href={socials.youtube} target="_blank" rel="noreferrer"><Play /><strong>{ui.youtubeCta}</strong><small>{ui.youtubeChannel}</small></a>
          )}
        </div>
      </section>

      <section className="contact-section section-pad" id="iletisim">
        <p className="eyebrow">{localized(sections.contactKicker)}</p><h2>{localized(sections.contactTitle)}</h2><p>{localized(sections.contactDescription)}</p>
        <a className="contact-mail" href={`mailto:${profile.email}`}><Mail /> {profile.email}</a>
        <div className="contact-bottom"><span>© {new Date().getFullYear()} {profile.name}</span><Link href="/admin">{ui.admin}</Link><a href="#anasayfa">{ui.backToTop}</a></div>
      </section>
    </main>
  );
}

function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return <div className="section-heading"><p className="eyebrow">{kicker}</p><h2>{title}</h2><p>{description}</p></div>;
}
