-- DropForeignKey
ALTER TABLE "public"."block_info" DROP CONSTRAINT "block_info_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."password_recoveries" DROP CONSTRAINT "password_recoveries_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."posts" DROP CONSTRAINT "posts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."session_user" DROP CONSTRAINT "session_user_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_confirmations" DROP CONSTRAINT "user_confirmations_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_providers" DROP CONSTRAINT "user_providers_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."user_confirmations" ADD CONSTRAINT "user_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_recoveries" ADD CONSTRAINT "password_recoveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_providers" ADD CONSTRAINT "user_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_user" ADD CONSTRAINT "session_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."block_info" ADD CONSTRAINT "block_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
