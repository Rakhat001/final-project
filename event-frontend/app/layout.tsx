import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/antd-registry";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { AuthProvider } from "@/context/AuthContext";
import { ConfigProvider } from "antd";
import theme from "@/theme/themeConfig";
import NextTopLoader from "nextjs-toploader";
import Navbar from "@/components/Navbar";
import GlobalSubscriptions from "@/components/GlobalSubscriptions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event App",
  description: "Manage your events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <StyledComponentsRegistry>
          <ConfigProvider theme={theme}>
            <NextTopLoader color="#4f46e5" showSpinner={false} />
            <ApolloWrapper>
              <AuthProvider>
                <GlobalSubscriptions />
                
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                  </main>
                  <footer className="text-center py-6 bg-muted/50 text-muted-foreground mt-auto border-t border-border">
                    <p>Event App ©{new Date().getFullYear()} — Crafted for Experiences</p>
                  </footer>
                </div>
              </AuthProvider>
            </ApolloWrapper>
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
