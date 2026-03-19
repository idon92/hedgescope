export const TRACKED_FUNDS = [
  { name: "Bridgewater Associates", cik: "0001350694" },
  { name: "Citadel Advisors", cik: "0001423053" },
  { name: "Renaissance Technologies", cik: "0001037389" },
  { name: "Situational Awareness LP", cik: "0002045724" },
] as const;

export type TrackedFund = (typeof TRACKED_FUNDS)[number];
