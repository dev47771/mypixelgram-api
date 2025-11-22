/*
  Warnings:

  - A unique constraint covering the columns `[providerUserId]` on the table `user_providers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_providers_providerUserId_key" ON "public"."user_providers"("providerUserId");
