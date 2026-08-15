import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCurrentPrices, fetchFearGreedLatest } from "@/lib/sources";

/**
 * Daily ingestion endpoint, meant to be hit by a scheduled job (Vercel Cron /
 * GitHub Actions). Fetches today's Fear & Greed reading + BTC/ETH prices and
 * upserts a single row for the day.
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

  const snapshot = await prisma.sentimentSnapshot.upsert({
    where: { date: new Date(fearGreed.date) },
    create: {
      date: new Date(fearGreed.date),
      fearGreedValue: fearGreed.value,
      fearGreedClassification: fearGreed.classification,
      btcPriceUsd: prices.btc.priceUsd,
      ethPriceUsd: prices.eth.priceUsd,
      btcChange24h: prices.btc.change24h,
      ethChange24h: prices.eth.change24h,
    },
    update: {
      fearGreedValue: fearGreed.value,
      fearGreedClassification: fearGreed.classification,
      btcPriceUsd: prices.btc.priceUsd,
      ethPriceUsd: prices.eth.priceUsd,
      btcChange24h: prices.btc.change24h,
      ethChange24h: prices.eth.change24h,
    },
  });

  return NextResponse.json({ ok: true, snapshot });
}
