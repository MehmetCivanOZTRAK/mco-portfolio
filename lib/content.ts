import { z } from "zod";

const urlValue = z.string().max(600);

const legacyEnglishTranslations: Record<string, string> = {
  "Bilgisayar mühendisliği öğrencisi": "Computer engineering student",
  "Oyun geliştirici & dijital içerik üreticisi": "Game developer & digital content creator",
  "Kod, oyun mekaniği ve sade dijital deneyimler üretiyorum. Üniversitede öğrendiklerimi gerçek projelerle birleştiriyor; geliştirme sürecimi Instagram ve YouTube'da paylaşarak teknoloji meraklılarıyla buluşturuyorum.": "I build code, game mechanics, and focused digital experiences. I turn what I learn at university into real projects and share the development process on Instagram and YouTube.",
  "Balıkesir, Türkiye": "Balıkesir, Türkiye",
  "Yeni projelere ve staj fırsatlarına açık": "Open to internships and new projects",
  "Yolculuk": "Journey",
  "Eğitim & deneyim": "Education & experience",
  "Akademik gelişimim, gerçek üretim deneyimim ve mesleki eğitimlerim aynı yerde.": "My academic journey, hands-on production experience, and professional training in one place.",
  "Seçilmiş çalışmalar": "Selected work",
  "Fikirden çalışan ürüne.": "From idea to working product.",
  "Her kart, farklı bir problemi nasıl düşündüğümü ve çözüme dönüştürdüğümü anlatıyor.": "Each project shows how I approach a different problem and turn it into a working solution.",
  "Üretirken paylaş": "Build in public",
  "Kodun kamera arkası.": "Behind the code.",
  "Oyun geliştirme, yazılım ve öğrenci hayatına dair kısa içerikleri Instagram ve YouTube'da paylaşıyorum.": "I share short videos about game development, software, and student life on Instagram and YouTube.",
  "İletişim": "Contact",
  "Birlikte bir şey üretelim.": "Let's build something together.",
  "Bir proje fikrin, staj fırsatın ya da yalnızca merhaba demek için bir mesajın varsa bana ulaşabilirsin.": "Have a project idea, an internship opportunity, or just want to say hello? Feel free to reach out.",
  "2023 — devam ediyor": "2023 — present",
  "Bilgisayar Mühendisliği, 3. sınıf": "Computer Engineering, 3rd year",
  "Bandırma Onyedi Eylül Üniversitesi": "Bandırma Onyedi Eylül University",
  "Algoritmalar, yazılım mühendisliği, veri yapıları ve oyun geliştirme odağında lisans eğitimi.": "Undergraduate studies focused on algorithms, software engineering, data structures, and game development.",
  "Yaz 2026": "Summer 2026",
  "Oyun Geliştirme Stajyeri": "Game Development Intern",
  "Unity tabanlı oyun mekanikleri, prototipleme ve ekip içi üretim süreçlerinde uygulamalı deneyim.": "Hands-on experience with Unity game mechanics, prototyping, and collaborative production workflows.",
  "2024 — 2026": "2024 — 2026",
  "Mesleki Eğitimler & Sertifikalar": "Professional Training & Certificates",
  "Çevrim içi programlar": "Online programs",
  "Web geliştirme, C#, Unity ve yazılım mimarisi eğitimleri. Belgeler aşağıdaki arşivden açılabilir.": "Training in web development, C#, Unity, and software architecture. Documents are available in the archive below.",
  "Unity / Mobil oyun": "Unity / Mobile game",
  "Tek dokunuşla kontrol edilen, hız ve refleks odaklı arcade oyun prototipi.": "A one-touch arcade game prototype built around speed and reflexes.",
  "Web uygulaması": "Web application",
  "Öğrenci topluluklarını, etkinlikleri ve duyuruları tek akışta birleştiren kampüs platformu.": "A campus platform that brings student clubs, events, and announcements into one feed.",
  "Masaüstü uygulama": "Desktop application",
  "Küçük ekipler için stok hareketlerini izleyen ve kritik seviyeleri bildiren yönetim aracı.": "An inventory tool for small teams that tracks stock movement and warns about critical levels.",
  "Üretkenlik aracı": "Productivity tool",
  "Oyun fikirlerini, mekanikleri ve görevleri kartlarla düzenleyen hızlı not deneyimi.": "A quick note-taking experience for organizing game ideas, mechanics, and tasks with cards.",
  "Projeyi incele": "View project",
  "2026 - devam ediyor": "2026 - present",
  "Deneyiminizi açıklayın.": "Describe your experience.",
};

