-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BingoParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "BingoParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "BingoMatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BingoParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BingoParticipant" ("id", "joinedAt", "matchId", "userId") SELECT "id", "joinedAt", "matchId", "userId" FROM "BingoParticipant";
DROP TABLE "BingoParticipant";
ALTER TABLE "new_BingoParticipant" RENAME TO "BingoParticipant";
CREATE UNIQUE INDEX "BingoParticipant_matchId_userId_key" ON "BingoParticipant"("matchId", "userId");
CREATE UNIQUE INDEX "BingoParticipant_userId_active_key" ON "BingoParticipant"("userId", "active");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
