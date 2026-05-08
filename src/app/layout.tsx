import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "製品調達支援デモ",
  description: "材料相場、過去実績、類似案件を確認する調達支援デモ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
