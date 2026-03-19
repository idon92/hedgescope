"use client";

import { useState } from "react";
import HoldingsPieChart from "@/components/HoldingsPieChart";
import FundHoldingsTable from "./FundHoldingsTable";
import type { CategoryBreakdown } from "@/lib/holdings-categories";

export type CategoryTab = "sector" | "cap" | "geography";

interface HoldingRow {
  ticker: string | null;
  companyName: string;
  shares: number;
  marketValueThousands: number;
  weight: number;
  optionType: string | null;
  cusip: string;
  sector: string;
  capCategory: string;
  geography: string;
}

interface FundDashboardProps {
  holdings: HoldingRow[];
  categories: {
    bySector: CategoryBreakdown[];
    byCap: CategoryBreakdown[];
    byGeography: CategoryBreakdown[];
  };
}

export default function FundDashboard({
  holdings,
  categories,
}: FundDashboardProps) {
  const [activeTab, setActiveTab] = useState<CategoryTab>("sector");

  return (
    <div className="space-y-8">
      <HoldingsPieChart
        bySector={categories.bySector}
        byCap={categories.byCap}
        byGeography={categories.byGeography}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <FundHoldingsTable holdings={holdings} categoryTab={activeTab} />
    </div>
  );
}
