export const SEC_USER_AGENT = "HedgeScope ian@example.com";

export const SEC_HEADERS = {
  "User-Agent": SEC_USER_AGENT,
  Accept: "application/json",
};

// SEC EDGAR rate limit: 10 requests/second
export function delay(ms: number = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