const legacyTurkishTranslations: Record<string, string> = {
  ...Object.fromEntries(Object.entries(legacyEnglishTranslations).map(([tr, en]) => [en, tr])),
  "I create code, game mechanics, and simple digital experiences. I combine what I learned at university with real-world projects and connect with tech enthusiasts by sharing my development process on Instagram and YouTube.": "Kod, oyun mekaniği ve sade dijital deneyimler üretiyorum. Üniversitede öğrendiklerimi gerçek projelerle birleştiriyor; geliştirme sürecimi Instagram ve YouTube'da paylaşarak teknoloji meraklılarıyla buluşturuyorum.",
  "Open to job and internship opportunities": "İş ve staj fırsatlarına açık",
};

export const localeSchema = z.enum(["tr", "en"]);
export type Locale = z.infer<typeof localeSchema>;

function localizedText(max: number) {
  return z.preprocess(
    (value) => {
      if (typeof value === "string") {
        return legacyTurkishTranslations[value]
          ? { tr: legacyTurkishTranslations[value], en: value }
          : { tr: value, en: legacyEnglishTranslations[value] ?? value };
      }
      if (value && typeof value === "object" && "tr" in value && "en" in value) {
        const pair = value as { tr?: unknown; en?: unknown };
        if (typeof pair.tr === "string" && pair.tr === pair.en) {
          if (legacyTurkishTranslations[pair.tr]) return { tr: legacyTurkishTranslations[pair.tr], en: pair.tr };
          if (legacyEnglishTranslations[pair.tr]) return { tr: pair.tr, en: legacyEnglishTranslations[pair.tr] };
        }
      }
      return value;
    },
    z.object({
      tr: z.string().max(max),
      en: z.string().max(max),
    }),
  );
}

export type LocalizedText = z.infer<ReturnType<typeof localizedText>>;

export const documentSchema = z.object({
  id: z.string().min(1).max(120),
  title: localizedText(140),
  type: z.enum(["cv", "certificate"]),
  fileUrl: z.string().max(900),
  fileName: z.string().max(240),
  issuedAt: z.string().max(80),
});

export const projectSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().min(1).max(140),
  category: localizedText(100),
  description: localizedText(900),
  technologies: z.string().max(300),
  link: urlValue,
  actionType: z.enum(["details", "play", "download", "store"]).default("details"),
  actionLabel: localizedText(60).default({ tr: "Projeyi incele", en: "View project" }),
  imageUrl: z.string().max(900),
});

export const experienceSchema = z.object({
  id: z.string().min(1).max(120),
  type: z.enum(["education", "experience", "certificate"]),
  period: localizedText(80),
  title: localizedText(160),
  organization: localizedText(160),
  description: localizedText(900),
});

