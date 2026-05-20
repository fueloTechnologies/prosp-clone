import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { startCron } from "@/lib/cron";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lin-C - AI-Powered LinkedIn Outreach",
  description: "Automate your LinkedIn outreach with AI personalization",
};

// ✅ Start cron on server startup
startCron();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
