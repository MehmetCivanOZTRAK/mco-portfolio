import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mehmet Civan Öztrak | Game Developer & Computer Engineering",
  description: "Mehmet Civan Öztrak'ın oyun geliştirme, yazılım ve içerik üretimi portfolyosu. Game development, software, and content creation portfolio.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
