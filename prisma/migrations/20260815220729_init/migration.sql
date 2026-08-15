-- CreateTable
CREATE TABLE "SentimentSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "fearGreedValue" INTEGER NOT NULL,
    "fearGreedClassification" TEXT NOT NULL,
    "btcPriceUsd" REAL NOT NULL,
    "ethPriceUsd" REAL NOT NULL,
    "btcChange24h" REAL NOT NULL,
    "ethChange24h" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "SentimentSnapshot_date_key" ON "SentimentSnapshot"("date");
