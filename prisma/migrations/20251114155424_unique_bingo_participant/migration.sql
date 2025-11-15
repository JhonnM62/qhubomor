/*
  Warnings:

  - A unique constraint covering the columns `[matchId,userId]` on the table `BingoParticipant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BingoParticipant_matchId_userId_key" ON "BingoParticipant"("matchId", "userId");
