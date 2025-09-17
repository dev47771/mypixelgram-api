/*
  Warnings:

  - The primary key for the `password_recoveries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_confirmations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."password_recoveries" DROP CONSTRAINT "password_recoveries_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_confirmations" DROP CONSTRAINT "user_confirmations_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_providers" DROP CONSTRAINT "user_providers_userId_fkey";

-- AlterTable
ALTER TABLE "public"."password_recoveries" DROP CONSTRAINT "password_recoveries_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "password_recoveries_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "public"."user_confirmations" DROP CONSTRAINT "user_confirmations_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_confirmations_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "public"."user_providers" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "public"."user_confirmations" ADD CONSTRAINT "user_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_recoveries" ADD CONSTRAINT "password_recoveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_providers" ADD CONSTRAINT "user_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
