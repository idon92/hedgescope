import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HedgeScope — Hedge Fund Holdings Intelligence",
  description:
    "Track hedge fund 13F holdings, aggregate financial news, and score information sources by trustworthiness.",
  openGraph: {
    title: "HedgeScope — Hedge Fund Holdings Intelligence",
    description:
      "Track hedge fund 13F holdings, aggregate financial news, and score information sources by trustworthiness.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-gray-200 min-h-screen`}
      >
        <nav className="border-b border-gray-800/50 sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <a href="/" className="flex items-center gap-2">
                <span className="text-accent font-mono font-bold text-lg">HS</span>
                <span className="font-sans font-semibold text-white hidden sm:inline">
                  HedgeScope
                </span>
              </a>
              <div className="flex items-center gap-6 text-sm font-mono">
                <a
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Funds
                </a>
                <a
                  href="/holdings"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Holdings
                </a>
                <a
                  href="/methodology"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Methodology
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-800/50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-xs text-gray-500 font-mono text-center">
              Not investment advice. Data sourced from SEC EDGAR and public news
              sources. Holdings data may be delayed up to 45 days per SEC filing
              requirements.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
