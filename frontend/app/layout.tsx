import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { SupabaseProvider } from "@/lib/supabase/provider";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AEON Video - AI-Powered Video Generation",
  description: "Create stunning videos with AI-powered generation, editing, and effects",
  keywords: "AI video, video generation, video editing, artificial intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-[#0a0a23] text-white antialiased`}>
          <SupabaseProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
                <Navbar />
                <main className="pt-16">
                  {children}
                </main>
              </div>
              <Toaster />
            </ThemeProvider>
          </SupabaseProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
