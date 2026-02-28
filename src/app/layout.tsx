import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '自动证件照制作',
  description: '上传照片，自动去背景，一键生成红/蓝/白底证件照',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
