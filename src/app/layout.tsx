import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deloitte Digital - Shopify Admin Assistant",
  description: "AI-powered admin app with MCP tools",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://unpkg.com/@shopify/app-bridge@4"
          dangerouslySetInnerHTML={{
            __html: `
            if (window.top === window.self) {
              // Not in iframe, allow normal behavior
            } else {
              // In iframe, initialize App Bridge
              document.addEventListener('DOMContentLoaded', function() {
                if (window.shopify && window.shopify.environment) {
                  // App Bridge will be initialized by the Providers component
                }
              });
            }
          `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
