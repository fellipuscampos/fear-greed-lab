import { prisma } from "@/lib/prisma";
import { computeInsights } from "@/lib/insights";
import { SentimentChart } from "@/components/SentimentChart";
import { FearGreedBadge, StatCard } from "@/components/StatCard";

export const revalidate = 3600;

function formatCorrelation(r: number): string {
  const sign = r >= 0 ? "+" : "";
  return `${sign}${r.toFixed(2)}`;
}

function interpret(r: number): string {
  const abs = Math.abs(r);
  if (abs < 0.1) return "praticamente nenhuma relação";
  if (abs < 0.3) return "relação fraca";
  if (abs < 0.5) return "relação moderada";
  return "relação forte";
}

export default async function Home() {
  const snapshots = await prisma.sentimentSnapshot.findMany({
    orderBy: { date: "asc" },
  });

  if (snapshots.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold mb-2">Fear & Greed Lab</h1>
        <p className="text-neutral-400">
          Nenhum dado ainda. Rode <code className="text-neutral-200">npm run backfill</code>{" "}
          para popular o histórico, ou aguarde a primeira ingestão diária.
        </p>
      </main>
    );
  }

  const insights = computeInsights(snapshots);
  const latest = snapshots[snapshots.length - 1];
  const chartData = snapshots.map((s) => ({
    date: s.date.toISOString().slice(0, 10),
    fearGreedValue: s.fearGreedValue,
    btcPriceUsd: s.btcPriceUsd,
  }));

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Fear & Greed Lab</h1>
        <p className="text-neutral-400 mt-2">
          O sentimento do mercado cripto realmente antecipa o preço, ou só reage a ele? Cruzo o{" "}
          <a
            href="https://alternative.me/crypto/fear-and-greed-index/"
            className="underline decoration-neutral-600 hover:decoration-neutral-300"
            target="_blank"
            rel="noreferrer"
          >
            Fear &amp; Greed Index
          </a>{" "}
          com os preços de BTC e ETH ({snapshots.length} dias de histórico) e calculo a
          correlação real entre os dois.
        </p>
      </header>

      <section className="mb-10">
        <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
          Leitura atual ({latest.date.toISOString().slice(0, 10)})
        </p>
        <FearGreedBadge value={latest.fearGreedValue} classification={latest.fearGreedClassification} />
      </section>

      <section className="mb-10">
        <SentimentChart data={chartData} />
      </section>

      <section className="mb-10">
        <h2 className="text-sm uppercase tracking-wide text-neutral-400 mb-3">
          Correlação de Pearson
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Sentimento × BTC (mesmo dia)"
            value={formatCorrelation(insights.btc.sameDay)}
            hint={interpret(insights.btc.sameDay)}
          />
          <StatCard
            label="Sentimento hoje → BTC amanhã"
            value={formatCorrelation(insights.btc.nextDay)}
            hint={interpret(insights.btc.nextDay)}
          />
          <StatCard
            label="Sentimento × ETH (mesmo dia)"
            value={formatCorrelation(insights.eth.sameDay)}
            hint={interpret(insights.eth.sameDay)}
          />
          <StatCard
            label="Sentimento hoje → ETH amanhã"
            value={formatCorrelation(insights.eth.nextDay)}
            hint={interpret(insights.eth.nextDay)}
          />
        </div>
      </section>

      <footer className="text-xs text-neutral-500 border-t border-neutral-800 pt-6">
        <p>
          Correlação não é causalidade — e um coeficiente de Pearson não captura relações
          não-lineares. Este projeto é uma exploração, não uma recomendação de investimento.
        </p>
        <p className="mt-1">
          Dados: <span className="text-neutral-400">alternative.me</span> (Fear &amp; Greed Index) e{" "}
          <span className="text-neutral-400">CoinGecko</span> (preços). Atualização diária.
        </p>
      </footer>
    </main>
  );
}
