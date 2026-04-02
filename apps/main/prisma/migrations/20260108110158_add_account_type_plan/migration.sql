-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('PERSONAL', 'BUSINESS');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "accountType" "public"."AccountType" NOT NULL DEFAULT 'PERSONAL',
ADD COLUMN     "planName" TEXT,
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMPTZ;
