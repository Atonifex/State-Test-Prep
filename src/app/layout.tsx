import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { LoginButton } from "@/components/LoginButton";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "State Test Prep",
  description: "Standards-based practice for districts",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          <AssessmentProvider>
            <header className="w-full border-b bg-white">
              <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                <Link href="/" className="font-semibold">State Test Prep</Link>
                <nav className="flex items-center gap-4 text-sm">
                  <Link href="/select" className="hover:underline">Select</Link>
                  <Link href="/standards" className="hover:underline">Standards</Link>
                </nav>
                <LoginButton />
              </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          </AssessmentProvider>
        </UserProvider>
      </body>
    </html>
  );
}
