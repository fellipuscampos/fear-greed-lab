import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCurrentPrices, fetchFearGreedLatest } from "@/lib/sources";
import { pctChange } from "@/lib/pct-change";

/**
 * Daily ingestion endpoint, meant to be hit by a scheduled job (Vercel Cron /
 * GitHub Actions). Fetches today's Fear & Greed reading + BTC/ETH prices and
 * upserts a single row for the day.
 *
 * `btcChange24h`/`ethChange24h` are computed close-to-close against the most
 * recent stored snapshot (same method `scripts/backfill.ts` uses), not
 * CoinGecko's own rolling `usd_24h_change` — the two aren't the same measure
 * (calendar-day close-to-close vs. trailing 24h from request time), and
 * mixing them in the same column would quietly corrupt the correlation math.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const [fearGreed, prices] = await Promise.all([
    fetchFearGreedLatest(),
    fetchCurrentPrices(),
  ]);

  const today = new Date(fearGreed.date);
  const previous = await prisma.sentimentSnapshot.findFirst({
    where: { date: { lt: today } },
    orderBy: { date: "desc" },
  });

  const btcChange24h = previous ? pctChange(previous.btcPriceUsd, prices.btc.priceUsd) : 0;
  const ethChange24h = previous ? pctChange(previous.ethPriceUsd, prices.eth.priceUsd) : 0;

  const snapshot = await prisma.sentimentSnapshot.upsert({
    where: { date: today },
    create: {
      date: today,
      fearGreedValue: fearGreed.value,
      fearGreedClassification: fearGreed.classification,
      btcPriceUsd: prices.btc.priceUsd,
      ethPriceUsd: prices.eth.priceUsd,
      btcChange24h,
      ethChange24h,
    },
    update: {
      fearGreedValue: fearGreed.value,
      fearGreedClassification: fearGreed.classification,
      btcPriceUsd: prices.btc.priceUsd,
      ethPriceUsd: prices.eth.priceUsd,
      btcChange24h,
      ethChange24h,
    },
  });

  return NextResponse.json({ ok: true, snapshot });
}
