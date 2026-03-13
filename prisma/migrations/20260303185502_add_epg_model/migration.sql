-- CreateTable
CREATE TABLE "EpgProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "stop" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "EpgProgram_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EpgProgram_channelId_idx" ON "EpgProgram"("channelId");

-- CreateIndex
CREATE INDEX "EpgProgram_start_stop_idx" ON "EpgProgram"("start", "stop");
