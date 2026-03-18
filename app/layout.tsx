import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Media Quote Generator",
  description: "Bulk process images with PNG overlays for Instagram Story and Post formats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-neutral-100 text-neutral-900">{children}</body>
    </html>
  );
}

