/*
  Warnings:

  - You are about to drop the `BingoMatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BingoMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `board` on the `BingoBoard` table. All the data in the column will be lost.
  - You are about to drop the column `marks` on the `BingoBoard` table. All the data in the column will be lost.
  - You are about to drop the column `ballsNumber` on the `BingoConfig` table. All the data in the column will be lost.
  - You are about to drop the column `prizes` on the `BingoConfig` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions` on the `BingoConfig` table. All the data in the column will be lost.
  - You are about to drop the column `roundDuration` on the `BingoConfig` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `BingoParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `matchId` on the `BingoParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `board` on the `BingoUserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `calls` on the `BingoUserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `marks` on the `BingoUserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `matchId` on the `BingoUserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `stoppedAt` on the `BingoUserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `BingoUserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `board` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `calls` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `cardPhotoPath` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `cedula` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `edadConfirmada` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `matchId` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `promoCodeId` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `qrData` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `BingoWinner` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `GameAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `game` on the `GameAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `limit` on the `GameAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `used` on the `GameAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `GameProgress` table. All the data in the column will be lost.
  - You are about to drop the column `totalWins` on the `GameProgress` table. All the data in the column will be lost.
  - You are about to drop the column `generatedAt` on the `PromoCode` table. All the data in the column will be lost.
  - You are about to drop the column `prizeType` on the `PromoCode` table. All the data in the column will be lost.
  - You are about to drop the column `qrData` on the `PromoCode` table. All the data in the column will be lost.
  - You are about to drop the column `redeemedAt` on the `PromoCode` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Role` table. All the data in the column will be lost.
  - Added the required column `gameProgressId` to the `BingoUserProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `markedNumbers` to the `BingoUserProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pattern` to the `BingoWinner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameName` to the `GameAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `won` to the `GameAttempt` table without a default value. This is not possible if the table is not empty.
  - Made the column `expiresAt` on table `PromoCode` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BingoMatch";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BingoMessage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Report";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'Q''hubo Mor',
    "description" TEXT NOT NULL DEFAULT '¡Síguenos en nuestras redes sociales!',
    "logoUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "whatsappUrl" TEXT,
    "websiteUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminBlockReportConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockedUntil" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BingoBoard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "boardData" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BingoBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BingoBoard" ("id", "updatedAt", "userId") SELECT "id", "updatedAt", "userId" FROM "BingoBoard";
DROP TABLE "BingoBoard";
ALTER TABLE "new_BingoBoard" RENAME TO "BingoBoard";
CREATE UNIQUE INDEX "BingoBoard_userId_key" ON "BingoBoard"("userId");
CREATE TABLE "new_BingoConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "currentNumber" INTEGER,
    "drawnNumbers" TEXT NOT NULL DEFAULT '[]',
    "winningPatterns" TEXT NOT NULL DEFAULT '[]',
    "startTime" DATETIME,
    "endTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_BingoConfig" ("createdAt", "id") SELECT "createdAt", "id" FROM "BingoConfig";
DROP TABLE "BingoConfig";
ALTER TABLE "new_BingoConfig" RENAME TO "BingoConfig";
CREATE TABLE "new_BingoParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BingoParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BingoParticipant" ("id", "joinedAt", "userId") SELECT "id", "joinedAt", "userId" FROM "BingoParticipant";
DROP TABLE "BingoParticipant";
ALTER TABLE "new_BingoParticipant" RENAME TO "BingoParticipant";
CREATE UNIQUE INDEX "BingoParticipant_userId_key" ON "BingoParticipant"("userId");
CREATE TABLE "new_BingoUserProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameProgressId" TEXT NOT NULL,
    "markedNumbers" TEXT NOT NULL,
    CONSTRAINT "BingoUserProgress_gameProgressId_fkey" FOREIGN KEY ("gameProgressId") REFERENCES "GameProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BingoUserProgress" ("id") SELECT "id" FROM "BingoUserProgress";
DROP TABLE "BingoUserProgress";
ALTER TABLE "new_BingoUserProgress" RENAME TO "BingoUserProgress";
CREATE UNIQUE INDEX "BingoUserProgress_gameProgressId_key" ON "BingoUserProgress"("gameProgressId");
CREATE TABLE "new_BingoWinner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "prize" TEXT,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BingoWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BingoWinner" ("createdAt", "id", "userId") SELECT "createdAt", "id", "userId" FROM "BingoWinner";
DROP TABLE "BingoWinner";
ALTER TABLE "new_BingoWinner" RENAME TO "BingoWinner";
CREATE TABLE "new_GameAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "won" BOOLEAN NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GameAttempt" ("id", "userId") SELECT "id", "userId" FROM "GameAttempt";
DROP TABLE "GameAttempt";
ALTER TABLE "new_GameAttempt" RENAME TO "GameAttempt";
CREATE TABLE "new_GameProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "game1Completed" BOOLEAN NOT NULL DEFAULT false,
    "game2Completed" BOOLEAN NOT NULL DEFAULT false,
    "game3Completed" BOOLEAN NOT NULL DEFAULT false,
    "game4Completed" BOOLEAN NOT NULL DEFAULT false,
    "game5Completed" BOOLEAN NOT NULL DEFAULT false,
    "canClaimPrize" BOOLEAN NOT NULL DEFAULT false,
    "prizeClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" DATETIME,
    CONSTRAINT "GameProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GameProgress" ("game1Completed", "game2Completed", "game3Completed", "game4Completed", "game5Completed", "id", "userId") SELECT "game1Completed", "game2Completed", "game3Completed", "game4Completed", "game5Completed", "id", "userId" FROM "GameProgress";
DROP TABLE "GameProgress";
ALTER TABLE "new_GameProgress" RENAME TO "GameProgress";
CREATE UNIQUE INDEX "GameProgress_userId_key" ON "GameProgress"("userId");
CREATE TABLE "new_PromoCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PromoCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PromoCode" ("code", "expiresAt", "id", "redeemed", "userId") SELECT "code", "expiresAt", "id", "redeemed", "userId" FROM "PromoCode";
DROP TABLE "PromoCode";
ALTER TABLE "new_PromoCode" RENAME TO "PromoCode";
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
CREATE TABLE "new_Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);
INSERT INTO "new_Role" ("id", "name") SELECT "id", "name" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
