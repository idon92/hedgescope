import { getCrossFundHoldings } from "@/lib/queries";
import CrossFundTable from "./CrossFundTable";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function HoldingsPage() {
  const holdings = await getCrossFundHoldings();

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white mb-2">
        Cross-Fund Holdings
      </h1>
      <p className="text-sm text-gray-400 font-mono mb-8">
        Most commonly held stocks across all tracked hedge funds
      </p>
      <CrossFundTable holdings={holdings} />
    </div>
  );
}
