import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Fable",
  description:
    "People management for organizations, committees, communities, and student teams.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {user ? (
          <div className="flex min-h-screen">
            <Sidebar user={user} />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header user={user} />
              <main className="flex-1 px-8 py-8">
                <div className="mx-auto w-full max-w-6xl">{children}</div>
              </main>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