export const portfolioContentSchema = z.object({
  profile: z.object({
    name: z.preprocess((value) => value === "Civan Bunos" ? "Mehmet Civan Öztrak" : value, z.string().min(1).max(100)),
    eyebrow: localizedText(120),
    role: localizedText(180),
    description: localizedText(1400),
    location: localizedText(140),
    availability: localizedText(160),
    email: z.string().max(220),
    photoUrl: z.string().max(900),
  }),
  socials: z.object({
    github: urlValue,
    linkedin: urlValue,
    instagram: urlValue,
    youtube: urlValue,
  }),
  creator: z.object({
    youtubeChannelId: z.string().max(80),
  }).default({ youtubeChannelId: "" }),
  branding: z.object({
    logoText: z.string().min(1).max(24),
    logoUrl: z.string().max(900),
  }).default({ logoText: "MCO.", logoUrl: "" }),
  sections: z.object({
    experienceKicker: localizedText(100),
    experienceTitle: localizedText(180),
    experienceDescription: localizedText(500),
    projectsKicker: localizedText(100),
    projectsTitle: localizedText(180),
    projectsDescription: localizedText(500),
    contentKicker: localizedText(100),
    contentTitle: localizedText(180),
    contentDescription: localizedText(500),
    contactKicker: localizedText(100),
    contactTitle: localizedText(180),
    contactDescription: localizedText(700),
  }),
  experiences: z.array(experienceSchema).max(40),
  projects: z.array(projectSchema).max(40),
  documents: z.array(documentSchema).max(60),
});

export type PortfolioContent = z.infer<typeof portfolioContentSchema>;

