import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoLens — Evidence-Backed Bug Diagnosis & Repository Intelligence",
  description: "Investigate software bugs, pinpoint root causes with test failure correlation, and inspect repository health with Apple-grade precision.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-[#f5f5f7]">
        {children}
      </body>
    </html>
  );
}
