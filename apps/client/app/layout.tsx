import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synora - Real-time conversations, built for modern communication",
  description:
    "Instant messaging, online presence, typing indicators, media sharing, and seamless communication powered by WebSockets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}