export const defaultContent: PortfolioContent = {
  profile: {
    name: "Mehmet Civan Öztrak",
    eyebrow: { tr: "Bilgisayar mühendisliği öğrencisi", en: "Computer engineering student" },
    role: { tr: "Oyun geliştirici & dijital içerik üreticisi", en: "Game developer & digital content creator" },
    description: {
      tr: "Kod, oyun mekaniği ve sade dijital deneyimler üretiyorum. Üniversitede öğrendiklerimi gerçek projelerle birleştiriyor; geliştirme sürecimi Instagram ve YouTube'da paylaşarak teknoloji meraklılarıyla buluşturuyorum.",
      en: "I build code, game mechanics, and focused digital experiences. I turn what I learn at university into real projects and share the development process on Instagram and YouTube.",
    },
    location: { tr: "Balıkesir, Türkiye", en: "Balıkesir, Türkiye" },
    availability: { tr: "Yeni projelere ve staj fırsatlarına açık", en: "Open to internships and new projects" },
    email: "civan@example.com",
    photoUrl: "",
  },
  socials: {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
  },
  creator: {
    youtubeChannelId: "",
  },
  branding: {
    logoText: "MCO.",
    logoUrl: "",
  },
  sections: {
    experienceKicker: { tr: "Yolculuk", en: "Journey" },
    experienceTitle: { tr: "Eğitim & deneyim", en: "Education & experience" },
    experienceDescription: { tr: "Akademik gelişimim, gerçek üretim deneyimim ve mesleki eğitimlerim aynı yerde.", en: "My academic journey, hands-on production experience, and professional training in one place." },
    projectsKicker: { tr: "Seçilmiş çalışmalar", en: "Selected work" },
    projectsTitle: { tr: "Fikirden çalışan ürüne.", en: "From idea to working product." },
    projectsDescription: { tr: "Her kart, farklı bir problemi nasıl düşündüğümü ve çözüme dönüştürdüğümü anlatıyor.", en: "Each project shows how I approach a different problem and turn it into a working solution." },
    contentKicker: { tr: "Üretirken paylaş", en: "Build in public" },
    contentTitle: { tr: "Kodun kamera arkası.", en: "Behind the code." },
    contentDescription: { tr: "Oyun geliştirme, yazılım ve öğrenci hayatına dair kısa içerikleri Instagram ve YouTube'da paylaşıyorum.", en: "I share short videos about game development, software, and student life on Instagram and YouTube." },
    contactKicker: { tr: "İletişim", en: "Contact" },
    contactTitle: { tr: "Birlikte bir şey üretelim.", en: "Let's build something together." },
    contactDescription: { tr: "Bir proje fikrin, staj fırsatın ya da yalnızca merhaba demek için bir mesajın varsa bana ulaşabilirsin.", en: "Have a project idea, an internship opportunity, or just want to say hello? Feel free to reach out." },
  },
  experiences: [
    {
      id: "bandirma-university",
      type: "education",
      period: { tr: "2023 — devam ediyor", en: "2023 — present" },
      title: { tr: "Bilgisayar Mühendisliği, 3. sınıf", en: "Computer Engineering, 3rd year" },
      organization: { tr: "Bandırma Onyedi Eylül Üniversitesi", en: "Bandırma Onyedi Eylül University" },
      description: { tr: "Algoritmalar, yazılım mühendisliği, veri yapıları ve oyun geliştirme odağında lisans eğitimi.", en: "Undergraduate studies focused on algorithms, software engineering, data structures, and game development." },
    },
    {
      id: "kiki-games",
      type: "experience",
      period: { tr: "Yaz 2026", en: "Summer 2026" },
      title: { tr: "Oyun Geliştirme Stajyeri", en: "Game Development Intern" },
      organization: { tr: "Kiki Games", en: "Kiki Games" },
      description: { tr: "Unity tabanlı oyun mekanikleri, prototipleme ve ekip içi üretim süreçlerinde uygulamalı deneyim.", en: "Hands-on experience with Unity game mechanics, prototyping, and collaborative production workflows." },
    },
    {
      id: "technical-training",
      type: "certificate",
      period: { tr: "2024 — 2026", en: "2024 — 2026" },
      title: { tr: "Mesleki Eğitimler & Sertifikalar", en: "Professional Training & Certificates" },
      organization: { tr: "Çevrim içi programlar", en: "Online programs" },
      description: { tr: "Web geliştirme, C#, Unity ve yazılım mimarisi eğitimleri. Belgeler aşağıdaki arşivden açılabilir.", en: "Training in web development, C#, Unity, and software architecture. Documents are available in the archive below." },
    },
  ],
  projects: [
    {
      id: "neon-drift",
      title: "Neon Drift",
      category: { tr: "Unity / Mobil oyun", en: "Unity / Mobile game" },
      description: { tr: "Tek dokunuşla kontrol edilen, hız ve refleks odaklı arcade oyun prototipi.", en: "A one-touch arcade game prototype built around speed and reflexes." },
      technologies: "Unity · C# · Mobile",
      link: "#iletisim",
      actionType: "details",
      actionLabel: { tr: "Projeyi incele", en: "View project" },
      imageUrl: "",
    },
    {
      id: "campus-hub",
      title: "Campus Hub",
      category: { tr: "Web uygulaması", en: "Web application" },
      description: { tr: "Öğrenci topluluklarını, etkinlikleri ve duyuruları tek akışta birleştiren kampüs platformu.", en: "A campus platform that brings student clubs, events, and announcements into one feed." },
      technologies: "React · TypeScript · REST API",
      link: "#iletisim",
      actionType: "details",
      actionLabel: { tr: "Projeyi incele", en: "View project" },
      imageUrl: "",
    },
    {
      id: "smart-inventory",
      title: "Smart Inventory",
      category: { tr: "Masaüstü uygulama", en: "Desktop application" },
      description: { tr: "Küçük ekipler için stok hareketlerini izleyen ve kritik seviyeleri bildiren yönetim aracı.", en: "An inventory tool for small teams that tracks stock movement and warns about critical levels." },
      technologies: "C# · .NET · SQLite",
      link: "#iletisim",
      actionType: "details",
      actionLabel: { tr: "Projeyi incele", en: "View project" },
      imageUrl: "",
    },
    {
      id: "pixel-notes",
      title: "Pixel Notes",
      category: { tr: "Üretkenlik aracı", en: "Productivity tool" },
      description: { tr: "Oyun fikirlerini, mekanikleri ve görevleri kartlarla düzenleyen hızlı not deneyimi.", en: "A quick note-taking experience for organizing game ideas, mechanics, and tasks with cards." },
      technologies: "Next.js · D1 · Cloudflare",
      link: "#iletisim",
      actionType: "details",
      actionLabel: { tr: "Projeyi incele", en: "View project" },
      imageUrl: "",
    },
  ],
  documents: [],
};
