import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { fetchDailyPriceHistory, fetchFearGreedHistory } from "../src/lib/sources";
import { pctChange } from "../src/lib/pct-change";

const DAYS = Number(process.env.BACKFILL_DAYS ?? 365);

async function main() {
  console.log(`Backfilling ~${DAYS} days of Fear & Greed + BTC/ETH price history...`);

  const [fearGreedHistory, btcHistory, ethHistory] = await Promise.all([
    fetchFearGreedHistory(DAYS),
    fetchDailyPriceHistory("bitcoin", DAYS),
    fetchDailyPriceHistory("ethereum", DAYS),
  ]);

  const btcByDate = new Map(btcHistory.map((p) => [p.date, p.price]));
  const ethByDate = new Map(ethHistory.map((p) => [p.date, p.price]));
  const btcDatesSorted = btcHistory.map((p) => p.date).sort();
  const ethDatesSorted = ethHistory.map((p) => p.date).sort();

  let written = 0;
  let skipped = 0;

  for (const point of fearGreedHistory) {
    const btcPrice = btcByDate.get(point.date);
    const ethPrice = ethByDate.get(point.date);
    if (btcPrice === undefined || ethPrice === undefined) {
      skipped++;
      continue;
    }

    const btcIdx = btcDatesSorted.indexOf(point.date);
    const ethIdx = ethDatesSorted.indexOf(point.date);
    const prevBtcPrice = btcIdx > 0 ? btcByDate.get(btcDatesSorted[btcIdx - 1]) : undefined;
    const prevEthPrice = ethIdx > 0 ? ethByDate.get(ethDatesSorted[ethIdx - 1]) : undefined;

    await prisma.sentimentSnapshot.upsert({
      where: { date: new Date(point.date) },
      create: {
        date: new Date(point.date),
        fearGreedValue: point.value,
        fearGreedClassification: point.classification,
        btcPriceUsd: btcPrice,
        ethPriceUsd: ethPrice,
        btcChange24h: prevBtcPrice ? pctChange(prevBtcPrice, btcPrice) : 0,
        ethChange24h: prevEthPrice ? pctChange(prevEthPrice, ethPrice) : 0,
      },
      update: {
        fearGreedValue: point.value,
        fearGreedClassification: point.classification,
        btcPriceUsd: btcPrice,
        ethPriceUsd: ethPrice,
        btcChange24h: prevBtcPrice ? pctChange(prevBtcPrice, btcPrice) : 0,
        ethChange24h: prevEthPrice ? pctChange(prevEthPrice, ethPrice) : 0,
      },
    });
    written++;
  }

  console.log(`Done. Wrote ${written} snapshots, skipped ${skipped} (missing price data).`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
