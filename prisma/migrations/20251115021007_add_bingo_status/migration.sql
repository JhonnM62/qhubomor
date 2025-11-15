/*
  Warnings:

  - A unique constraint covering the columns `[userId,active]` on the table `BingoParticipant` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BingoMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "winnerIds" TEXT,
    "calls" TEXT,
    "configId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'EN_ESPERA'
);
INSERT INTO "new_BingoMatch" ("calls", "configId", "createdAt", "endedAt", "id", "startedAt", "status", "winnerIds") SELECT "calls", "configId", "createdAt", "endedAt", "id", "startedAt", "status", "winnerIds" FROM "BingoMatch";
DROP TABLE "BingoMatch";
ALTER TABLE "new_BingoMatch" RENAME TO "BingoMatch";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BingoParticipant_userId_active_key" ON "BingoParticipant"("userId", "active");
