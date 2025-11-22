/*
  Warnings:

  - Added the required column `deviceId` to the `session_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."session_user" ADD COLUMN     "deviceId" TEXT NOT NULL;
