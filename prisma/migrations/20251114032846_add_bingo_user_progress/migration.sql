-- CreateTable
CREATE TABLE "BingoUserProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calls" TEXT NOT NULL,
    "stoppedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
