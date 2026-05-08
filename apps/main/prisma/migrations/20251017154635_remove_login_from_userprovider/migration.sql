/*
  Warnings:

  - You are about to drop the column `login` on the `user_providers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."user_providers_login_key";

-- AlterTable
ALTER TABLE "public"."user_providers" DROP COLUMN "login";
