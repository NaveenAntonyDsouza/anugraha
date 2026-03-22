import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/shared/providers";
import { SkipNav } from "@/components/shared/skip-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://anugrahamatrimony.com"),
  title: {
    template: "%s | Anugraha Matrimony",
    default: "Anugraha Matrimony — Find Your Perfect Life Partner",
  },
  description:
    "Karnataka's most trusted matrimony portal for all religions and communities. Join thousands of members and find your perfect life partner today.",
  keywords: [
    "matrimony",
    "Karnataka matrimony",
    "Kannadiga matrimony",
    "Hindu matrimony",
    "Muslim matrimony",
    "Christian matrimony",
    "Jain matrimony",
    "Anugraha matrimony",
  ],
  openGraph: {
    siteName: "Anugraha Matrimony",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SkipNav />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
