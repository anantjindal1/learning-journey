import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Use font variables from Next's font optimization so typography stays consistent across the app.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anant Jindal — Portfolio & Blog",
  description:
    "Full Stack developer rediscovering the craft with AI tools. Portfolio, projects, and writing by Anant Jindal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the dark theme and layout shell at the root so all routes share a consistent frame. */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-slate-50 antialiased`}
      >
        <div className="flex min-h-screen flex-col bg-slate-950">
          <Navbar />
          <main className="flex-1">
            {/* Render route content inside a flex-1 main so the footer stays at the bottom. */}
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
