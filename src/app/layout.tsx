import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "HedgeScope — Hedge Fund Holdings Intelligence",
    template: "%s | HedgeScope",
  },
  description:
    "Track hedge fund 13F holdings, aggregate financial news, and score information sources by trustworthiness. Data sourced from SEC EDGAR.",
  keywords: [
    "hedge fund",
    "13F",
    "SEC",
    "EDGAR",
    "holdings",
    "portfolio",
    "investments",
    "financial news",
  ],
  authors: [{ name: "HedgeScope" }],
  openGraph: {
    title: "HedgeScope — Hedge Fund Holdings Intelligence",
    description:
      "Track hedge fund 13F holdings, aggregate financial news, and score information sources by trustworthiness.",
    type: "website",
    siteName: "HedgeScope",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HedgeScope — Hedge Fund Holdings Intelligence",
    description:
      "Track hedge fund 13F holdings, aggregate financial news, and score information sources by trustworthiness.",
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-gray-200 min-h-screen flex flex-col`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <nav className="border-b border-gray-800/50 sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <a href="/" className="flex items-center gap-2 group">
                <span className="text-accent font-mono font-bold text-lg group-hover:opacity-80 transition-opacity">
                  HS
                </span>
                <span className="font-sans font-semibold text-white hidden sm:inline group-hover:opacity-80 transition-opacity">
                  HedgeScope
                </span>
              </a>
              <div className="flex items-center gap-4 sm:gap-6 text-sm font-mono">
                <a
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:text-accent"
                >
                  Funds
                </a>
                <a
                  href="/holdings"
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:text-accent"
                >
                  Holdings
                </a>
                <a
                  href="/methodology"
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:text-accent"
                >
                  Methodology
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          {children}
        </main>
        <footer className="border-t border-gray-800/50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-xs text-gray-500 font-mono text-center max-w-2xl mx-auto leading-relaxed">
              Not investment advice. Data sourced from SEC EDGAR and public news
              sources. Holdings data may be delayed up to 45 days per SEC filing
              requirements. Trust tier assignments are editorial judgments.
              Always do your own research.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
