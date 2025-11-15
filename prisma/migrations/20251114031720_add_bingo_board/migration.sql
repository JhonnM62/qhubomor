-- CreateTable
CREATE TABLE "BingoBoard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "marks" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BingoBoard_userId_key" ON "BingoBoard"("userId");
