import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "参加表明スイッチ",
  description: "ワンクリックで参加・不参加・保留を表明できるアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <a href="/" className="text-lg font-bold text-gray-900">
              参加表明スイッチ
            </a>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
        </main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
