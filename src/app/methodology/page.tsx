import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust Methodology",
  description: "How HedgeScope scores information sources by trustworthiness — from official SEC filings to social media posts.",
};

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white mb-6">
        Trust Methodology
      </h1>

      <div className="space-y-8 text-sm font-mono text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-sans font-semibold text-white mb-3">
            Why Trust Scoring?
          </h2>
          <p className="text-gray-400">
            Financial information varies wildly in reliability. A SEC filing is
            a legal document; a tweet is an opinion. HedgeScope assigns every
            piece of information a trust tier so you can weight sources
            appropriately.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-sans font-semibold text-white mb-3">
            Trust Tiers
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                TIER 1
              </span>
              <div>
                <div className="text-white font-semibold mb-1">
                  Official Filing / Primary Source
                </div>
                <p className="text-gray-400">
                  SEC filings (13F, 10-K, 8-K), fund letters, earnings
                  transcripts, official press releases. These are legal
                  documents with accountability.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 whitespace-nowrap">
                TIER 2
              </span>
              <div>
                <div className="text-white font-semibold mb-1">
                  Established Financial Press
                </div>
                <p className="text-gray-400">
                  Reuters, Bloomberg, Financial Times, Wall Street Journal,
                  CNBC. Professional journalists with editorial oversight and
                  fact-checking processes.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30 whitespace-nowrap">
                TIER 3
              </span>
              <div>
                <div className="text-white font-semibold mb-1">
                  Analyst & Industry Commentary
                </div>
                <p className="text-gray-400">
                  Seeking Alpha, institutional research notes, analyst reports.
                  Expert analysis but may carry biases or conflicts of interest.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-gray-700/50 text-gray-500 border border-gray-600/30 whitespace-nowrap">
                TIER 4
              </span>
              <div>
                <div className="text-white font-semibold mb-1">
                  Aggregator / Blog
                </div>
                <p className="text-gray-400">
                  Business Insider, Yahoo Finance, ZeroHedge, financial blogs.
                  Often aggregating or repackaging information from other
                  sources. Quality varies significantly.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 whitespace-nowrap">
                TIER 5
              </span>
              <div>
                <div className="text-white font-semibold mb-1">
                  Social / Unverified
                </div>
                <p className="text-gray-400">
                  Twitter/X, Reddit, StockTwits, forums. No editorial oversight.
                  May contain valuable signal but also significant noise,
                  manipulation, and misinformation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-sans font-semibold text-white mb-3">
            How to Use This
          </h2>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>
              Weight Tier 1-2 sources heavily when making decisions
            </li>
            <li>
              Use Tier 3 for context and analysis, but verify key claims
            </li>
            <li>
              Treat Tier 4-5 as signal detection — interesting leads that
              require verification from higher-tier sources
            </li>
            <li>
              Never act on Tier 5 information alone
            </li>
          </ul>
        </section>

        <section className="border-t border-gray-800 pt-6">
          <p className="text-gray-500 text-xs">
            <strong className="text-gray-400">Disclaimer:</strong> HedgeScope
            is an informational tool, not investment advice. Trust tier
            assignments are editorial judgments and may not reflect the accuracy
            of any specific article. Always do your own research and consult
            qualified financial advisors before making investment decisions.
          </p>
        </section>
      </div>
    </div>
  );
}
