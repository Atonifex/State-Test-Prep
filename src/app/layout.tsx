import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { LoginButton } from "@/components/LoginButton";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans`}>
        <UserProvider>
          <AssessmentProvider>
            <div className="min-h-screen bg-gray-50">
              <header className="bg-white border-b px-4 py-3">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-semibold text-blue-600">
                      State Test Prep
                    </Link>
                    <nav className="flex gap-3 text-sm">
                      <Link href="/select" className="text-gray-600 hover:text-gray-900">Select</Link>
                      <Link href="/standards" className="text-gray-600 hover:text-gray-900">Standards</Link>
                    </nav>
                  </div>
                  <LoginButton />
                </div>
              </header>
              <main className="max-w-6xl mx-auto px-4 py-6">
                {children}
              </main>
            </div>
          </AssessmentProvider>
        </UserProvider>
      </body>
    </html>
  );
}
