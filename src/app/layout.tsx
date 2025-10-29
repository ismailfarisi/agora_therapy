import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
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
  title: "MindGood - Multilingual Mental Health Support",
  description:
    "Connect with psychologists who speak your language. Professional mental health support in Malayalam, Tamil, Hindi, Telugu, and Kannada.",
  keywords:
    "mental health, psychologist, counseling, therapy, Malayalam, Tamil, Hindi, Telugu, Kannada, job stress, career building, family orientation, learning disabilities, dyslexia",
  icons: {
    icon: "/mindgood.ico",
    apple: "/Mindgood.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/mindgood.ico" />
        <link rel="icon" href="/Logo.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
