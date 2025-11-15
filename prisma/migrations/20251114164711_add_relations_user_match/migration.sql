-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BingoBoard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "marks" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BingoBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BingoBoard" ("board", "id", "marks", "updatedAt", "userId") SELECT "board", "id", "marks", "updatedAt", "userId" FROM "BingoBoard";
DROP TABLE "BingoBoard";
ALTER TABLE "new_BingoBoard" RENAME TO "BingoBoard";
CREATE UNIQUE INDEX "BingoBoard_userId_key" ON "BingoBoard"("userId");
CREATE TABLE "new_BingoParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BingoParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "BingoMatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BingoParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BingoParticipant" ("id", "joinedAt", "matchId", "userId") SELECT "id", "joinedAt", "matchId", "userId" FROM "BingoParticipant";
DROP TABLE "BingoParticipant";
ALTER TABLE "new_BingoParticipant" RENAME TO "BingoParticipant";
CREATE UNIQUE INDEX "BingoParticipant_matchId_userId_key" ON "BingoParticipant"("matchId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
