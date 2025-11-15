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
    "status" TEXT NOT NULL DEFAULT 'PENDING'
);
INSERT INTO "new_BingoMatch" ("calls", "configId", "createdAt", "endedAt", "id", "startedAt", "winnerIds") SELECT "calls", "configId", "createdAt", "endedAt", "id", "startedAt", "winnerIds" FROM "BingoMatch";
DROP TABLE "BingoMatch";
ALTER TABLE "new_BingoMatch" RENAME TO "BingoMatch";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
