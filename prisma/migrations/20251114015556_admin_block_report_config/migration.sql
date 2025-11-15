-- AlterTable
ALTER TABLE "BingoMatch" ADD COLUMN "configId" TEXT;

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BingoConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ballsNumber" INTEGER NOT NULL DEFAULT 75,
    "roundDuration" INTEGER NOT NULL DEFAULT 300,
    "prizes" TEXT,
    "restrictions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "dob" DATETIME NOT NULL,
    "passwordHash" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" TEXT,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "dob", "email", "emailVerified", "facebookUrl", "id", "image", "instagramUrl", "name", "passwordHash", "roleId", "tiktokUrl") SELECT "createdAt", "dob", "email", "emailVerified", "facebookUrl", "id", "image", "instagramUrl", "name", "passwordHash", "roleId", "tiktokUrl" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
