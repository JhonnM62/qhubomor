-- CreateTable
CREATE TABLE "BingoWinner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "qrData" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "calls" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre" TEXT,
    "cedula" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "edadConfirmada" BOOLEAN NOT NULL DEFAULT false,
    "cardPhotoPath" TEXT,
    "promoCodeId" TEXT,
    CONSTRAINT "BingoWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BingoWinner_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BingoWinner_code_key" ON "BingoWinner"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BingoWinner_promoCodeId_key" ON "BingoWinner"("promoCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "BingoWinner_matchId_userId_key" ON "BingoWinner"("matchId", "userId");
