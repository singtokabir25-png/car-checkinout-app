import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vehicle Check-in / Check-out",
  description: "Digital vehicle inspection, sign-off, and sharing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
