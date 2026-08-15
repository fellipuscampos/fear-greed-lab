-- CreateTable
CREATE TABLE "SentimentSnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fearGreedValue" INTEGER NOT NULL,
    "fearGreedClassification" TEXT NOT NULL,
    "btcPriceUsd" DOUBLE PRECISION NOT NULL,
    "ethPriceUsd" DOUBLE PRECISION NOT NULL,
    "btcChange24h" DOUBLE PRECISION NOT NULL,
    "ethChange24h" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentimentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SentimentSnapshot_date_key" ON "SentimentSnapshot"("date");
