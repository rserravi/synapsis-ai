-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- Seed a default user to satisfy the userId requirement
INSERT INTO "public"."users" ("id", "email", "password", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000000', 'default@example.com', 'password', CURRENT_TIMESTAMP);

-- Add userId column in multiple steps
ALTER TABLE "public"."cards" ADD COLUMN "userId" TEXT;
UPDATE "public"."cards" SET "userId" = '00000000-0000-0000-0000-000000000000';
ALTER TABLE "public"."cards" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "public"."cards" ADD CONSTRAINT "cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_tags" ADD CONSTRAINT "card_tags_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_tags" ADD CONSTRAINT "card_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
