const FNG_API = "https://api.alternative.me/fng/";
const COINGECKO_API = "https://api.coingecko.com/api/v3";

export type FearGreedPoint = {
  date: string; // YYYY-MM-DD
  value: number;
  classification: string;
};

export type PricePoint = {
  date: string; // YYYY-MM-DD
  price: number;
};

function toDateKey(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

/** Fetches up to `limit` days of historical Fear & Greed Index values (most recent first). */
export async function fetchFearGreedHistory(limit: number): Promise<FearGreedPoint[]> {
  const res = await fetch(`${FNG_API}?limit=${limit}&format=json`);
  if (!res.ok) throw new Error(`Fear & Greed API failed: ${res.status}`);
  const json = (await res.json()) as {
    data: { value: string; value_classification: string; timestamp: string }[];
  };
  return json.data.map((d) => ({
    date: toDateKey(Number(d.timestamp)),
    value: Number(d.value),
    classification: d.value_classification,
  }));
}

/** Fetches the single most recent Fear & Greed Index reading. */
export async function fetchFearGreedLatest(): Promise<FearGreedPoint> {
  const [latest] = await fetchFearGreedHistory(1);
  return latest;
}

/** Fetches daily closing prices for a CoinGecko coin id over the last `days` days. */
export async function fetchDailyPriceHistory(
  coinId: "bitcoin" | "ethereum",
  days: number
): Promise<PricePoint[]> {
  // Note: CoinGecko's free tier restricts the `interval` param to paid plans.
  // For days > 90 the API already returns daily granularity automatically.
  const res = await fetch(
    `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
  );
  if (!res.ok) throw new Error(`CoinGecko API failed for ${coinId}: ${res.status}`);
  const json = (await res.json()) as { prices: [number, number][] };
  return json.prices.map(([timestampMs, price]) => ({
    date: new Date(timestampMs).toISOString().slice(0, 10),
    price,
  }));
}

export type CurrentPrice = { priceUsd: number; change24h: number };

/** Fetches current price + 24h change for BTC and ETH in a single call. */
export async function fetchCurrentPrices(): Promise<{ btc: CurrentPrice; eth: CurrentPrice }> {
  const res = await fetch(
    `${COINGECKO_API}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`
  );
  if (!res.ok) throw new Error(`CoinGecko simple price API failed: ${res.status}`);
  const json = (await res.json()) as {
    bitcoin: { usd: number; usd_24h_change: number };
    ethereum: { usd: number; usd_24h_change: number };
  };
  return {
    btc: { priceUsd: json.bitcoin.usd, change24h: json.bitcoin.usd_24h_change },
    eth: { priceUsd: json.ethereum.usd, change24h: json.ethereum.usd_24h_change },
  };
}
