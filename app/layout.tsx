import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "人生大盘 | Life Market",
  description: "查看你的生命 K 线与市值报告",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
