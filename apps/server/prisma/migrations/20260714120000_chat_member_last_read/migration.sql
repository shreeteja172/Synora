-- AlterTable
ALTER TABLE "chat_member" ADD COLUMN "lastReadAt" TIMESTAMP(3);

-- Backfill so existing history is not shown as unread
UPDATE "chat_member" SET "lastReadAt" = CURRENT_TIMESTAMP WHERE "lastReadAt" IS NULL;

-- CreateIndex
CREATE INDEX "message_chatId_createdAt_idx" ON "message"("chatId", "createdAt");
