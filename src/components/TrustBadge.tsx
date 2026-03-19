import {
  TrustTier,
  TRUST_TIER_LABELS,
  TRUST_TIER_COLORS,
} from "@/lib/trust-tiers";

interface TrustBadgeProps {
  tier: number;
  size?: "sm" | "md";
}

export default function TrustBadge({ tier, size = "sm" }: TrustBadgeProps) {
  const tierEnum = tier as TrustTier;
  const label = TRUST_TIER_LABELS[tierEnum] || "Unknown";
  const colors = TRUST_TIER_COLORS[tierEnum] || TRUST_TIER_COLORS[TrustTier.TIER_4];

  const sizeClasses =
    size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-bold border whitespace-nowrap ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {label}
    </span>
  );
}
