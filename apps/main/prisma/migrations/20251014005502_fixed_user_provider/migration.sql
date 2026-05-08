/*
  Warnings:

  - You are about to drop the column `profile` on the `user_providers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[login]` on the table `user_providers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `user_providers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `user_providers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."user_providers" DROP COLUMN "profile",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "login" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_providers_login_key" ON "public"."user_providers"("login");

-- CreateIndex
CREATE UNIQUE INDEX "user_providers_email_key" ON "public"."user_providers"("email");
