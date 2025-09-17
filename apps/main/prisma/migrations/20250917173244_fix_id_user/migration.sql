/*
  Warnings:

  - The primary key for the `user_providers` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "public"."user_providers" DROP CONSTRAINT "user_providers_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_providers_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_providers_id_seq";
